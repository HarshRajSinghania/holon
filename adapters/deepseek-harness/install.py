#!/usr/bin/env python3
"""Install the Holon adapter into DeepSeek Harness (idempotent; its own DSH_HOME per instance).

    python3 adapters/deepseek-harness/install.py --holon-home ~/holon \\
        [--dsh /path/to/dsh] [--profile holon] [--model deepseek-flash] \\
        [--base-url <endpoint>] [--api-key-file <file>] \\
        [--register-dsh-home ~/.dsh] [--dry-run]

What it writes, and why each piece is the instance's and not the user's:

1. an isolated DSH home at `$HOLON_HOME/adapters/deepseek-harness/home`, so Holon's employees
   never share the operator's own Harness sessions, skills or credentials;
2. a `holon` profile in that home, initialized from the shipped `headless` template;
3. the `holon-native` bundle, copied into the adapter home and selected by the profile (`dsh
   plugin --profile … add <dir>` both installs and selects a bundle whose `dsh.bundle.patch`
   applies its row);
4. Holon's skills exported to `$DSH_HOME/skills` for the profile outside a run; a run's
   department-resolved skills are registered by the bundle directly from `runs/<id>/skills`;
5. a model selection and, when asked, the DeepSeek API key or base URL in `$DSH_HOME/.env`
   (mode 0600; the key is never printed or passed on a command line);
6. `$DSH_HOME/holon.json` — the home and command the bundle uses outside a kernel-dispatched run;
7. the instance driver `config/drivers/deepseek-harness.toml`, pinning the absolute `dsh`, the
   isolated DSH_HOME and the profile, and validating it before it lands.

`--register-dsh-home` additionally writes `holon.json` into an existing Harness home (for the
operator's own `web` profile), so a plugin installed there can read the organization. It does not
install the bundle into that profile: use the Harness Plugin Manager (`plugin_manager`) for that,
so the profile's own package files stay under its management.
"""

import argparse
import json
import os
import re
import shlex
import shutil
import subprocess
import sys
import tomllib
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[1]
sys.path.insert(0, str(HERE.parent))
import install_lib  # noqa: E402  (R3: one installer seam)

PROFILE = "holon"
DEFAULT_MODEL = "deepseek-flash"
MODEL_PATCH = """# Holon adapter: the model this instance's bodies run on (adapters/deepseek-harness).
- id: agent-default-model
  name: '@deepseek-ai/dsh-agent-default-model'
  config:
    provider: deepseek-official
    model: "{model}"
"""


def _run(argv: list[str], env: dict[str, str], timeout: int = 240) -> str:
    try:
        p = subprocess.run(argv, capture_output=True, text=True, env=env, timeout=timeout)
    except (OSError, subprocess.TimeoutExpired) as e:
        raise install_lib.InstallError(f"{argv[0]} failed to run: {e}") from None
    if p.returncode != 0:
        detail = (p.stderr or p.stdout).strip().splitlines()
        raise install_lib.InstallError(
            f"`{' '.join(argv[:4])}` exited {p.returncode}: {detail[0] if detail else 'no output'}")
    return p.stdout + p.stderr

def _write_env(path: Path, api_key: str | None, base_url: str | None) -> bool:
    """Merge the two keys into the Harness's private .env, preserving every other line."""
    updated = {}
    if api_key is not None:
        if "\n" in api_key or "\r" in api_key:
            raise install_lib.InstallError("the API key file contains a newline; that is not a key")
        updated["DEEPSEEK_API_KEY"] = api_key
    if base_url:
        updated["DEEPSEEK_BASE_URL"] = base_url.rstrip("/")
    if not updated:
        return False
    lines = path.read_text().splitlines() if path.exists() else []
    out, seen = [], set()
    for line in lines:
        m = re.match(r"^([A-Za-z_][A-Za-z0-9_]*)=", line)
        if m and m.group(1) in updated:
            out.append(f"{m.group(1)}={updated[m.group(1)]}")
            seen.add(m.group(1))
        else:
            out.append(line)
    for key, value in updated.items():
        if key not in seen:
            out.append(f"{key}={value}")
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("\n".join(out).rstrip() + "\n")
    path.chmod(0o600)
    return True


def _write_model_patch(path: Path, model: str) -> bool:
    """Select the model in the profile's own patch layer, from the template's `[]` or beside it."""
    if not re.fullmatch(r"[A-Za-z0-9._:/-]+", model):
        raise install_lib.InstallError(f"model {model!r} is not a plain model id")
    text = path.read_text() if path.exists() else "[]\n"
    if re.search(r"(?m)^\s*-?\s*id:\s*agent-default-model\b", text):
        print("model: profile patch already overrides agent-default-model; left unchanged")
        return False
    body = "\n".join(line for line in text.splitlines() if not line.strip().startswith("#")).strip()
    block = MODEL_PATCH.format(model=model)
    path.parent.mkdir(parents=True, exist_ok=True)
    if body in ("", "[]"):
        path.write_text(block)
    else:
        path.write_text(text.rstrip() + "\n\n" + block)
    path.chmod(0o600)
    return True


def _write_operator_config(dsh_home: Path, home: Path, command: list[str]) -> Path:
    """The bundle's out-of-run configuration: which instance, and how to reach its CLI."""
    path = dsh_home / "holon.json"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps({"home": str(home), "command": [str(c) for c in command]}, indent=2) + "\n")
    return path

def _agent_user(home: Path) -> str:
    """The instance's configured agent user, or '' when the trust boundary is off."""
    try:
        cfg = tomllib.loads((home / "holon.toml").read_text())
    except (OSError, tomllib.TOMLDecodeError):
        return ""
    return str((cfg.get("isolation") or {}).get("agent_user") or "")


def _grant_agent_write(dsh_home: Path, home: Path) -> str:
    """Give the configured agent user the home DSH must write (doctor's isolation.reach).

    The directory is created by the kernel user, so under an active boundary the agent user
    cannot create its own sessions or cache: doctor reports `isolation.reach`, and every
    dispatch dies on its first write. The adapter home is the one tree the adapter owns, so
    the grant belongs here rather than in the Chair's [isolation] read list. A default ACL is
    set as well, so directories DSH creates later inherit it.
    """
    agent = _agent_user(home)
    if not agent:
        return "no [isolation] agent_user: the boundary is off and this home is used by the kernel user"
    if not shutil.which("setfacl"):
        return f"setfacl is not installed; grant {agent} x on {dsh_home.parent} and rwX on {dsh_home}"
    # The parent adapter directory is the traverse gate: the boundary's plan denies it, so a
    # grant on the home alone still fails `test -w` (measured live 2026-11-04).
    p1 = subprocess.run(["setfacl", "-m", f"u:{agent}:--x", str(dsh_home.parent)],
                        capture_output=True, text=True)
    p = subprocess.run(["setfacl", "-R", "-m", f"u:{agent}:rwX", str(dsh_home)],
                       capture_output=True, text=True)
    if p1.returncode != 0 or p.returncode != 0:
        why = (p1.stderr or p1.stdout or p.stderr or p.stdout).strip()[:200]
        return f"setfacl failed: {why}"
    for root, dirs, _files in os.walk(dsh_home):
        for d in dirs:
            subprocess.run(["setfacl", "-m", f"d:u:{agent}:rwX", os.path.join(root, d)],
                           capture_output=True, text=True)
    p2 = subprocess.run(["setfacl", "-m", f"d:u:{agent}:rwX", str(dsh_home)],
                        capture_output=True, text=True)
    if p2.returncode != 0:
        return f"setfacl default failed: {(p2.stderr or p2.stdout).strip()[:200]}"
    return f"{agent} can write {dsh_home}"


def _grant_agent_read(plugin_root: Path, home: Path) -> str:
    """Let the agent user read the bundle it loads (and traverse to it)."""
    agent = _agent_user(home)
    if not agent:
        return "no [isolation] agent_user: the boundary is off"
    if not shutil.which("setfacl"):
        return f"setfacl is not installed; grant {agent} rX on {plugin_root}"
    p = subprocess.run(["setfacl", "-R", "-m", f"u:{agent}:rX", str(plugin_root)],
                       capture_output=True, text=True)
    if p.returncode != 0:
        return f"setfacl failed: {(p.stderr or p.stdout).strip()[:200]}"
    return f"{agent} can read {plugin_root}"


def _harness_read_root(dsh: str) -> str:
    """The directory the agent user must be able to read to start this Harness installation."""
    real = Path(os.path.realpath(dsh))
    parts = real.parts
    if "node_modules" in parts:
        return str(Path(*parts[:parts.index("node_modules") + 1]))
    return str(real.parent)


def _driver_text(dsh: str, profile: str, dsh_home: Path) -> str:
    """The live driver: the template with the launcher, profile and home pinned absolutely."""
    q = shlex.quote(str(dsh))
    return f'''# Holon driver for DeepSeek Harness — written by adapters/deepseek-harness/install.py.
# Re-run the installer rather than editing this file: it re-pins the launcher and the profile.
# The task is the employee's identity card plus the stage brief ({{briefing}}); the holon-native
# bundle registers the run's skills, injects the run facts, and enforces policy.json. The body
# hands its result in with the native holon_submit tool (which writes result.json and calls
# `holon submit`), so the result is a file, not the final message.
# DSH_PERMISSION_MODE=danger-full-access: an unattended body cannot answer an approval prompt,
# and the run's reach is Holon's policy.json (enforced by the bundle), not the Harness workspace
# sandbox. read_only_enforced stays false, so the kernel's working-directory guard still runs.
name = "deepseek-harness"
command = "{q} --profile {profile} {{briefing}}"
cwd = "{{workdir}}"
timeout_s = 3600
result = "file"
read_only = ""
act_args = ""
read_only_enforced = false
build_cmd = "{q} --version"

[env]
DSH_HOME = "{dsh_home}"
DSH_PERMISSION_MODE = "danger-full-access"
'''

def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--holon-home", default=os.environ.get("HOLON_HOME") or str(Path("~/holon").expanduser()))
    ap.add_argument("--dsh", help="the dsh launcher to pin (default: the first on PATH)")
    ap.add_argument("--profile", default=PROFILE, help="Harness profile name (default: holon)")
    ap.add_argument("--model", default=DEFAULT_MODEL, help="model the profile's bodies run on")
    ap.add_argument("--base-url", help="DeepSeek-compatible endpoint (written to DSH_HOME/.env)")
    ap.add_argument("--api-key-file", help="file holding the endpoint's key (mode 0600 in DSH_HOME/.env)")
    ap.add_argument("--register-dsh-home",
                    help="also write holon.json into an existing Harness home (e.g. ~/.dsh)")
    ap.add_argument("--operator-dsh-home",
                    help="also install the operator's Command Center into this Harness home "
                         "(the web profile lives under it); the dashboard is a Chair surface, "
                         "so it is not installed into the isolated run home")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()

    if not re.fullmatch(r"[a-z0-9][a-z0-9-]*", a.profile):
        raise install_lib.InstallError(f"profile {a.profile!r} is not a plain profile name")
    home = Path(a.holon_home).expanduser().resolve()
    adapter_home = home / "adapters" / "deepseek-harness"
    dsh_home = adapter_home / "home"
    profile_dir = dsh_home / "profiles" / a.profile
    plugin_src = HERE / "plugin"
    plugin_dest = adapter_home / "plugin" / "holon-native"
    dsh = install_lib.pin_binary("dsh", a.dsh, required=not a.dry_run, check=not a.dry_run)

    if a.dry_run:
        print("dry run: nothing written")
        print(f"would create DSH_HOME: {dsh_home}")
        print(f"would initialize profile: {a.profile} (from the shipped headless template)")
        print(f"would install bundle: {plugin_dest}")
        print(f"would export skills to: {dsh_home / 'skills'}")

        print(f"would write driver: {home / 'config' / 'drivers' / 'deepseek-harness.toml'}")
        print()
        print(_driver_text(dsh, a.profile, dsh_home))
        return 0

    if not (home / "holon.toml").exists():
        raise install_lib.InstallError(f"{home} is not a Holon instance (no holon.toml)")
    env = {**os.environ, "DSH_HOME": str(dsh_home)}
    adapter_home.mkdir(parents=True, exist_ok=True)
    dsh_home.mkdir(parents=True, exist_ok=True)
    print("isolation: " + _grant_agent_write(dsh_home, home))

    api_key = None
    if a.api_key_file:
        key_path = Path(a.api_key_file).expanduser()
        if not key_path.exists():
            raise install_lib.InstallError(f"api key file does not exist: {key_path}")
        api_key = key_path.read_text().strip()
        if not api_key:
            raise install_lib.InstallError(f"api key file is empty: {key_path}")

    profile_dir = dsh_home / "profiles" / a.profile
    if profile_dir.exists():
        print(f"profile: {a.profile} already exists at {profile_dir}")
    else:
        print(f"profile: initializing {a.profile} from the shipped headless template")
        _run([dsh, "--profile", a.profile, "--from-default-profile", "headless", "--dump-config"], env)

    if not (HERE / "plugin" / "index.js").exists():
        raise install_lib.InstallError(f"the bundle source is missing: {HERE / 'plugin'}")
    if plugin_dest.exists():
        shutil.rmtree(plugin_dest)
    plugin_dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copytree(HERE / "plugin", plugin_dest,
                    ignore=shutil.ignore_patterns("__pycache__", "node_modules", ".DS_Store"))
    _run([dsh, "plugin", "--profile", a.profile, "add", str(plugin_dest)], env)
    print(f"bundle: holon-native selected in profile {a.profile} ({plugin_dest})")
    print("isolation: " + _grant_agent_read(adapter_home / "plugin", home))

    install_lib.export_skills(home, dsh_home / "skills")
    print(f"skills: {dsh_home / 'skills'}")

    if _write_env(dsh_home / ".env", api_key, a.base_url):
        print(f"credentials: {dsh_home / '.env'} (mode 0600)")
    else:
        print("credentials: none written — export DEEPSEEK_API_KEY in the launch environment or pass --api-key-file")

    if _write_model_patch(profile_dir / "cordis.patch.yml", a.model):
        print(f"model: {a.model} -> {profile_dir / 'cordis.patch.yml'}")

    kernel_cmd = shutil.which("holon") or str(install_lib.HOLON)
    print(f"config: {_write_operator_config(dsh_home, home, [kernel_cmd])}")

    if a.register_dsh_home:
        operator_home = Path(a.register_dsh_home).expanduser().resolve()
        if not operator_home.is_dir():
            raise install_lib.InstallError(f"--register-dsh-home is not a directory: {operator_home}")
        print(f"operator config: {_write_operator_config(operator_home, home, [kernel_cmd])}")

    if a.operator_dsh_home:
        operator_home = Path(a.operator_dsh_home).expanduser().resolve()
        if not operator_home.is_dir():
            raise install_lib.InstallError(f"--operator-dsh-home is not a directory: {operator_home}")
        dashboard_src = HERE / "dashboard"
        if not (dashboard_src / "index.js").exists():
            raise install_lib.InstallError(f"the dashboard bundle source is missing: {dashboard_src}")
        dashboard_dest = operator_home / "plugins" / "holon-dashboard"
        if dashboard_dest.exists():
            shutil.rmtree(dashboard_dest)
        dashboard_dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copytree(dashboard_src, dashboard_dest,
                        ignore=shutil.ignore_patterns("__pycache__", "node_modules", ".DS_Store"))
        operator_env = {**os.environ, "DSH_HOME": str(operator_home)}
        _run([dsh, "plugin", "--profile", a.profile, "add", str(dashboard_dest)], operator_env)
        print(f"dashboard: holon-dashboard selected in profile {a.profile} ({dashboard_dest})")
        print(f"operator config: {_write_operator_config(operator_home, home, [kernel_cmd])}")
        print("dashboard: refresh the Web page to load the Command Center")

    driver = _driver_text(dsh, a.profile, dsh_home)
    installed = install_lib.write_driver(home, "deepseek-harness", driver)
    print(f"driver: {installed}")

    dump = _run([dsh, "--profile", a.profile, "--dump-config"], env)
    if "id: holon-native" not in dump:
        raise install_lib.InstallError("the composed profile does not contain holon-native; "
                                       "the bundle selection did not apply")
    print("profile dump: holon-native is composed")
    print("verify: " + install_lib.verify(home, dsh, ("--version",), env_extra={"DSH_HOME": str(dsh_home)}))
    if _agent_user(home):
        print("isolation: the agent user must also be able to read the Harness installation;")
        print(f'  add to [isolation] reads: "{_harness_read_root(dsh)}"')
        print("  then: holon isolation plan; run the printed script with sudo; holon isolation apply --force")
    print()
    print(driver)
    print("next: holon hr set-driver <emp> deepseek-harness")
    print("next: holon adapter test deepseek-harness   # spends real model calls")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except install_lib.InstallError as e:
        print(f"install: {e}", file=sys.stderr)
        sys.exit(1)
