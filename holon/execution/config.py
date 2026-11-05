"""The instance configuration: what the kernel reads, and how one key is changed.

`holon.toml` is a hand-written file: the kernel merges it over `DEFAULT_CONFIG` at load time
(`holon.execution.service.load_config`), so a key the file does not mention still has a value.
The dashboard showed four of these keys and could change one; this module is what lets a surface
show all of them and change the safe ones.

**The known keys are derived, never hand-listed.** Each owner of a section publishes its own
defaults, so the set of settable keys is the union of the modules that read them:

| section | owner |
|---|---|
| every section except grading/autonomy/pipeline | `service.DEFAULT_CONFIG` |
| `[grading]` | `grading.DEFAULTS` |
| `[autonomy]` | `autonomy.PRESETS` (the preset keys, plus `mode`) |
| `[pipeline]` | `bylaws.PIPELINE_DEFAULTS` |

**One writer.** `set_key` is the only thing here that writes `holon.toml`, and it writes one key
by editing one line: the file is re-read and re-parsed before the new text is accepted, so a
value that would not parse never reaches the instance. The alternative — rewriting the file from
the parsed dict — would drop every comment in it, and that file is mostly comments.

Nested tables (`[scope.dept.<slug>]`, `[budget.employee.<id>]`, `[smoke.dept.<slug>.checks]`) are
read here and shown, but not edited: they belong to a department's own archive, which
`holon dept export`/`import` carries as a unit.
"""

from __future__ import annotations

import json
import tomllib
from pathlib import Path

from holon.core.paths import Home


class ConfigError(ValueError):
    """A configuration change the kernel refuses to make."""


def _owners() -> dict[str, set[str]]:
    """Every key the kernel reads, by section. Derived from the modules that own them.

    `service.CONFIG_KEYS` is the kernel's own answer — it is `DEFAULT_CONFIG` plus the
    nested-table markers (`dept`, `employee`, `class`) that lint checks per section — and the
    three sections it leaves open (their keys are their owners' own defaults).
    """
    from holon.execution import bylaws, grading, service
    from holon.execution import autonomy as autonomy_mod

    known = {section: set(keys) for section, keys in service.CONFIG_KEYS.items()}
    known["grading"] = set(grading.DEFAULTS)
    known["autonomy"] = set(autonomy_mod.PRESETS["supervised"]) | {"mode"}
    known["pipeline"] = set(bylaws.PIPELINE_DEFAULTS)
    # `[classes]` maps a department slug to a list of task classes; the keys are the slugs
    # themselves, which the kernel checks against the departments it has. Its keys are DATA, not
    # settings, so the unknown-key check leaves the section alone.
    known["classes"] = set()
    return known


# Sections whose keys are data (department slugs), not settings: nothing in them is a typo.
DATA_SECTIONS = ("classes",)


def _effective(home: Home) -> tuple[dict, dict]:
    """The merged configuration and the file's own text, parsed."""
    from holon.execution.service import load_config

    path = home.config_file
    raw: dict = {}
    if path.exists():
        try:
            raw = tomllib.loads(path.read_text())
        except (OSError, tomllib.TOMLDecodeError) as e:
            raise ConfigError(f"{path} does not parse: {e}") from e
    return load_config(home), raw


def _type_of(value) -> str:
    if isinstance(value, bool):
        return "boolean"
    if isinstance(value, int):
        return "integer"
    if isinstance(value, float):
        return "number"
    if isinstance(value, list):
        return "array"
    return "string"


def read(home: Home) -> dict:
    """Every configuration key, its effective value, and where that value came from.

    `source` is `file` when holon.toml sets it and `default` when the kernel's own default
    applies, so a reader can see which knobs the instance has actually chosen.
    """
    effective, raw = _effective(home)
    known = _owners()
    sections: dict[str, dict] = {}
    unknown: list[dict] = []
    for section, values in sorted(effective.items()):
        row: dict[str, dict] = {}
        allowed = known.get(section, set())
        for key, value in sorted(values.items()):
            if isinstance(value, dict):
                # a nested table ([scope.dept.<slug>]): shown, not edited here
                row[key] = {"value": value, "type": "table", "source": "file",
                            "keys": sorted(value)}
            else:
                row[key] = {"value": value, "type": _type_of(value),
                            "source": "file" if key in (raw.get(section) or {}) else "default"}
        # a key in the file that the kernel does not read: a typo, or a setting from another
        # version. The merged config cannot answer this — `load_config` merges the file OVER the
        # defaults, so a typo lands in the effective values as if it were a setting. The KNOWN set
        # is the only thing that knows which keys the kernel reads.
        for key in sorted(set(raw.get(section) or {}) - allowed):
            if section in DATA_SECTIONS:
                continue
            if key in values:
                unknown.append({"section": section, "key": key, "value": (raw.get(section) or {})[key]})
        sections[section] = row
    for section in sorted(set(raw) - set(effective)):
        unknown.append({"section": section, "key": None, "value": raw[section]})
    return {
        "path": str(home.config_file),
        "sections": sections,
        "unknown": unknown,
        "nested": sorted(_nested_tables(raw)),
    }


def _nested_tables(raw: dict, prefix: str = "") -> list[str]:
    """The dotted names of the file's nested tables ([scope.dept.<slug>]).

    Only the tables BELOW a section: a top-level `[context]` is a section, not a nested table.
    """
    out: list[str] = []
    for name, value in raw.items():
        if not isinstance(value, dict):
            continue
        path = f"{prefix}{name}"
        if prefix:
            out.append(path)
        out.extend(_nested_tables(value, path + "."))
    return out


def _render(value) -> str:
    """A TOML literal for a value the kernel already accepted as JSON.

    A string is a TOML basic string: JSON's quoting is the same syntax for the characters a
    configuration value can hold (the escapes TOML and JSON share are `\" \\ \b \t \n \f \r` and
    `\\uXXXX`), so one encoder serves both.
    """
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, (int, float)):
        return json.dumps(value)
    if isinstance(value, list):
        return "[" + ", ".join(_render(v) for v in value) + "]"
    if isinstance(value, str):
        return json.dumps(value)
    raise ConfigError(f"a configuration value may not be a {type(value).__name__}")


def _coerce(section: str, key: str, current, text: str):
    """The new value, typed by the value already in force (so `budget_chars` stays an integer).

    A string is taken literally: the Chair types `nothing configured` and the file gets
    `"nothing configured"`. A list is JSON, because a list is written as a JSON array.
    """
    kind = _type_of(current)
    if kind == "boolean":
        if text.lower() not in ("true", "false"):
            raise ConfigError(f"[{section}] {key} is a boolean: use true or false")
        return text.lower() == "true"
    if kind == "integer":
        try:
            return int(text)
        except ValueError as e:
            raise ConfigError(f"[{section}] {key} is an integer: {text!r} is not") from e
    if kind == "number":
        try:
            return float(text)
        except ValueError as e:
            raise ConfigError(f"[{section}] {key} is a number: {text!r} is not") from e
    if kind == "array":
        try:
            value = json.loads(text)
        except ValueError as e:
            raise ConfigError(f"[{section}] {key} is a list: {text!r} is not JSON") from e
        if not isinstance(value, list):
            raise ConfigError(f"[{section}] {key} is a list: {text!r} is not one")
        return value
    return text


def _set_line(text: str, section: str, key: str, literal: str) -> str:
    """The file's text with one `key = literal` line set inside `[section]`.

    The edit is line-based on purpose: the file is mostly comments, and rewriting it from the
    parsed dict would lose every one of them.
    """
    lines = text.splitlines()
    header = f"[{section}]"
    start = None
    for i, line in enumerate(lines):
        if line.strip() == header:
            start = i
            break
    if start is None:
        addition = "" if not lines or not lines[-1].strip() else "\n"
        return "\n".join(lines) + f"{addition}\n{header}\n{key} = {literal}\n"
    end = start + 1
    while end < len(lines) and not lines[end].lstrip().startswith("["):
        end += 1
    for i in range(start + 1, end):
        stripped = lines[i].strip()
        if stripped.startswith(key) and "=" in stripped:
            name = stripped.split("=", 1)[0].strip()
            if name == key:
                lines[i] = f"{key} = {literal}"
                return "\n".join(lines) + "\n"
    # the section exists but the key does not: add it at the end of the section
    lines.insert(end, f"{key} = {literal}")
    return "\n".join(lines) + "\n"


def set_key(home: Home, section: str, key: str, text: str) -> dict:
    """Set one configuration key in holon.toml.

    The value is typed by the value already in force, so `budget_chars` cannot become the string
    "24000" and `mode` cannot become a number. A key the kernel does not read is refused: a typo
    would otherwise sit in the file forever, ignored, and look like it worked.
    """
    if "." in section or "." in key:
        raise ConfigError("a nested table is not settable here: "
                           "[scope.dept.<slug>] and its siblings travel with a department's archive")
    known = _owners()
    if section not in known:
        raise ConfigError(f"[{section}] is not a section this kernel reads")
    effective, raw = _effective(home)
    current = (effective.get(section) or {}).get(key)
    if current is None:
        if key not in known[section]:
            raise ConfigError(f"[{section}] has no key {key!r}")
        raise ConfigError(f"[{section}] has no value for {key!r} yet: set it in holon.toml first")
    if isinstance(current, dict):
        raise ConfigError(f"[{section}] {key} is a table: set its own keys")
    value = _coerce(section, key, current, text)
    literal = _render(value)
    path = home.config_file
    original = path.read_text() if path.exists() else ""
    updated = _set_line(original, section, key, literal)
    try:
        parsed = tomllib.loads(updated)
    except tomllib.TOMLDecodeError as e:
        raise ConfigError(f"the change would not parse, so it was not written: {e}") from e
    if (parsed.get(section) or {}).get(key) != value:
        raise ConfigError("the change did not take, so it was not written")
    path.write_text(updated)
    return {"section": section, "key": key, "value": value, "previous": current, "path": str(path)}
