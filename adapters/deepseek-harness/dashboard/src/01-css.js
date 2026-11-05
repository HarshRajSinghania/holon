let CSS = `
.hd-root { height:100%; min-height:0; display:flex; flex-direction:column; color:var(--dsw-alias-label-primary); background:var(--dsw-alias-bg-base); font-family:inherit; }
.hd-shell { height:100%; min-height:0; display:flex; flex-direction:column; }
.hd-top { display:flex; align-items:center; gap:14px; padding:12px 20px 0; }
.hd-brand { display:flex; align-items:center; gap:10px; min-width:0; }
.hd-logo { width:30px; height:30px; border-radius:10px; display:grid; place-items:center; color:var(--dsw-alias-state-business-primary); background:var(--dsw-alias-bg-layer-2); border:1px solid var(--dsw-alias-border-l2); flex:none; }
.hd-title { font-size:16px; font-weight:650; letter-spacing:-0.01em; line-height:1.2; }
.hd-sub { font-size:11px; color:var(--dsw-alias-label-tertiary); line-height:1.3; max-width:52ch; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.hd-top-actions { margin-left:auto; display:flex; align-items:center; gap:8px; flex-wrap:wrap; justify-content:flex-end; }
.hd-tabs { display:flex; align-items:center; gap:2px; padding:10px 16px 0; border-bottom:1px solid var(--dsw-alias-border-l1); overflow-x:auto; }
.hd-tab { appearance:none; border:0; background:transparent; color:var(--dsw-alias-label-secondary); font:inherit; font-size:12.5px; font-weight:520; padding:8px 11px 10px; cursor:pointer; border-radius:8px 8px 0 0; display:flex; align-items:center; gap:7px; white-space:nowrap; }
.hd-tab:hover { color:var(--dsw-alias-label-primary); background:var(--dsw-alias-interactive-bg-hover); }
.hd-tab--active { color:var(--dsw-alias-label-primary); box-shadow:inset 0 -2px 0 var(--dsw-alias-state-business-primary); }
.hd-tab-count { min-width:17px; height:17px; padding:0 5px; border-radius:999px; font-size:10px; display:inline-flex; align-items:center; justify-content:center; background:var(--dsw-alias-bg-layer-2); color:var(--dsw-alias-label-tertiary); }
.hd-tab--active .hd-tab-count { background:var(--dsw-alias-state-business-primary); color:var(--dsw-alias-label-primary-foreground); }
.hd-content { flex:1; min-height:0; overflow:auto; padding:18px 20px 36px; }
.hd-page { max-width:1500px; margin:0 auto; }
.hd-page-head { display:flex; align-items:flex-start; gap:14px; margin-bottom:14px; flex-wrap:wrap; }
.hd-page-title { font-size:20px; font-weight:680; letter-spacing:-0.02em; line-height:1.2; }
.hd-page-sub { font-size:12px; color:var(--dsw-alias-label-tertiary); margin-top:3px; max-width:90ch; }
.hd-actions { margin-left:auto; display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
.hd-grid { display:grid; gap:12px; }
.hd-stat-grid { grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); }
.hd-split { display:grid; grid-template-columns:minmax(0,1.55fr) minmax(280px,0.9fr); gap:12px; align-items:start; }
.hd-split--console { grid-template-columns:minmax(230px,0.8fr) minmax(0,1.5fr); }
@media (max-width:1000px) { .hd-split, .hd-split--console { grid-template-columns:1fr; } }
.hd-card { background:var(--dsw-alias-bg-layer-1); border:1px solid var(--dsw-alias-border-l1); border-radius:12px; min-width:0; }
.hd-card-head { display:flex; align-items:flex-start; gap:10px; padding:12px 14px 0; }
.hd-card-title { font-size:12.5px; font-weight:620; letter-spacing:-0.005em; }
.hd-card-sub { font-size:11px; color:var(--dsw-alias-label-tertiary); margin-top:2px; }
.hd-card-actions { margin-left:auto; display:flex; gap:6px; align-items:center; }
.hd-card-body { padding:10px 14px 14px; min-width:0; }
.hd-card-body--flush { padding:0; }
.hd-stat { padding:12px 13px; display:flex; flex-direction:column; gap:3px; position:relative; overflow:hidden; }
.hd-stat-label { font-size:10.5px; text-transform:uppercase; letter-spacing:0.07em; color:var(--dsw-alias-label-tertiary); display:flex; align-items:center; gap:6px; }
.hd-stat-value { font-size:25px; font-weight:650; letter-spacing:-0.03em; line-height:1.05; font-variant-numeric:tabular-nums; }
.hd-stat-hint { font-size:10.5px; color:var(--dsw-alias-label-tertiary); }
.hd-stat--error .hd-stat-value { color:var(--dsw-alias-state-error-primary); }
.hd-stat--warn .hd-stat-value { color:var(--dsw-alias-state-warn-primary); }
.hd-stat--ok .hd-stat-value { color:var(--dsw-alias-state-success-primary); }
.hd-stat--brand .hd-stat-value { color:var(--dsw-alias-state-business-primary); }
`;
CSS += `
.hd-pill { display:inline-flex; align-items:center; gap:5px; height:21px; padding:0 8px; border-radius:999px; font-size:10.5px; font-weight:560; background:var(--dsw-alias-bg-layer-2); color:var(--dsw-alias-label-secondary); border:1px solid transparent; white-space:nowrap; }
.hd-pill--ok { color:var(--dsw-alias-state-success-primary); background:color-mix(in srgb, var(--dsw-alias-state-success-primary) 10%, transparent); }
.hd-pill--warn { color:var(--dsw-alias-state-warn-primary); background:color-mix(in srgb, var(--dsw-alias-state-warn-primary) 12%, transparent); }
.hd-pill--error { color:var(--dsw-alias-state-error-primary); background:color-mix(in srgb, var(--dsw-alias-state-error-primary) 11%, transparent); }
.hd-pill--brand { color:var(--dsw-alias-state-business-primary); background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 11%, transparent); }
.hd-pill--quiet { color:var(--dsw-alias-label-tertiary); }
.hd-dot { width:6px; height:6px; border-radius:50%; background:var(--dsw-alias-label-tertiary); flex:none; }
.hd-dot--ok { background:var(--dsw-alias-state-success-primary); }
.hd-dot--warn { background:var(--dsw-alias-state-warn-primary); }
.hd-dot--error { background:var(--dsw-alias-state-error-primary); }
.hd-dot--brand { background:var(--dsw-alias-state-business-primary); }
.hd-btn { appearance:none; border:1px solid var(--dsw-alias-border-l2); background:var(--dsw-alias-bg-layer-2); color:var(--dsw-alias-label-primary); height:28px; padding:0 10px; border-radius:8px; font:inherit; font-size:11.5px; font-weight:550; display:inline-flex; align-items:center; gap:6px; cursor:pointer; white-space:nowrap; }
.hd-btn:hover { background:var(--dsw-alias-interactive-bg-hover); }
.hd-btn:disabled { opacity:.45; cursor:not-allowed; }
.hd-btn--primary { background:var(--dsw-alias-button-primary-fill); border-color:transparent; color:var(--dsw-alias-label-primary-foreground); }
.hd-btn--danger { color:var(--dsw-alias-state-error-primary); border-color:color-mix(in srgb, var(--dsw-alias-state-error-primary) 30%, transparent); background:color-mix(in srgb, var(--dsw-alias-state-error-primary) 7%, transparent); }
.hd-btn--ghost { border-color:transparent; background:transparent; color:var(--dsw-alias-label-secondary); }
.hd-btn--ghost:hover { color:var(--dsw-alias-label-primary); background:var(--dsw-alias-interactive-bg-hover); }
.hd-btn--sm { height:24px; padding:0 8px; font-size:11px; border-radius:7px; }
.hd-btn--icon { width:28px; padding:0; justify-content:center; }
.hd-input, .hd-select, .hd-textarea { width:100%; box-sizing:border-box; border:1px solid var(--dsw-alias-border-l2); background:var(--dsw-alias-bg-base); color:var(--dsw-alias-label-primary); border-radius:8px; padding:0 9px; height:28px; font:inherit; font-size:12px; outline:none; }
.hd-input:focus, .hd-select:focus, .hd-textarea:focus { border-color:var(--dsw-alias-state-business-primary); box-shadow:0 0 0 2px color-mix(in srgb, var(--dsw-alias-state-business-primary) 16%, transparent); }
.hd-textarea { height:auto; min-height:90px; padding:8px 9px; resize:vertical; line-height:1.5; }
.hd-search { position:relative; min-width:180px; flex:1 1 220px; }
.hd-search .hd-input { padding-left:28px; }
.hd-search-icon { position:absolute; left:8px; top:50%; transform:translateY(-50%); color:var(--dsw-alias-label-tertiary); pointer-events:none; }
.hd-toolbar { display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:12px; }
.hd-field { display:flex; flex-direction:column; gap:4px; }
.hd-field-label { font-size:10.5px; color:var(--dsw-alias-label-tertiary); font-weight:560; }
.hd-chip-row { display:flex; gap:6px; flex-wrap:wrap; }
.hd-chip { appearance:none; border:1px solid var(--dsw-alias-border-l2); background:transparent; color:var(--dsw-alias-label-secondary); border-radius:999px; height:24px; padding:0 9px; font:inherit; font-size:11px; cursor:pointer; white-space:nowrap; }
.hd-chip:hover { background:var(--dsw-alias-interactive-bg-hover); }
.hd-chip--active { background:var(--dsw-alias-state-business-primary); border-color:transparent; color:var(--dsw-alias-label-primary-foreground); }
`;
CSS += `
.hd-list { display:flex; flex-direction:column; }
.hd-list-item { display:flex; align-items:flex-start; gap:9px; padding:9px 0; border-top:1px solid var(--dsw-alias-border-l1); min-width:0; }
.hd-list-item:first-child { border-top:0; padding-top:2px; }
.hd-list-item--click { cursor:pointer; border-radius:8px; padding-left:6px; padding-right:6px; margin-left:-6px; margin-right:-6px; }
.hd-list-item--click:hover { background:var(--dsw-alias-interactive-bg-hover); }
.hd-list-item--active { background:var(--dsw-alias-interactive-bg-selected); }
.hd-row-main { min-width:0; flex:1; }
.hd-row-title { font-size:12px; font-weight:560; line-height:1.35; overflow:hidden; text-overflow:ellipsis; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; }
.hd-row-sub { font-size:10.5px; color:var(--dsw-alias-label-tertiary); margin-top:2px; display:flex; gap:8px; flex-wrap:wrap; }
.hd-row-meta { flex:none; display:flex; align-items:center; gap:6px; }
.hd-table-wrap { overflow:auto; border-radius:0 0 12px 12px; }
.hd-table { width:100%; border-collapse:collapse; font-size:11.5px; }
.hd-th { text-align:left; font-size:10px; text-transform:uppercase; letter-spacing:0.06em; color:var(--dsw-alias-label-tertiary); font-weight:600; padding:7px 10px; border-bottom:1px solid var(--dsw-alias-border-l1); white-space:nowrap; background:var(--dsw-alias-bg-layer-1); position:sticky; top:0; z-index:1; }
.hd-td { padding:8px 10px; border-bottom:1px solid var(--dsw-alias-border-l1); vertical-align:top; }
.hd-tr { cursor:pointer; }
.hd-tr:hover .hd-td { background:var(--dsw-alias-interactive-bg-hover); }
.hd-mono { font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace; font-size:10.5px; }
.hd-muted { color:var(--dsw-alias-label-tertiary); }
.hd-tiny { font-size:10.5px; }
.hd-strong { font-weight:620; }
.hd-truncate { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:100%; }
.hd-pre { margin:0; padding:10px; border-radius:8px; background:var(--dsw-alias-bg-base); border:1px solid var(--dsw-alias-border-l1); font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace; font-size:10.5px; line-height:1.5; white-space:pre-wrap; overflow-wrap:anywhere; max-height:460px; overflow:auto; }
.hd-prose { font-size:12px; line-height:1.55; white-space:pre-wrap; overflow-wrap:anywhere; }
.hd-kv { display:grid; grid-template-columns:150px minmax(0,1fr); gap:6px 12px; font-size:11.5px; }
.hd-kv-key { color:var(--dsw-alias-label-tertiary); }
.hd-kv-val { min-width:0; overflow-wrap:anywhere; }
.hd-pipeline { display:grid; grid-template-columns:repeat(7,minmax(0,1fr)); gap:6px; }
@media (max-width:900px) { .hd-pipeline { grid-template-columns:repeat(4,minmax(0,1fr)); } }
.hd-stage-col { padding:8px; border-radius:9px; background:var(--dsw-alias-bg-layer-2); min-width:0; }
.hd-stage-head { display:flex; align-items:center; justify-content:space-between; gap:4px; font-size:10.5px; font-weight:600; text-transform:capitalize; }
.hd-stage-total { font-size:15px; font-weight:650; font-variant-numeric:tabular-nums; }
.hd-stage-bars { display:flex; height:5px; border-radius:3px; overflow:hidden; margin-top:7px; background:var(--dsw-alias-bg-base); }
.hd-stage-seg { height:100%; }
.hd-stage-seg--ready { background:var(--dsw-alias-state-business-primary); }
.hd-stage-seg--claimed { background:var(--dsw-alias-state-warn-primary); }
.hd-stage-seg--done { background:var(--dsw-alias-state-success-primary); }
.hd-stage-seg--failed { background:var(--dsw-alias-state-error-primary); }
.hd-stage-meta { display:flex; gap:7px; flex-wrap:wrap; margin-top:6px; font-size:9.5px; color:var(--dsw-alias-label-tertiary); }
.hd-timeline { display:flex; flex-direction:column; }
.hd-event { display:flex; gap:9px; padding:7px 0; border-top:1px solid var(--dsw-alias-border-l1); }
.hd-event:first-child { border-top:0; }
.hd-event-dot { width:7px; height:7px; border-radius:50%; margin-top:4px; flex:none; background:var(--dsw-alias-label-tertiary); }
.hd-event-body { min-width:0; flex:1; }
.hd-event-text { font-size:11px; line-height:1.4; }
.hd-event-meta { font-size:10px; color:var(--dsw-alias-label-tertiary); margin-top:2px; display:flex; gap:7px; flex-wrap:wrap; }
`;
CSS += `
.hd-board { display:grid; grid-template-columns:repeat(7,minmax(190px,1fr)); gap:8px; overflow-x:auto; padding-bottom:6px; }
.hd-board-col { background:var(--dsw-alias-bg-layer-2); border-radius:10px; padding:8px; min-width:0; }
.hd-board-head { display:flex; align-items:center; justify-content:space-between; gap:6px; margin-bottom:7px; }
.hd-board-title { font-size:11px; font-weight:620; text-transform:capitalize; }
.hd-board-count { font-size:10px; color:var(--dsw-alias-label-tertiary); }
.hd-task { background:var(--dsw-alias-bg-layer-1); border:1px solid var(--dsw-alias-border-l1); border-radius:8px; padding:8px; margin-bottom:6px; cursor:pointer; min-width:0; }
.hd-task:hover { border-color:var(--dsw-alias-state-business-primary); }
.hd-task-title { font-size:11px; font-weight:550; line-height:1.35; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; }
.hd-task-meta { display:flex; align-items:center; gap:5px; flex-wrap:wrap; margin-top:5px; font-size:9.5px; color:var(--dsw-alias-label-tertiary); }
.hd-drawer-backdrop { position:fixed; inset:0; background:color-mix(in srgb, #000 28%, transparent); z-index:80; display:flex; justify-content:flex-end; }
.hd-drawer { width:min(660px,94vw); height:100%; background:var(--dsw-alias-bg-base); border-left:1px solid var(--dsw-alias-border-l2); box-shadow:-18px 0 40px rgba(0,0,0,.18); display:flex; flex-direction:column; }
.hd-drawer-head { display:flex; align-items:flex-start; gap:10px; padding:14px 16px; border-bottom:1px solid var(--dsw-alias-border-l1); }
.hd-drawer-body { flex:1; overflow:auto; padding:14px 16px 30px; }
.hd-drawer-foot { border-top:1px solid var(--dsw-alias-border-l1); padding:10px 16px; display:flex; gap:8px; flex-wrap:wrap; background:var(--dsw-alias-bg-layer-1); }
.hd-modal-backdrop { position:fixed; inset:0; background:color-mix(in srgb, #000 34%, transparent); z-index:90; display:grid; place-items:center; padding:20px; }
.hd-modal { width:min(560px,94vw); max-height:88vh; overflow:auto; background:var(--dsw-alias-bg-base); border:1px solid var(--dsw-alias-border-l2); border-radius:14px; box-shadow:0 24px 70px rgba(0,0,0,.28); }
.hd-modal-head { padding:15px 17px 0; }
.hd-modal-body { padding:12px 17px; }
.hd-modal-foot { padding:0 17px 16px; display:flex; gap:8px; justify-content:flex-end; }
.hd-empty { padding:26px 12px; text-align:center; color:var(--dsw-alias-label-tertiary); font-size:11.5px; }
.hd-loading { padding:22px; text-align:center; color:var(--dsw-alias-label-tertiary); font-size:11.5px; }
.hd-error { margin:10px 0; padding:10px 12px; border:1px solid color-mix(in srgb, var(--dsw-alias-state-error-primary) 32%, transparent); background:color-mix(in srgb, var(--dsw-alias-state-error-primary) 7%, transparent); color:var(--dsw-alias-state-error-primary); border-radius:9px; font-size:11.5px; line-height:1.45; }
.hd-progress { height:6px; border-radius:4px; background:var(--dsw-alias-bg-layer-2); overflow:hidden; }
.hd-progress-bar { height:100%; border-radius:4px; background:var(--dsw-alias-state-business-primary); }
.hd-dock { display:flex; align-items:center; gap:9px; padding:5px 9px; margin:4px 0; border:1px solid var(--dsw-alias-border-l1); border-radius:9px; background:var(--dsw-alias-bg-layer-1); font-size:11px; color:var(--dsw-alias-label-secondary); }
.hd-dock-text { min-width:0; flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.hd-dock b { color:var(--dsw-alias-label-primary); font-weight:600; }
.hd-settings-row { display:flex; align-items:center; gap:12px; padding:9px 0; border-top:1px solid var(--dsw-alias-border-l1); }
.hd-settings-row:first-child { border-top:0; }
.hd-settings-row-label { font-size:11.5px; font-weight:540; }
.hd-settings-row-hint { font-size:10.5px; color:var(--dsw-alias-label-tertiary); }
.hd-settings-row-value { margin-left:auto; text-align:right; font-size:11px; color:var(--dsw-alias-label-secondary); max-width:60%; overflow-wrap:anywhere; }
.hd-settings-row-value .hd-input { text-align:right; }
.hd-settings-row-value .hd-muted { display:block; margin-top:2px; }
.hd-settings { display:flex; flex-direction:column; }
.hd-avatar { width:26px; height:26px; border-radius:8px; display:grid; place-items:center; font-size:10px; font-weight:650; background:var(--dsw-alias-bg-layer-2); color:var(--dsw-alias-label-secondary); flex:none; }
.hd-inline { display:flex; align-items:center; gap:6px; flex-wrap:wrap; }
.hd-sep { width:1px; height:14px; background:var(--dsw-alias-border-l2); }
.hd-grid2 { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
@media (max-width:700px) { .hd-grid2 { grid-template-columns:1fr; } .hd-top { padding:10px 12px 0; } .hd-content { padding:14px 12px 30px; } }
`;
