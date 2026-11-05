window.__ModuleLoader__.load({
  id: '@local/holon-dashboard',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

// ---- 00-locale.js ----
const NS = 'holon-dashboard';
let translate = (text) => text;
function t(text) {
  const value = translate(text);
  return typeof value === 'string' && value ? value : text;
}
const ZH = {
  'Holon Command Center': 'Holon 指挥中心',
  'Overview': '总览',
  'Work': '工作',
  'Organization': '组织',
  'Runs': '运行',
  'Knowledge': '知识',
  'Operations': '运营',
  'Messages': '消息',
  'Settings': '设置',
  'Refresh': '刷新',
  'Live': '在线',
  'Stale': '心跳停滞',
  'Offline': '离线',
  'Read-only': '只读',
  'Needs the Chair': '等待主席',
  'Awaiting Chair': '等待主席',
  'Ready stages': '就绪阶段',
  'Open work': '未结工作',
  'Active runs': '活跃运行',
  'Employees': '员工',
  'Departments': '部门',
  'Doctor': '体检',
  'Errors': '错误',
  'Warnings': '警告',
  'Approve': '批准',
  'Reject': '驳回',
  'Review': '查看',
  'Cancel': '取消',
  'Retry': '重试',
  'Replan': '重规划',
  'Answer': '回答',
  'Send': '发送',
  'Reply': '回复',
  'Pause': '暂停',
  'Activate': '启用',
  'Set driver': '设置驱动',
  'Run doctor': '运行体检',
  'Run heartbeat': '运行心跳',
  'Back up': '备份',
  'Conformance': '一致性测试',
  'Stage': '阶段',
  'Status': '状态',
  'Department': '部门',
  'Assignee': '负责人',
  'Priority': '优先级',
  'Risk': '风险',
  'Grade': '等级',
  'Lane': '通道',
  'Updated': '更新',
  'Created': '创建',
  'Title': '标题',
  'Intent': '意图',
  'Acceptance': '验收',
  'Outputs': '产出',
  'Events': '事件',
  'Artifacts': '产物',
  'All': '全部',
  'Search': '搜索',
  'Filter': '筛选',
  'Reset': '重置',
  'Close': '关闭',
  'Copy': '复制',
  'Copied': '已复制',
  'Health': '健康',
  'Pipeline': '流水线',
  'Recent activity': '最近动态',
  'Metrics': '指标',
  'Schedules': '计划',
  'Drivers': '驱动',
  'Backups': '备份',
  'Audit chain': '审计链',
  'Isolation': '隔离',
  'Scopes': '范围',
  'Guards': '守卫',
  'No data': '暂无数据',
  'Loading': '加载中',
  'Error': '错误',
  'Approvals': '审批',
  'Board': '看板',
  'Detail': '详情',
  'Show full': '展开全文',
  'Show less': '收起',
  'Confirm': '确认',
  'This action writes to the instance.': '此操作会写入实例。',
  'Ask the organization': '询问组织',
  'Recall': '召回',
  'Memory': '记忆',
  'Skills': '技能',
  'Playbooks': '剧本',
  'Knowledge bases': '知识库',
  'Episodes': '经验',
  'Chair inbox': '主席收件箱',
  'Compose': '撰写',
  'Unread': '未读',
  'Thread': '会话',
  'Instance': '实例',
  'Connection': '连接',
  'Authority': '权限',
  'Actions': '操作',
  'Approval queue': '审批队列',
  'Work board': '工作看板',
  'Doctor findings': '体检发现',
  'Severity': '严重度',
  'Check': '检查',
  'Heartbeat': '心跳',
  'Degraded': '降级',
  'Age': '时长',
  'No approvals waiting': '没有待审批项',
  'No messages': '没有消息',
  'No runs yet': '暂无运行',
  'No findings': '没有发现',
  'Configured': '已配置',
  'Unconfigured': '未配置',
  'Open item': '打开工作',
  'Open run': '打开运行',
  'Open employee': '打开员工',
  'Console': '控制台',
  'Configuration': '配置',
  'Result': '结果',
  'Run': '执行',
  'Working…': '执行中…',
  'Save': '保存',
  'Saved': '已保存',
  'Commands': '命令',
  'Manage': '管理',
  'Preview': '预览',
  'No answer': '无应答',
  'More options': '更多选项',
  'New department': '新建部门',
  'Hire employee': '录用员工',
  'New skill': '新建技能',
  'New memory': '新建记忆',
  'Seed knowledge base': '播种知识库',
  'New schedule': '新建计划',
  'New operation': '新建运营',
  'New objective': '新建目标',
  'This command also takes an argument the console does not offer; run it from the CLI.':
    '此命令还有一个控制台不提供的参数；请从命令行运行。',
  'This object has no read command.': '此对象没有读取命令。',
  'Nothing has run yet.': '尚未执行任何命令。',
  'Pick a command on the left.': '请在左侧选择一个命令。',
  'This command takes no arguments.': '此命令不接受参数。',
  'This command writes to the instance.': '此命令会写入实例。',
  'Search commands…': '搜索命令…',
  'Every command the kernel offers, with the arguments it declares. The kernel decides which may be filled from a browser; this page only renders.':
    '内核提供的全部命令及其声明的参数。由内核决定哪些参数可从浏览器填写；本页只负责呈现。',
  'Every key the kernel reads, its effective value, and whether holon.toml sets it. A change is written to holon.toml and re-parsed before it is accepted.':
    '内核读取的每一个键、生效值，以及是否由 holon.toml 设置。修改会写入 holon.toml 并在接受前重新解析。',
  'set in holon.toml': 'holon.toml 已设置',
  'kernel default': '内核默认值',
  'Unknown keys': '未知键',
  'not read': '未被读取',
  'holon.toml carries keys the kernel does not read: a typo, or a setting from another version.':
    'holon.toml 中存在内核不读取的键：可能是拼写错误，或来自其他版本的设置。',
};
const EN = Object.fromEntries(Object.keys(ZH).map((key) => [key, key]));

// ---- 01-css.js ----
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

// ---- 02-primitives.js ----
const STAGES = ['research', 'shape', 'plan', 'approve', 'execute', 'verify', 'retro'];
const ICONS = {
  refresh: 'M20 11a8 8 0 1 0-2.3 5.7M20 5v6h-6',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM16 16l4 4',
  close: 'M6 6l12 12M18 6L6 18',
  check: 'M5 12l4.5 4.5L19 7',
  x: 'M7 7l10 10M17 7L7 17',
  play: 'M8 5l11 7-11 7V5Z',
  pause: 'M9 5v14M15 5v14',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  chevron: 'M9 6l6 6-6 6',
  external: 'M14 4h6v6M20 4l-9 9M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5',
  alert: 'M12 3l9 16H3L12 3ZM12 9v5M12 17h.01',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 11v5M12 8h.01',
  users: 'M16 20v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M9.5 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM21 20v-2a4 4 0 0 0-3-3.9M16 3.2a3.5 3.5 0 0 1 0 6.6',
  activity: 'M3 12h4l2.5-7 4 14 2.5-7H21',
  brain: 'M9 4a3 3 0 0 0-3 3v1a3 3 0 0 0 0 6v1a3 3 0 0 0 3 3M15 4a3 3 0 0 1 3 3v1a3 3 0 0 1 0 6v1a3 3 0 0 1-3 3M9 4v16M15 4v16',
  shield: 'M12 3l7 3v5c0 4.5-2.8 7.9-7 10-4.2-2.1-7-5.5-7-10V6l7-3Z',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3 2',
  terminal: 'M4 5h16v14H4V5ZM7 9l3 3-3 3M13 15h4',
  message: 'M21 12a8 8 0 0 1-8 8H5l2-3a8 8 0 1 1 14-5Z',
  send: 'M21 3L10 14M21 3l-7 18-4-7-7-4 18-7Z',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z',
  database: 'M12 8c4.4 0 8-1.1 8-2.5S16.4 3 12 3 4 4.1 4 5.5 7.6 8 12 8ZM4 5.5v13C4 19.9 7.6 21 12 21s8-1.1 8-2.5v-13M4 12c0 1.4 3.6 2.5 8 2.5s8-1.1 8-2.5',
  layers: 'M12 3l9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 16l9 5 9-5',
  spark: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z',
  git: 'M6 3v12a3 3 0 0 0 3 3h6M6 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM18 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM6 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z',
  filter: 'M3 5h18M7 12h10M10 19h4',
  grid: 'M4 4h7v7H4V4ZM13 4h7v7h-7V4ZM4 13h7v7H4v-7ZM13 13h7v7h-7v-7Z',
  list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  plus: 'M12 5v14M5 12h14',
  copy: 'M8 8h11v11H8V8ZM5 16H4V4h11v1',
};
function Icon({ name, size = 14 }) {
  const path = ICONS[name] || ICONS.info;
  return h('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true,
    style: { display: 'block', flex: 'none' },
  }, h('path', { d: path }));
}
const STAGE_TONE = { ready: 'brand', claimed: 'warn', done: 'ok', failed: 'error', cancelled: 'quiet' };
const TASK_TONE = { open: 'brand', waiting: 'quiet', blocked: 'warn', needs_input: 'warn', done: 'ok', failed: 'error', cancelled: 'quiet' };
function toneFor(value) { return STAGE_TONE[value] || TASK_TONE[value] || 'quiet'; }
function shortId(id, size = 8) { return typeof id === 'string' && id.length > size + 4 ? id.slice(0, size) + '…' : id || '—'; }
function initials(name) { return String(name || '?').split(/\s+/).filter(Boolean).slice(0, 2).map((x) => x[0].toUpperCase()).join('') || '?'; }
function fmtTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function fmtAgo(value) {
  if (!value) return '—';
  const s = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 1000));
  if (s < 60) return s + 's';
  if (s < 3600) return Math.round(s / 60) + 'm';
  if (s < 86400) return Math.round(s / 3600) + 'h';
  return Math.round(s / 86400) + 'd';
}
function fmtDuration(seconds) {
  if (seconds === null || seconds === undefined || Number.isNaN(Number(seconds))) return '—';
  const n = Math.round(Number(seconds));
  if (n < 60) return n + 's';
  if (n < 3600) return Math.round(n / 60) + 'm';
  return (n / 3600).toFixed(1) + 'h';
}
function fmtTokens(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return '—';
  return n >= 1000000 ? (n / 1000000).toFixed(1) + 'M' : n >= 1000 ? (n / 1000).toFixed(1) + 'k' : String(n);
}
function Btn({ children, icon, variant = 'default', size = 'md', onClick, disabled, title, type = 'button', ariaLabel }) {
  const cls = ['hd-btn', variant !== 'default' ? 'hd-btn--' + variant : '', size === 'sm' ? 'hd-btn--sm' : '', !children ? 'hd-btn--icon' : ''].filter(Boolean).join(' ');
  // The icon is aria-hidden, so a button that carries only an icon needs its name stated: the
  // tooltip is not an accessible name a screen reader can rely on.
  const text = typeof children === 'string' ? children : null;
  const name = ariaLabel || text || title || undefined;
  return h('button', {
    type, className: cls, onClick, disabled,
    title: title || text || undefined,
    ...(name && !text ? { 'aria-label': name } : {}),
  },
    icon ? h(Icon, { name: icon, size: size === 'sm' ? 12 : 13 }) : null, children || null);
}
function Pill({ tone = 'quiet', children, dot = false }) {
  return h('span', { className: 'hd-pill hd-pill--' + tone }, dot ? h('span', { className: 'hd-dot hd-dot--' + tone }) : null, children);
}
function Card({ title, sub, actions, children, flush = false, className = '', style }) {
  return h('section', { className: 'hd-card ' + className, style },
    title || actions ? h('div', { className: 'hd-card-head' },
      h('div', { style: { minWidth: 0 } }, title ? h('div', { className: 'hd-card-title' }, title) : null, sub ? h('div', { className: 'hd-card-sub' }, sub) : null),
      actions ? h('div', { className: 'hd-card-actions' }, actions) : null) : null,
    h('div', { className: 'hd-card-body' + (flush ? ' hd-card-body--flush' : '') }, children));
}
function Stat({ label, value, hint, tone = '', icon, onClick }) {
  return h('div', { className: 'hd-card hd-stat ' + (tone ? 'hd-stat--' + tone : ''), onClick, style: onClick ? { cursor: 'pointer' } : undefined },
    h('div', { className: 'hd-stat-label' }, icon ? h(Icon, { name: icon, size: 11 }) : null, label),
    h('div', { className: 'hd-stat-value' }, value),
    hint ? h('div', { className: 'hd-stat-hint' }, hint) : null);
}
function Empty({ children }) { return h('div', { className: 'hd-empty' }, children || t('No data')); }
function Loading({ children }) { return h('div', { className: 'hd-loading', role: 'status', 'aria-live': 'polite' }, children || t('Loading')); }
function ErrorBox({ error, onRetry }) {
  if (!error) return null;
  return h('div', { className: 'hd-error', role: 'alert' }, h('div', { className: 'hd-inline', style: { justifyContent: 'space-between' } },
    h('span', null, error.message || String(error)), onRetry ? h('button', { className: 'hd-btn hd-btn--sm', onClick: onRetry }, t('Retry')) : null));
}
function KV({ rows }) {
  return h('div', { className: 'hd-kv' }, rows.filter(Boolean).map(([k, v], i) => h(React.Fragment, { key: i },
    h('div', { className: 'hd-kv-key' }, k), h('div', { className: 'hd-kv-val' }, v))));
}
function Prose({ text, limit }) {
  const [open, setOpen] = React.useState(false);
  const full = typeof text === 'string' ? text : JSON.stringify(text, null, 2);
  const long = limit && full.length > limit;
  return h('div', null,
    h('div', { className: 'hd-prose' }, long && !open ? full.slice(0, limit) + '…' : full),
    long ? h('button', { className: 'hd-btn hd-btn--ghost hd-btn--sm', style: { marginTop: 6 }, onClick: () => setOpen(!open) }, open ? t('Show less') : t('Show full')) : null);
}
function Pre({ text, maxHeight }) {
  return h('pre', { className: 'hd-pre', style: maxHeight ? { maxHeight } : undefined }, typeof text === 'string' ? text : JSON.stringify(text, null, 2));
}
function CopyBtn({ text, label }) {
  const [done, setDone] = React.useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(String(text)); setDone(true); setTimeout(() => setDone(false), 1200); } catch { /* ignore */ }
  };
  return h('button', { className: 'hd-btn hd-btn--ghost hd-btn--sm', onClick: copy, title: t('Copy') }, h(Icon, { name: 'copy', size: 11 }), done ? t('Copied') : (label || t('Copy')));
}
function Field({ label, children, style }) {
  return h('label', { className: 'hd-field', style },
    label ? h('span', { className: 'hd-field-label' }, label) : null, children);
}
function SearchBox({ value, onChange, placeholder, onEnter }) {
  return h('div', { className: 'hd-search' },
    h('span', { className: 'hd-search-icon' }, h(Icon, { name: 'search', size: 13 })),
    h('input', {
      className: 'hd-input', value: value || '', placeholder: placeholder || t('Search'),
      'aria-label': placeholder || t('Search'),
      onChange: (e) => onChange(e.target.value),
      onKeyDown: (e) => { if (e.key === 'Enter' && onEnter) onEnter(); },
    }));
}
function Select({ value, onChange, options, placeholder }) {
  return h('select', { className: 'hd-select', value: value || '', onChange: (e) => onChange(e.target.value) },
    placeholder ? h('option', { value: '' }, placeholder) : null,
    (options || []).map((opt) => {
      const value = typeof opt === 'string' ? opt : opt.value;
      const label = typeof opt === 'string' ? opt : opt.label;
      return h('option', { key: value, value }, label);
    }));
}
function Chip({ active, onClick, children }) {
  return h('button', { className: 'hd-chip' + (active ? ' hd-chip--active' : ''), onClick, type: 'button' }, children);
}
function Tabs({ items, value, onChange }) {
  return h('div', { className: 'hd-tabs', role: 'tablist', style: { padding: '0 0 0', borderBottom: 'none', marginBottom: 10 } },
    items.map((item) => h('button', {
      key: item.value, className: 'hd-tab' + (item.value === value ? ' hd-tab--active' : ''),
      onClick: () => onChange(item.value), type: 'button',
      role: 'tab', 'aria-selected': item.value === value,
    }, item.label, item.count !== undefined && item.count !== null ? h('span', { className: 'hd-tab-count' }, item.count) : null)));
}
function Seg({ items, value, onChange }) {
  return h('div', { className: 'hd-inline', style: { gap: 2, padding: 2, borderRadius: 8, background: 'var(--dsw-alias-bg-layer-2)' } },
    items.map((item) => h('button', {
      key: item.value, type: 'button',
      className: 'hd-btn hd-btn--sm ' + (item.value === value ? 'hd-btn--primary' : 'hd-btn--ghost'),
      onClick: () => onChange(item.value),
    }, item.label)));
}
/**
 * A dialog that keeps the keyboard: focus moves into it, Tab stays inside it, and the focus that
 * opened it comes back when it closes. Without this a keyboard user tabs straight out of the
 * dialog into the page behind it and never hears where they are.
 */
function useDialogFocus(open, onClose) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement;
    const node = ref.current;
    const items = () => Array.from(
      (node && node.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')) || [],
    ).filter((el) => !el.disabled && el.getAttribute('aria-hidden') !== 'true');
    const first = items()[0];
    (first || node)?.focus?.();
    const onKey = (e) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key !== 'Tab') return;
      const list = items();
      if (!list.length) return;
      const head = list[0];
      const tail = list[list.length - 1];
      if (e.shiftKey && document.activeElement === head) { e.preventDefault(); tail.focus(); }
      else if (!e.shiftKey && document.activeElement === tail) { e.preventDefault(); head.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      if (previous && typeof previous.focus === 'function') previous.focus();
    };
  }, [open, onClose]);
  return ref;
}

function Modal({ open, title, sub, onClose, children, footer, width }) {
  const focusRef = useDialogFocus(open, onClose);
  if (!open) return null;
  return h('div', { className: 'hd-modal-backdrop', onMouseDown: (e) => { if (e.target === e.currentTarget) onClose(); } },
    h('div', { className: 'hd-modal', ref: focusRef, tabIndex: -1, style: width ? { width } : undefined, role: 'dialog', 'aria-modal': 'true', 'aria-label': title },
      h('div', { className: 'hd-modal-head' },
        h('div', { className: 'hd-card-title', style: { fontSize: 14 } }, title),
        sub ? h('div', { className: 'hd-card-sub', style: { marginTop: 4 } }, sub) : null),
      h('div', { className: 'hd-modal-body' }, children),
      footer ? h('div', { className: 'hd-modal-foot' }, footer) : null));
}
function Drawer({ open, title, sub, onClose, children, footer }) {
  const focusRef = useDialogFocus(open, onClose);
  if (!open) return null;
  return h('div', { className: 'hd-drawer-backdrop', onMouseDown: (e) => { if (e.target === e.currentTarget) onClose(); } },
    h('aside', { className: 'hd-drawer', ref: focusRef, tabIndex: -1, role: 'dialog', 'aria-modal': 'true', 'aria-label': title },
      h('div', { className: 'hd-drawer-head' },
        h('div', { style: { minWidth: 0, flex: 1 } },
          h('div', { className: 'hd-card-title', style: { fontSize: 14 } }, title),
          sub ? h('div', { className: 'hd-card-sub', style: { marginTop: 3 } }, sub) : null),
        h(Btn, { icon: 'close', variant: 'ghost', size: 'sm', onClick: onClose, title: t('Close') })),
      h('div', { className: 'hd-drawer-body' }, children),
      footer ? h('div', { className: 'hd-drawer-foot' }, footer) : null));
}
// __PRIM_MORE__


// ---- 03-api.js ----
const API_BASE = '/api/holon-dashboard';
async function apiGet(resource, params = {}) {
  const url = new URL(API_BASE, location.origin);
  url.searchParams.set('resource', resource);
  for (const [key, value] of Object.entries(params || {})) {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value));
  }
  const res = await fetch(url, { credentials: 'same-origin', headers: { accept: 'application/json' } });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = null; }
  if (!res.ok) throw new Error(data?.error?.message || `The dashboard API answered HTTP ${res.status}.`);
  return data;
}

/**
 * The write token.
 *
 * The Host mints it and hands it out over a GET; a page on another origin can ask for it but
 * cannot read the answer, so it cannot write. The token is fetched once and kept for the life of
 * the page — the Host's token lasts as long as the Host does.
 */
let writeNonce = '';
let nonceRequest = null;
async function sessionNonce() {
  if (writeNonce) return writeNonce;
  if (!nonceRequest) {
    nonceRequest = apiGet('session', {})
      .then((data) => { writeNonce = String(data?.nonce || ''); return writeNonce; })
      .catch(() => { nonceRequest = null; return ''; });
  }
  return nonceRequest;
}
async function apiPost(action, payload = {}) {
  const nonce = await sessionNonce();
  const res = await fetch(API_BASE, {
    method: 'POST', credentials: 'same-origin',
    headers: {
      'content-type': 'application/json', 'x-holon-dashboard': '1', accept: 'application/json',
      ...(nonce ? { 'x-holon-write': nonce } : {}),
    },
    body: JSON.stringify({ action, ...payload }),
  });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = null; }
  if (!res.ok || data?.ok === false) throw new Error(data?.error?.message || data?.message || `The action answered HTTP ${res.status}.`);
  return data;
}
function useApi(resource, params = {}, options = {}) {
  const [state, setState] = React.useState({ data: null, error: null, loading: true });
  const key = JSON.stringify(params || {});
  const alive = React.useRef(true);
  React.useEffect(() => () => { alive.current = false; }, []);
  const load = React.useCallback(async () => {
    try {
      const data = await apiGet(resource, JSON.parse(key));
      if (alive.current) setState({ data, error: null, loading: false });
    } catch (error) {
      if (alive.current) setState((prev) => ({ data: prev.data, error, loading: false }));
    }
  }, [resource, key]);
  React.useEffect(() => { setState((prev) => ({ ...prev, loading: true })); load(); }, [load]);
  React.useEffect(() => {
    if (!options.poll) return undefined;
    const id = setInterval(() => { if (document.visibilityState === 'visible') load(); }, options.poll);
    return () => clearInterval(id);
  }, [load, options.poll]);
  return { ...state, reload: load };
}

/**
 * One fetch per resource for the whole page.
 *
 * The page shell, the Overview tab and the composer dock all want the overview, and an overview
 * is eleven kernel child processes. Three independent polls meant three assemblies of it every
 * minute. The store keeps one request and one timer per key; every consumer subscribes.
 */
const sharedRequests = new Map();
function sharedEntry(key, resource, params) {
  let entry = sharedRequests.get(key);
  if (!entry) {
    entry = { resource, params, data: null, error: null, loading: true, inflight: null, subscribers: new Set() };
    sharedRequests.set(key, entry);
  }
  return entry;
}
function sharedLoad(entry) {
  if (entry.inflight) return entry.inflight;
  const settle = (data, error) => {
    entry.data = data;
    entry.error = error;
    entry.loading = false;
    entry.inflight = null;
    for (const notify of Array.from(entry.subscribers)) notify();
  };
  entry.inflight = apiGet(entry.resource, entry.params).then(
    (data) => settle(data, null),
    (error) => settle(entry.data, error),
  );
  return entry.inflight;
}
function useSharedApi(resource, params = {}, options = {}) {
  const key = resource + '|' + JSON.stringify(params || {});
  const [, bump] = React.useReducer((n) => n + 1, 0);
  const poll = options.poll || 0;
  React.useEffect(() => {
    const entry = sharedEntry(key, resource, JSON.parse(JSON.stringify(params || {})));
    const notify = () => bump();
    entry.subscribers.add(notify);
    sharedLoad(entry);
    const timer = poll
      ? setInterval(() => { if (document.visibilityState === 'visible') sharedLoad(entry); }, poll)
      : null;
    return () => {
      entry.subscribers.delete(notify);
      if (timer) clearInterval(timer);
    };
  }, [key, poll]);
  const entry = sharedEntry(key, resource, JSON.parse(JSON.stringify(params || {})));
  return {
    data: entry.data,
    error: entry.error,
    loading: entry.loading,
    reload: () => sharedLoad(entry),
  };
}

/**
 * The resource assembled itself from several kernel reads; one of them failed. Without this the
 * page shows a healthy-looking zero for what it could not read — the "empty means ungoverned"
 * failure this repository's own laws warn about.
 */
function degradationError(data) {
  if (!data || !data.degraded) return null;
  const failures = Array.isArray(data.failures) ? data.failures : [];
  const detail = failures.map((f) => (f && f.message) || String(f)).join(' · ');
  return new Error(
    'Part of this instance could not be read, so the numbers below are incomplete: ' + detail,
  );
}
function useNow(interval = 30000) {
  const [now, setNow] = React.useState(Date.now());
  React.useEffect(() => { const id = setInterval(() => setNow(Date.now()), interval); return () => clearInterval(id); }, [interval]);
  return now;
}
function useDebounced(value, ms = 220) {
  const [out, setOut] = React.useState(value);
  React.useEffect(() => { const id = setTimeout(() => setOut(value), ms); return () => clearTimeout(id); }, [value, ms]);
  return out;
}

// ---- 10-overview.js ----
function PageHead({ title, sub, actions }) {
  return h('div', { className: 'hd-page-head' },
    h('div', { style: { minWidth: 0 } },
      h('div', { className: 'hd-page-title' }, title),
      sub ? h('div', { className: 'hd-page-sub' }, sub) : null),
    actions ? h('div', { className: 'hd-actions' }, actions) : null);
}

function OverviewStats({ data }) {
  const s = data.stats || {};
  const ready = s.readyStages || {};
  const age = data.heartbeat?.ageSeconds;
  const hbTone = !data.heartbeat?.present ? 'error' : data.heartbeat.stale ? 'warn' : 'ok';
  const docTone = s.doctorErrors === null ? 'warn' : s.doctorErrors > 0 ? 'error' : s.doctorWarnings > 0 ? 'warn' : 'ok';
  const cards = [
    ['Awaiting Chair', s.awaitingChair ?? '—', `${ready.approve || 0} approval stages`, 'brand', 'clock'],
    ['Ready stages', s.readyTotal ?? '—', Object.entries(ready).map(([k, v]) => `${v} ${k}`).join(' · '), 'brand', 'layers'],
    ['Open work', s.openWork ?? '—', `${s.doneWork || 0} done · ${s.cancelledWork || 0} cancelled`, '', 'activity'],
    ['Active runs', s.activeRuns ?? '—', `${data.recentRuns?.length || 0} recent`, s.activeRuns ? 'ok' : '', 'play'],
    ['Doctor', s.doctorErrors ?? '—', `${s.doctorWarnings || 0} warnings`, docTone, 'shield'],
    ['Heartbeat', age === null || age === undefined ? '—' : age + 's', data.heartbeat?.stale ? t('Stale') : t('Live'), hbTone, 'activity'],
  ];
  return h('div', { className: 'hd-grid hd-stat-grid' }, cards.map(([label, value, hint, tone, icon]) => h(Stat, {
    key: label, label: t(label), value, hint, tone, icon,
  })));
}
function ApprovalRow({ row, onOpenPlan, onAction }) {
  const title = row.work_title || row.title;
  return h('div', { className: 'hd-list-item' },
    h('div', { style: { paddingTop: 3 } }, h('span', { className: 'hd-dot hd-dot--' + (row.grade >= 3 ? 'warn' : 'brand') })),
    h('div', { className: 'hd-row-main', style: { cursor: 'pointer' }, onClick: () => onOpenPlan(row.id) },
      h('div', { className: 'hd-row-title' }, title),
      h('div', { className: 'hd-row-sub' },
        h('span', null, row.dept || '—'), h('span', null, 'G' + (row.grade ?? '?')),
        h('span', null, fmtAgo(row.created_at)), row.task_class ? h('span', null, row.task_class) : null)),
    h('div', { className: 'hd-row-meta' },
      h(Btn, { size: 'sm', onClick: () => onOpenPlan(row.id) }, t('Review')),
      h(Btn, { size: 'sm', variant: 'primary', icon: 'check', onClick: () => onAction({
        title: t('Approve') + ' · ' + title,
        description: 'Approving the plan moves the work to execute. The note is stored in the approval record.',
        action: 'plan.approve', payload: { ref: row.id },
        fields: [{ key: 'note', label: 'Note (optional)', type: 'textarea' }], submit: t('Approve'),
      }) }, t('Approve'))));
}

function ApprovalsCard({ stats, approvals, onOpenPlan, onAction, onNavigate }) {
  return h(Card, {
    title: t('Needs the Chair'),
    sub: `${stats.awaitingChair || 0} approvals · ${stats.unackedMessages || 0} unread messages`,
    actions: h(Btn, { size: 'sm', variant: 'ghost', icon: 'arrow', onClick: () => onNavigate('work') }, t('Approvals')),
  }, approvals.length
    ? h('div', { className: 'hd-list' }, approvals.slice(0, 7).map((row) => h(ApprovalRow, { key: row.id, row, onOpenPlan, onAction })))
    : h(Empty, null, t('No approvals waiting')));
}
function StageColumn({ stage }) {
  const total = stage.total || 0;
  const segments = [['ready', stage.ready || 0], ['claimed', stage.claimed || 0], ['done', stage.done || 0], ['failed', stage.failed || 0]];
  return h('div', { className: 'hd-stage-col' },
    h('div', { className: 'hd-stage-head' }, h('span', null, stage.stage), h('span', { className: 'hd-stage-total' }, total)),
    h('div', { className: 'hd-stage-bars' }, segments.map(([name, count]) => h('div', {
      key: name, className: 'hd-stage-seg hd-stage-seg--' + name,
      style: { width: total ? (count / total) * 100 + '%' : '0%' },
    }))),
    h('div', { className: 'hd-stage-meta' },
      h('span', null, `${stage.ready || 0} ready`), h('span', null, `${stage.claimed || 0} running`),
      h('span', null, `${stage.done || 0} done`)));
}

function PipelineCard({ pipeline }) {
  return h(Card, { title: t('Pipeline'), sub: 'Stage nodes by status, live from the work graph.' },
    h('div', { className: 'hd-pipeline' }, (pipeline || []).map((stage) => h(StageColumn, { key: stage.stage, stage }))));
}
function FindingRow({ finding }) {
  const tone = finding.severity === 'error' ? 'error' : finding.severity === 'warning' ? 'warn' : 'ok';
  return h('div', { className: 'hd-list-item' },
    h('div', { style: { paddingTop: 3 } }, h('span', { className: 'hd-dot hd-dot--' + tone })),
    h('div', { className: 'hd-row-main' },
      h('div', { className: 'hd-row-title' }, finding.check || 'check'),
      h('div', { className: 'hd-row-sub', style: { display: 'block', marginTop: 3 } }, finding.message)));
}

function HealthCard({ doctor, onNavigate }) {
  const findings = doctor.findings || [];
  const tone = doctor.errors ? 'error' : doctor.warnings ? 'warn' : 'ok';
  return h(Card, {
    title: t('Health'), sub: `${doctor.errors || 0} errors · ${doctor.warnings || 0} warnings`,
    actions: h(Btn, { size: 'sm', variant: 'ghost', icon: 'arrow', onClick: () => onNavigate('ops') }, t('Operations')),
  }, findings.length
    ? h('div', { className: 'hd-list' }, findings.slice(0, 7).map((finding, i) => h(FindingRow, { key: finding.check + i, finding })))
    : h('div', { className: 'hd-inline' }, h(Pill, { tone, dot: true }, doctor.errors ? t('Errors') : t('No findings'))));
}

function ActivityCard({ events }) {
  return h(Card, { title: t('Recent activity'), sub: 'Hash-chained kernel events, newest first.' }, events.length
    ? h('div', { className: 'hd-timeline' }, events.slice(0, 9).map((event) => h('div', { key: event.seq, className: 'hd-event' },
      h('span', { className: 'hd-event-dot', style: { background: event.to_status ? 'var(--dsw-alias-state-business-primary)' : undefined } }),
      h('div', { className: 'hd-event-body' },
        h('div', { className: 'hd-event-text' }, `${event.entity}${event.entity_id ? ' · ' + shortId(event.entity_id) : ''}${event.to_status ? ' → ' + event.to_status : ''}`),
        event.note ? h('div', { className: 'hd-muted hd-tiny' }, event.note.slice(0, 160)) : null,
        h('div', { className: 'hd-event-meta' }, h('span', null, event.actor), h('span', null, fmtAgo(event.ts)), h('span', null, '#' + event.seq))))))
    : h(Empty, null, t('No data')));
}
function metricLabel(key) {
  return key.replaceAll('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
function metricValue(key, value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
  if (key === 'gate_latency_h') return Number(value).toFixed(1) + 'h';
  if (key === 'cost_per_verified_result') return fmtTokens(value);
  return Math.round(Number(value) * 100) + '%';
}
function MetricsCard({ cards }) {
  return h(Card, { title: t('Metrics'), sub: 'Feedback-loop sensors with their counter-metric.' }, cards.length
    ? h('div', { className: 'hd-list' }, cards.map((m) => {
      const ratio = Math.max(0, Math.min(1, Number(m.value) || 0));
      return h('div', { key: m.key, className: 'hd-list-item' },
        h('div', { className: 'hd-row-main' },
          h('div', { className: 'hd-inline', style: { justifyContent: 'space-between' } },
            h('span', { className: 'hd-tiny hd-strong' }, metricLabel(m.key)),
            h('span', { className: 'hd-mono' }, metricValue(m.key, m.value))),
          m.key !== 'gate_latency_h' && m.key !== 'cost_per_verified_result'
            ? h('div', { className: 'hd-progress', style: { marginTop: 5 } }, h('div', { className: 'hd-progress-bar', style: { width: ratio * 100 + '%' } }))
            : null,
          h('div', { className: 'hd-muted hd-tiny', style: { marginTop: 3 } }, m.n ? `n=${m.n}` : 'sensor')));
    }))
    : h(Empty, null, t('No data')));
}
function PulseCard({ data, onNavigate }) {
  const schedules = data.schedules?.next || [];
  const drivers = data.drivers || [];
  return h(Card, {
    title: 'Organization pulse',
    actions: h(Btn, { size: 'sm', variant: 'ghost', icon: 'arrow', onClick: () => onNavigate('org') }, t('Organization')),
  },
  h('div', { className: 'hd-kv', style: { gridTemplateColumns: '90px 1fr' } },
    h('div', { className: 'hd-kv-key' }, t('Departments')), h('div', { className: 'hd-kv-val' }, `${data.org?.departments?.length || 0} departments · ${data.org?.employees || 0} employees`),
    h('div', { className: 'hd-kv-key' }, t('Drivers')), h('div', { className: 'hd-kv-val' }, `${drivers.length} installed · ${drivers.filter((d) => d.stages?.length).length} with stages`),
    h('div', { className: 'hd-kv-key' }, t('Schedules')), h('div', { className: 'hd-kv-val' }, `${data.schedules?.enabled || 0} enabled · ${data.schedules?.failing || 0} failing`)),
  schedules.length ? h('div', { className: 'hd-list', style: { marginTop: 8 } }, schedules.slice(0, 3).map((s) => h('div', { key: s.id, className: 'hd-list-item' },
    h('div', { className: 'hd-row-main' }, h('div', { className: 'hd-row-title' }, s.kind + ' · ' + (s.employee_id ? shortId(s.employee_id) : s.template_id ? shortId(s.template_id) : s.id)),
      h('div', { className: 'hd-row-sub' }, h('span', null, s.cron || '—'), h('span', null, 'next ' + fmtTime(s.next_run_at))))))) : null);
}

function OverviewPage({ onNavigate, onOpenPlan, onAction }) {
  const { data, error, loading, reload } = useSharedApi('overview', {}, { poll: 20000 });
  if (!data && loading) return h(Loading, null);
  if (!data) return h('div', { className: 'hd-page' }, h(ErrorBox, { error, onRetry: reload }));
  return h('div', { className: 'hd-page' },
    h(PageHead, {
      title: t('Holon Command Center'),
      sub: `${data.instance?.label || 'instance'} · ${data.instance?.home || ''} · ${data.instance?.version || ''}`,
      actions: h(Btn, { icon: 'refresh', size: 'sm', onClick: reload }, t('Refresh')),
    }),
    h(ErrorBox, { error: degradationError(data) }),
    h(OverviewStats, { data }),
    h('div', { className: 'hd-split', style: { marginTop: 12 } },
      h('div', { className: 'hd-grid' },
        h(ApprovalsCard, { stats: data.stats || {}, approvals: data.approvals || [], onOpenPlan, onAction, onNavigate }),
        h(PipelineCard, { pipeline: data.pipeline }),
        h(MetricsCard, { cards: data.metricCards || [] })),
      h('div', { className: 'hd-grid' },
        h(HealthCard, { doctor: data.doctor || {}, onNavigate }),
        h(ActivityCard, { events: data.events || [] }),
        h(PulseCard, { data, onNavigate }))));
}

// ---- 20-work.js ----
function TaskCard({ row, onOpen }) {
  const title = row.work_title || row.title;
  return h('div', { className: 'hd-task', onClick: () => onOpen(row) },
    h('div', { className: 'hd-task-title' }, title),
    h('div', { className: 'hd-task-meta' },
      h(Pill, { tone: toneFor(row.status), dot: true }, row.status),
      row.grade !== null && row.grade !== undefined ? h('span', null, 'G' + row.grade) : null,
      h('span', null, row.dept || '—'),
      row.assignee_name ? h('span', null, row.assignee_name) : null,
      h('span', null, fmtAgo(row.updated_at))));
}

function Board({ rows, onOpen }) {
  return h('div', { className: 'hd-board' }, STAGES.map((stage) => {
    const items = rows.filter((row) => row.stage === stage && !['done', 'cancelled'].includes(row.status));
    return h('div', { key: stage, className: 'hd-board-col' },
      h('div', { className: 'hd-board-head' },
        h('span', { className: 'hd-board-title' }, stage),
        h('span', { className: 'hd-board-count' }, items.length)),
      items.length ? items.map((row) => h(TaskCard, { key: row.id, row, onOpen })) : h('div', { className: 'hd-empty', style: { padding: '12px 4px' } }, '—'));
  }));
}
function WorkTable({ rows, onOpen, view }) {
  const columns = view === 'work'
    ? ['Title', 'Status', 'Department', 'Open stages', 'Priority', 'Updated']
    : ['Title', 'Stage', 'Status', 'Department', 'Assignee', 'Grade', 'Updated'];
  return h('div', { className: 'hd-table-wrap' }, h('table', { className: 'hd-table' },
    h('thead', null, h('tr', null, columns.map((c) => h('th', { key: c, className: 'hd-th' }, t(c))))),
    h('tbody', null, rows.map((row) => h('tr', { key: row.id, className: 'hd-tr', onClick: () => onOpen(row) },
      h('td', { className: 'hd-td' }, h('div', { className: 'hd-strong' }, row.work_title || row.title), h('div', { className: 'hd-muted hd-tiny hd-mono' }, shortId(row.id))),
      view === 'work' ? null : h('td', { className: 'hd-td', style: { textTransform: 'capitalize' } }, row.stage),
      h('td', { className: 'hd-td' }, h(Pill, { tone: toneFor(row.status), dot: true }, row.status)),
      h('td', { className: 'hd-td' }, row.dept || '—'),
      view === 'work' ? h('td', { className: 'hd-td' }, row.open_stages ?? 0) : h('td', { className: 'hd-td' }, row.assignee_name || '—'),
      view === 'work' ? h('td', { className: 'hd-td' }, 'P' + (row.priority ?? '?')) : h('td', { className: 'hd-td' }, row.grade !== null && row.grade !== undefined ? 'G' + row.grade : '—'),
      h('td', { className: 'hd-td hd-muted' }, fmtAgo(row.updated_at)))))));
}
function ApprovalItem({ row, onOpenPlan, onAction }) {
  const title = row.work_title || row.title;
  const tone = row.grade >= 3 ? 'warn' : 'brand';
  const approve = () => onAction({
    title: t('Approve') + ' · ' + title,
    description: 'Approving the plan moves the work to execute. The note is stored in the approval record.',
    action: 'plan.approve', payload: { ref: row.id },
    fields: [{ key: 'note', label: 'Note (optional)', type: 'textarea' }], submit: t('Approve'),
  });
  return h('div', { className: 'hd-list-item' },
    h('div', { style: { paddingTop: 3 } }, h('span', { className: 'hd-dot hd-dot--' + tone })),
    h('div', { className: 'hd-row-main', style: { cursor: 'pointer' }, onClick: () => onOpenPlan(row.id) },
      h('div', { className: 'hd-row-title' }, title),
      h('div', { className: 'hd-row-sub' },
        h('span', null, row.dept || '—'), h('span', null, 'G' + (row.grade ?? '?')),
        h('span', null, row.approver || 'chair'), h('span', null, fmtAgo(row.created_at)),
        row.lane ? h('span', null, row.lane) : null)),
    h('div', { className: 'hd-row-meta' },
      h(Btn, { size: 'sm', onClick: () => onOpenPlan(row.id) }, t('Review')),
      h(Btn, { size: 'sm', variant: 'primary', icon: 'check', onClick: approve }, t('Approve'))));
}

function ApprovalList({ rows, onOpenPlan, onAction }) {
  return h('div', { className: 'hd-list' }, rows.map((row) => h(ApprovalItem, { key: row.id, row, onOpenPlan, onAction })));
}

function WorkToolbar({ view, setView, mode, setMode, filters, search, setSearch, dept, setDept, stage, setStage, status, setStatus, onRefresh }) {
  const depts = (filters?.departments || []).map((d) => ({ value: d.slug, label: d.name }));
  const statuses = view === 'work'
    ? ['blocked', 'open', 'waiting', 'needs_input', 'done', 'failed', 'cancelled']
    : ['ready', 'claimed', 'done', 'failed', 'cancelled'];
  const reset = () => { setSearch(''); setDept(''); setStage(''); setStatus(''); };
  return h('div', null,
    h('div', { className: 'hd-toolbar' },
      h('div', { style: { minWidth: 150 } }, h(Seg, { items: [
        { value: 'stages', label: t('Board') }, { value: 'work', label: t('Work') }, { value: 'approvals', label: t('Approvals') },
      ], value: view, onChange: setView })),
      view === 'stages' ? h(Seg, { items: [{ value: 'board', label: t('Board') }, { value: 'table', label: t('List') }], value: mode, onChange: setMode }) : null,
      h(SearchBox, { value: search, onChange: setSearch, placeholder: 'Search title, id, department…' }),
      h('div', { style: { width: 150 } }, h(Select, { value: dept, onChange: setDept, options: depts, placeholder: t('Department') })),
      view === 'approvals' ? null : h('div', { style: { width: 130 } }, h(Select, { value: stage, onChange: setStage, options: STAGES, placeholder: t('Stage') })),
      view === 'approvals' ? null : h('div', { style: { width: 140 } }, h(Select, { value: status, onChange: setStatus, options: statuses, placeholder: t('Status') })),
      h(Btn, { icon: 'refresh', size: 'sm', variant: 'ghost', onClick: onRefresh }, t('Refresh')),
      h(Btn, { size: 'sm', variant: 'ghost', onClick: reset }, t('Reset'))));
}
function WorkPage({ focus, onClearFocus, onAction, onOpenRun }) {
  const [view, setView] = React.useState('stages');
  const [mode, setMode] = React.useState('board');
  const [search, setSearch] = React.useState('');
  const [dept, setDept] = React.useState('');
  const [stage, setStage] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [workId, setWorkId] = React.useState(null);
  const [planId, setPlanId] = React.useState(null);
  const q = useDebounced(search, 250);
  const { data, error, loading, reload } = useApi('work', { view, dept, stage, status, q, limit: 500 }, { poll: 20000 });
  React.useEffect(() => {
    if (!focus) return;
    if (focus.kind === 'plan') setPlanId(focus.id);
    else setWorkId(focus.id);
  }, [focus?.id]);
  const changeView = (next) => { setView(next); setStage(''); setStatus(''); };
  const closeWork = () => { setWorkId(null); if (onClearFocus) onClearFocus(); };
  const closePlan = () => { setPlanId(null); if (onClearFocus) onClearFocus(); };
  const open = (row) => { if (row.stage === 'approve') setPlanId(row.id); else setWorkId(row.id); };
  const rows = data?.rows || [];
  return h('div', { className: 'hd-page' },
    h(PageHead, {
      title: t('Work'), sub: `${rows.length} nodes · ${data?.work?.open || 0} open work · ${data?.pipeline?.reduce((n, s) => n + (s.ready || 0), 0) || 0} ready stages`,
      actions: h(React.Fragment, null,
        h(Btn, { icon: 'plus', size: 'sm', onClick: () => onAction({
          title: 'New work', action: 'task.add', description: 'Files a root work item as the Chair. The kernel plans it.',
          fields: [
            { key: 'title', label: 'Title', type: 'text', required: true },
            { key: 'intent', label: 'Intent', type: 'textarea', required: true },
            { key: 'acceptance', label: 'Acceptance', type: 'textarea' },
            { key: 'dept', label: 'Department', type: 'select', options: (data?.filters?.departments || []).map((d) => ({ value: d.slug, label: d.name })) },
            { key: 'priority', label: 'Priority', type: 'select', options: ['0','1','2','3','4'].map((n) => ({ value: n, label: 'P' + n })) },
            { key: 'risk', label: 'Risk', type: 'select', options: ['low','normal','high','irreversible'].map((r) => ({ value: r, label: r })) },
            { key: 'lane', label: 'Lane', type: 'select', options: ['auto','fast','full'].map((l) => ({ value: l, label: l })) },
          ], submit: 'Create', after: reload,
        }) }, 'New work'),
        h(Btn, { icon: 'plus', size: 'sm', onClick: () => onAction({
          command: 'objective add', title: t('New objective'),
          description: 'Files an objective for a department: the intent, the key results and the department that owns it.',
        }) }, t('New objective')),
        h(Btn, { icon: 'refresh', size: 'sm', onClick: reload }, t('Refresh'))),
    }),
    h(WorkToolbar, { view, setView: changeView, mode, setMode, filters: data?.filters, search, setSearch, dept, setDept, stage, setStage, status, setStatus, onRefresh: reload }),
    h(ErrorBox, { error, onRetry: reload }),
    h(ErrorBox, { error: degradationError(data) }),
    loading && !data ? h(Loading) : view === 'approvals'
      ? h(Card, { title: t('Approval queue'), sub: `${rows.length} waiting`, flush: true }, rows.length ? h(ApprovalList, { rows, onOpenPlan: setPlanId, onAction }) : h(Empty, null, t('No approvals waiting')))
      : view === 'work' || mode === 'table'
        ? h(Card, { flush: true }, rows.length ? h(WorkTable, { rows, onOpen: open, view }) : h(Empty))
        : h(Board, { rows, onOpen: open }),
    workId ? h(WorkDrawer, { id: workId, onClose: closeWork, onAction, onOpenRun }) : null,
    planId ? h(PlanDrawer, { id: planId, onClose: closePlan, onAction, onRefresh: reload }) : null);
}

// ---- 21-work-detail.js ----
function WorkDrawer({ id, onClose, onAction, onOpenRun }) {
  const { data, error, loading, reload } = useApi('workItem', { id }, { poll: 12000 });
  const work = data?.work;
  const stages = data?.stages || [];
  const runs = data?.runs || [];
  const status = work?.status;
  const cancel = () => onAction({
    title: t('Cancel') + ' · ' + (work?.title || id),
    description: 'Cancelling withdraws this work and its open stages and children. The reason is recorded in the audit trail.',
    action: 'task.cancel', payload: { id }, fields: [{ key: 'note', label: 'Reason', type: 'textarea', required: true }], submit: t('Cancel'), danger: true, after: onClose,
  });
  const retry = () => onAction({ title: t('Retry'), action: 'task.retry', payload: { id }, submit: t('Retry'), after: onClose });
  const replan = () => onAction({
    title: t('Replan'), action: 'task.replan', payload: { id },
    fields: [{ key: 'note', label: 'Note (optional)', type: 'textarea' }], submit: t('Replan'), after: onClose,
  });
  const footer = work ? h(React.Fragment, null,
    status === 'failed' ? h(Btn, { icon: 'refresh', onClick: retry }, t('Retry')) : null,
    ['open', 'blocked', 'needs_input', 'waiting'].includes(status) ? h(Btn, { icon: 'git', onClick: replan }, t('Replan')) : null,
    h('div', { style: { flex: 1 } }),
    ['done', 'cancelled'].includes(status) ? null : h(Btn, { variant: 'danger', icon: 'x', onClick: cancel }, t('Cancel'))) : null;
  return h(Drawer, { open: true, title: work?.title || 'Work', sub: id, onClose, footer },
    h(ErrorBox, { error, onRetry: reload }),
    loading && !data ? h(Loading) : null,
    work ? h('div', { className: 'hd-grid' },
      h(WorkFacts, { data }),
      h(EntityCommands, { families: ['task', 'memory'], values: { task_id: id }, title: t('Commands'), onAction }),
      h(WorkStages, { stages }),
      h(WorkRuns, { runs, onOpenRun }),
      data.artifacts?.length ? h(Card, { title: t('Artifacts') }, h('div', { className: 'hd-list' }, data.artifacts.map((a) => h('div', { key: a.path, className: 'hd-list-item' },
        h('span', { className: 'hd-dot hd-dot--' + (a.exists ? 'ok' : 'error') }),
        h('div', { className: 'hd-row-main' }, h('div', { className: 'hd-mono hd-truncate' }, a.path), h('div', { className: 'hd-row-sub' }, h('span', null, a.stage), h('span', null, a.kind))))))) : null,
      h(WorkMessages, { messages: data.messages || [] }),
      h(WorkEvents, { events: data.events || [] })) : null);
}
function WorkFacts({ data }) {
  const work = data.work;
  const rows = [
    ['Status', h(Pill, { tone: toneFor(work.status), dot: true }, work.status)],
    ['Department', work.dept || '—'],
    ['Assignee', work.assignee || '—'],
    ['Approver', work.approver || '—'],
    ['Priority', 'P' + (work.priority ?? '?') + ' · ' + (work.risk || 'normal')],
    ['Grade', work.grade !== null && work.grade !== undefined ? 'G' + work.grade : '—'],
    ['Lane', work.lane || '—'],
    ['Attempt', `${work.attempt ?? 0}/${work.max_attempts ?? '?'}`],
    ['Workdir', h('span', { className: 'hd-mono' }, work.workdir || '—')],
    ['Created', fmtTime(work.created_at)],
    ['Updated', fmtTime(work.updated_at)],
    work.blocked_reason ? ['Blocked', work.blocked_reason] : null,
    work.outcome ? ['Outcome', work.outcome] : null,
  ].filter(Boolean);
  return h(Card, { title: t('Detail'), sub: work.root_id === work.id ? 'Root work' : 'Stage node' },
    h(KV, { rows }),
    work.acceptance ? h('div', { style: { marginTop: 12 } }, h('div', { className: 'hd-field-label' }, t('Acceptance')), h(Prose, { text: work.acceptance, limit: 800 })) : null,
    work.intent ? h('div', { style: { marginTop: 12 } }, h('div', { className: 'hd-field-label' }, t('Intent')), h(Prose, { text: work.intent, limit: 1400 })) : null);
}
function StageRow({ stage }) {
  const out = stage.output;
  const body = out?.body;
  return h('div', { className: 'hd-list-item', style: { display: 'block' } },
    h('div', { className: 'hd-inline', style: { justifyContent: 'space-between' } },
      h('div', { className: 'hd-inline' },
        h('span', { className: 'hd-strong', style: { textTransform: 'capitalize' } }, stage.stage),
        h(Pill, { tone: toneFor(stage.status), dot: true }, stage.status),
        h('span', { className: 'hd-muted hd-tiny' }, stage.assignee || 'unassigned')),
      h('span', { className: 'hd-muted hd-tiny' }, `attempt ${stage.attempt ?? 0}/${stage.max_attempts ?? '?'}`)),
    out ? h('details', { style: { marginTop: 6 } },
      h('summary', { className: 'hd-tiny hd-muted', style: { cursor: 'pointer' } },
        `${out.kind} · ${out.summary || 'output'} · ${fmtAgo(out.created_at)}`),
      h('div', { style: { marginTop: 6 } }, h(Pre, { text: body || out.body || '', maxHeight: 320 }))) : h('div', { className: 'hd-muted hd-tiny', style: { marginTop: 4 } }, 'No output yet'),
    stage.decision_note ? h('div', { className: 'hd-muted hd-tiny', style: { marginTop: 4 } }, stage.decision_note) : null);
}

function WorkStages({ stages }) {
  return h(Card, { title: t('Stage') + 's', sub: `${stages.length} stage nodes` }, stages.length
    ? h('div', { className: 'hd-list' }, stages.map((stage) => h(StageRow, { key: stage.id, stage })))
    : h(Empty, null, 'No stages yet'));
}
function RunRow({ run, onOpenRun }) {
  const tone = run.status === 'succeeded' ? 'ok' : run.status === 'running' ? 'brand' : 'error';
  return h('div', { className: 'hd-list-item hd-list-item--click', onClick: () => onOpenRun(run.id) },
    h('span', { className: 'hd-dot hd-dot--' + tone }),
    h('div', { className: 'hd-row-main' },
      h('div', { className: 'hd-row-title' }, `${run.kind} · ${run.employee_name || run.employee_id || 'unassigned'}`),
      h('div', { className: 'hd-row-sub' },
        h('span', null, run.driver || '—'), h('span', null, fmtDuration(run.duration_s)),
        h('span', null, `${fmtTokens(run.tokens_in)} in / ${fmtTokens(run.tokens_out)} out`))),
    h('span', { className: 'hd-muted hd-tiny hd-mono' }, shortId(run.id)));
}

function WorkRuns({ runs, onOpenRun }) {
  return h(Card, { title: t('Runs'), sub: `${runs.length} run records` }, runs.length
    ? h('div', { className: 'hd-list' }, runs.map((run) => h(RunRow, { key: run.id, run, onOpenRun })))
    : h(Empty, null, t('No runs yet')));
}

function WorkMessages({ messages }) {
  if (!messages.length) return null;
  return h(Card, { title: t('Messages'), sub: `${messages.length} in this thread` },
    h('div', { className: 'hd-list' }, messages.map((m) => h('div', { key: m.id, className: 'hd-list-item' },
      h('div', { className: 'hd-row-main' },
        h('div', { className: 'hd-row-title' }, `${m.sender} · ${m.kind}`),
        h('div', { className: 'hd-row-sub', style: { display: 'block' } }, m.body)),
      h('span', { className: 'hd-muted hd-tiny' }, fmtAgo(m.ts))))));
}

function WorkEvents({ events }) {
  return h(Card, { title: t('Events'), sub: 'Status transitions for this work node' }, events.length
    ? h('div', { className: 'hd-timeline' }, events.map((e) => h('div', { key: e.seq, className: 'hd-event' },
      h('span', { className: 'hd-event-dot' }),
      h('div', { className: 'hd-event-body' },
        h('div', { className: 'hd-event-text' }, `${e.from_status || '—'} → ${e.to_status || '—'}`),
        e.note ? h('div', { className: 'hd-muted hd-tiny' }, e.note) : null,
        h('div', { className: 'hd-event-meta' }, h('span', null, e.actor), h('span', null, fmtTime(e.ts)))))))
    : h(Empty, null, t('No data')));
}
function PlanBody({ plan }) {
  const steps = Array.isArray(plan.steps) ? plan.steps : [];
  const writes = Array.isArray(plan.writes) ? plan.writes : [];
  const rubric = Array.isArray(plan.rubric) ? plan.rubric : [];
  return h(Card, { title: 'Plan', sub: plan.playbook ? 'playbook ' + plan.playbook : 'What the executor will do' },
    plan.findings ? h('div', null, h('div', { className: 'hd-field-label' }, 'Findings'), h(Prose, { text: plan.findings, limit: 1600 })) : null,
    steps.length ? h('div', { style: { marginTop: 10 } },
      h('div', { className: 'hd-field-label' }, 'Steps'),
      h('ol', { style: { margin: '5px 0 0 18px', padding: 0, fontSize: 11.5, lineHeight: 1.5 } }, steps.map((step, i) => h('li', { key: i }, step)))) : null,
    plan.command ? h('div', { style: { marginTop: 10 } }, h('div', { className: 'hd-field-label' }, 'Command'), h(Pre, { text: plan.command, maxHeight: 180 })) : null,
    writes.length ? h('div', { style: { marginTop: 10 } }, h('div', { className: 'hd-field-label' }, 'Writes'), h('div', { className: 'hd-chip-row' }, writes.map((w, i) => h(Pill, { key: i }, w)))) : null,
    rubric.length ? h('div', { style: { marginTop: 10 } }, h('div', { className: 'hd-field-label' }, 'Rubric'), h('div', { className: 'hd-list' }, rubric.map((r, i) => h('div', { key: i, className: 'hd-tiny' }, typeof r === 'string' ? r : JSON.stringify(r))))) : null);
}

function PlanDrawer({ id, onClose, onAction, onRefresh }) {
  const { data, error, loading, reload } = useApi('planItem', { id }, { poll: 0 });
  const approval = data?.approval;
  const plan = data?.plan || {};
  const title = approval?.work_title || approval?.title || 'Plan';
  const after = () => { if (onRefresh) onRefresh(); onClose(); };
  const approve = () => onAction({
    title: t('Approve') + ' · ' + title, description: 'Approving the plan moves the work to execute.',
    action: 'plan.approve', payload: { ref: id },
    fields: [
      { key: 'note', label: 'Note (optional)', type: 'textarea' },
      { key: 'recurring', label: 'Record as a recurring plan', type: 'checkbox' },
    ], submit: t('Approve'), after,
  });
  const reject = () => onAction({
    title: t('Reject') + ' · ' + title, description: 'Rejection tells the planner what must change. The note is required.',
    action: 'plan.reject', payload: { ref: id },
    fields: [{ key: 'note', label: 'What must change', type: 'textarea', required: true }],
    submit: t('Reject'), danger: true, after,
  });
  const grade = () => onAction({
    title: 'Regrade plan', description: 'Regrading reroutes the approval to the authority that owns the new grade.',
    action: 'plan.grade', payload: { ref: id },
    fields: [
      { key: 'grade', label: 'Grade', type: 'select', options: [0,1,2,3,4].map((n) => ({ value: String(n), label: 'G' + n })), required: true },
      { key: 'note', label: 'Why', type: 'textarea', required: true },
    ], submit: 'Regrade', after,
  });
  const footer = approval ? h(React.Fragment, null,
    h(Btn, { variant: 'danger', icon: 'x', onClick: reject }, t('Reject')),
    h(Btn, { icon: 'git', onClick: grade }, 'Regrade'),
    h('div', { style: { flex: 1 } }),
    h(Btn, { variant: 'primary', icon: 'check', onClick: approve }, t('Approve'))) : null;
  return h(Drawer, { open: true, title, sub: id, onClose, footer },
    h(ErrorBox, { error, onRetry: reload }),
    loading && !data ? h(Loading) : null,
    approval ? h('div', { className: 'hd-grid' },
      h(Card, null, h(KV, { rows: [
        ['Department', approval.dept || approval.dept_id || '—'],
        ['Approver', approval.approver || '—'],
        ['Grade', 'G' + (approval.grade ?? '?')],
        ['Priority', 'P' + (approval.priority ?? '?') + ' · ' + (approval.risk || 'normal')],
        ['Lane', approval.lane || '—'],
        ['Workdir', h('span', { className: 'hd-mono' }, approval.workdir || '—')],
        ['Created', fmtTime(approval.created_at)],
      ] })),
      h(PlanBody, { plan }),
      h(EntityCommands, { families: ['plan'], values: { ref: id }, title: t('Commands'), onAction }),
      approval.intent ? h(Card, { title: t('Intent') }, h(Prose, { text: approval.intent, limit: 2000 })) : null) : null);
}

// ---- 30-org.js ----
function DeptCard({ dept, onOpenEmployee, onOpenDept }) {
  const employees = dept.employees || [];
  return h(Card, { title: dept.name, sub: dept.mission || dept.slug,
    actions: h(Btn, { size: 'sm', icon: 'settings', onClick: () => onOpenDept(dept) }, t('Manage')) },
    h('div', { className: 'hd-inline', style: { marginBottom: 8 } },
      h(Pill, { tone: 'brand', dot: true }, dept.slug),
      h(Pill, null, (dept.profile || 'profile') + ' profile'),
      h(Pill, null, `${employees.length} employees`),
      dept.head_name ? h(Pill, null, 'head ' + dept.head_name) : null),
    employees.length ? h('div', { className: 'hd-chip-row' }, employees.map((emp) => h('button', {
      key: emp.id, className: 'hd-chip', onClick: () => onOpenEmployee(emp.id), title: emp.title || emp.name,
    }, initials(emp.name) + ' ' + emp.name))) : h('div', { className: 'hd-muted hd-tiny' }, 'No employees in this department'));
}

function EmployeeTable({ employees, onOpen }) {
  const cols = ['Employee', 'Title', 'Department', 'Driver', 'Status', 'Roles', 'Stages'];
  return h('div', { className: 'hd-table-wrap' }, h('table', { className: 'hd-table' },
    h('thead', null, h('tr', null, cols.map((c) => h('th', { key: c, className: 'hd-th' }, c)))),
    h('tbody', null, employees.map((emp) => h('tr', { key: emp.id, className: 'hd-tr', onClick: () => onOpen(emp.id) },
      h('td', { className: 'hd-td' }, h('div', { className: 'hd-inline' }, h('span', { className: 'hd-avatar' }, initials(emp.name)), h('div', null, h('div', { className: 'hd-strong' }, emp.name), h('div', { className: 'hd-muted hd-tiny hd-mono' }, shortId(emp.id))))),
      h('td', { className: 'hd-td' }, emp.title || '—'),
      h('td', { className: 'hd-td' }, emp.dept || '—'),
      h('td', { className: 'hd-td' }, h(Pill, { tone: 'brand' }, emp.driver || '—')),
      h('td', { className: 'hd-td' }, h(Pill, { tone: emp.status === 'active' ? 'ok' : 'warn', dot: true }, emp.status || '—')),
      h('td', { className: 'hd-td hd-tiny' }, (emp.roles || []).join(', ') || '—'),
      h('td', { className: 'hd-td hd-tiny' }, (emp.stages || []).join(', ') || '—'))))));
}
function EmployeeDrawer({ id, onClose, onAction, onRefresh }) {
  const { data, error, loading, reload } = useApi('employee', { id }, { poll: 0 });
  const emp = data?.employee;
  const after = () => { if (onRefresh) onRefresh(); onClose(); };
  const setDriver = () => onAction({
    title: t('Set driver') + ' · ' + (emp?.name || id), description: 'Rebinding keeps the employee record, authority and memory; the next dispatch uses the new harness.',
    action: 'hr.setDriver', payload: { employee: id },
    fields: [
      { key: 'driver', label: 'Driver', type: 'select', options: (data?.drivers || []).map((d) => ({ value: d.name, label: d.name })), required: true },
      { key: 'reason', label: 'Reason', type: 'textarea', required: true },
    ], submit: t('Set driver'), after,
  });
  const pause = () => onAction({
    title: t('Pause') + ' · ' + (emp?.name || id), description: 'A paused employee claims no new work. Work already assigned stays assigned.',
    action: 'hr.pause', payload: { employee: id }, fields: [{ key: 'reason', label: 'Reason', type: 'textarea', required: true }],
    submit: t('Pause'), danger: true, after,
  });
  const activate = () => onAction({
    title: t('Activate') + ' · ' + (emp?.name || id), action: 'hr.activate', payload: { employee: id },
    fields: [{ key: 'reason', label: 'Reason', type: 'textarea', required: true }], submit: t('Activate'), after,
  });
  const footer = emp ? h(React.Fragment, null,
    h(Btn, { icon: 'settings', onClick: setDriver }, t('Set driver')),
    h('div', { style: { flex: 1 } }),
    emp.status === 'active' ? h(Btn, { variant: 'danger', icon: 'pause', onClick: pause }, t('Pause')) : h(Btn, { variant: 'primary', icon: 'play', onClick: activate }, t('Activate'))) : null;
  return h(Drawer, { open: true, title: emp?.name || 'Employee', sub: id, onClose, footer },
    h(ErrorBox, { error, onRetry: reload }),
    loading && !data ? h(Loading) : null,
    emp ? h('div', { className: 'hd-grid' },
      h(Card, null, h(KV, { rows: [
        ['Title', emp.title || '—'], ['Department', emp.dept || emp.dept_id || '—'],
        ['Driver', h(Pill, { tone: 'brand' }, emp.driver || '—')], ['Status', h(Pill, { tone: emp.status === 'active' ? 'ok' : 'warn', dot: true }, emp.status || '—')],
        ['Reports to', emp.reports_to || '—'], ['Concurrency', String(emp.max_concurrency ?? '—')],
        ['Roles', (emp.roles || []).join(', ') || '—'], ['Stages', (emp.stages || []).join(', ') || '—'],
        ['Classes', (emp.task_classes || []).join(', ') || '—'], ['Skills', (emp.skills || []).join(', ') || '—'],
        ['Hired', fmtTime(emp.hired_at)], ['Reason', emp.hired_reason || '—'],
      ] })),
      h(EntityCommands, { families: ['hr', 'emp'], values: { employee: id }, title: t('Commands'), onAction }),
      emp.job_description ? h(Card, { title: 'Job description' }, h(Prose, { text: emp.job_description, limit: 1800 })) : null,
      data.review ? h(Card, { title: 'Evidence review' }, h(Pre, { text: data.review, maxHeight: 300 })) : null) : null);
}
function OrgPage({ onAction }) {
  const { data, error, loading, reload } = useApi('org', {}, { poll: 60000 });
  const [search, setSearch] = React.useState('');
  const [selected, setSelected] = React.useState(null);
  const [dept, setDept] = React.useState(null);
  if (!data && loading) return h(Loading, null);
  if (!data) return h('div', { className: 'hd-page' }, h(ErrorBox, { error, onRetry: reload }));
  const departments = data.departments || [];
  const employees = data.employees || [];
  const q = search.trim().toLowerCase();
  const filtered = q ? employees.filter((e) => [e.name, e.title, e.dept, e.driver, e.roles?.join(' '), e.task_classes?.join(' ')].join(' ').toLowerCase().includes(q)) : employees;
  const active = employees.filter((e) => e.status === 'active').length;
  return h('div', { className: 'hd-page' },
    h(PageHead, { title: t('Organization'), sub: `${departments.length} departments · ${employees.length} employees · ${data.drivers?.length || 0} drivers`, actions: h(React.Fragment, null,
      h(Btn, { icon: 'plus', size: 'sm', onClick: () => onAction({
        command: 'dept create', title: t('New department'),
        description: 'Creates a department from a bylaws profile. The slug is how every other command names it.',
      }) }, t('New department')),
      h(Btn, { icon: 'users', size: 'sm', onClick: () => onAction({
        command: 'hr hire', title: t('Hire employee'),
        description: 'Files an employee record: name, title, department, job description, driver and the reason.',
      }) }, t('Hire employee')),
      h(Btn, { icon: 'refresh', size: 'sm', onClick: reload }, t('Refresh'))) }),
    h('div', { className: 'hd-grid hd-stat-grid' },
      h(Stat, { label: t('Departments'), value: departments.length, hint: `${departments.filter((d) => d.employees?.length).length} staffed`, icon: 'layers' }),
      h(Stat, { label: t('Employees'), value: employees.length, hint: `${active} active · ${employees.length - active} paused`, tone: active ? 'ok' : 'warn', icon: 'users' }),
      h(Stat, { label: t('Drivers'), value: data.drivers?.length || 0, hint: (data.drivers || []).map((d) => d.name).join(' · '), icon: 'terminal' }),
      h(Stat, { label: 'Autonomy', value: (data.autonomy || []).length, hint: 'department policies', icon: 'shield' })),
    h('div', { className: 'hd-grid', style: { gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', marginTop: 12 } }, departments.map((d) => h(DeptCard, { key: d.id, dept: d, onOpenEmployee: setSelected, onOpenDept: setDept }))),
    h(Card, { title: t('Employees'), sub: `${filtered.length} shown`, actions: h('div', { style: { width: 220 } }, h(SearchBox, { value: search, onChange: setSearch, placeholder: 'Filter people…' })), flush: true, style: { marginTop: 12 } },
      filtered.length ? h(EmployeeTable, { employees: filtered, onOpen: setSelected }) : h(Empty)),
    selected ? h(EmployeeDrawer, { id: selected, onClose: () => setSelected(null), onAction, onRefresh: reload }) : null,
    dept ? h(EntityDrawer, {
      title: dept.name, sub: dept.slug, families: ['dept'], values: { slug: dept.slug },
      facts: [
        ['Slug', dept.slug], ['Name', dept.name], ['Mission', dept.mission || '—'],
        ['Head', dept.head_name || '—'], ['Profile', dept.profile || '—'],
        ['Employees', String((dept.employees || []).length)],
      ],
      onClose: () => setDept(null), onAction,
    }) : null);
}

// ---- 40-runs.js ----
function RunsTable({ rows, onOpen }) {
  const cols = ['Run', 'Stage', 'Task', 'Employee', 'Driver', 'Status', 'Started', 'Duration', 'Tokens'];
  return h('div', { className: 'hd-table-wrap' }, h('table', { className: 'hd-table' },
    h('thead', null, h('tr', null, cols.map((c) => h('th', { key: c, className: 'hd-th' }, c)))),
    h('tbody', null, rows.map((run) => h('tr', { key: run.id, className: 'hd-tr', onClick: () => onOpen(run.id) },
      h('td', { className: 'hd-td hd-mono' }, shortId(run.id)),
      h('td', { className: 'hd-td', style: { textTransform: 'capitalize' } }, run.stage || run.kind),
      h('td', { className: 'hd-td' }, h('div', { className: 'hd-truncate', style: { maxWidth: 320 } }, run.task_title || '—')),
      h('td', { className: 'hd-td' }, run.employee_name || '—'),
      h('td', { className: 'hd-td' }, h(Pill, { tone: 'brand' }, run.driver || '—')),
      h('td', { className: 'hd-td' }, h(Pill, { tone: run.status === 'succeeded' ? 'ok' : run.status === 'running' ? 'brand' : 'error', dot: true }, run.status)),
      h('td', { className: 'hd-td hd-tiny' }, fmtAgo(run.started_at)),
      h('td', { className: 'hd-td' }, fmtDuration(run.duration_s)),
      h('td', { className: 'hd-td hd-tiny' }, fmtTokens(run.tokens_in) + ' / ' + fmtTokens(run.tokens_out)))))));
}
function RunsPage({ focus, onClearFocus, onOpenWork, onAction }) {
  const [status, setStatus] = React.useState('');
  const [driver, setDriver] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [selected, setSelected] = React.useState(null);
  const q = useDebounced(search, 200);
  const { data, error, loading, reload } = useApi('runs', { status, driver, limit: 300 }, { poll: 10000 });
  React.useEffect(() => { if (focus?.id) setSelected(focus.id); }, [focus?.id]);
  const rows = (data?.rows || []).filter((run) => !q || [run.id, run.task_title, run.employee_name, run.driver, run.stage].join(' ').toLowerCase().includes(q.toLowerCase()));
  const counts = data?.counts || {};
  const drivers = [...new Set((data?.rows || []).map((r) => r.driver).filter(Boolean))];
  const open = (id) => setSelected(id);
  const close = () => { setSelected(null); if (onClearFocus) onClearFocus(); };
  return h('div', { className: 'hd-page' },
    h(PageHead, { title: t('Runs'), sub: 'Every dispatch, lease and token count in the run ledger.', actions: h(Btn, { icon: 'refresh', size: 'sm', onClick: reload }, t('Refresh')) }),
    h('div', { className: 'hd-grid hd-stat-grid' },
      h(Stat, { label: 'Running', value: counts.running || 0, hint: 'live leases', tone: counts.running ? 'brand' : '', icon: 'play' }),
      h(Stat, { label: 'Succeeded', value: counts.succeeded || 0, hint: 'completed runs', tone: 'ok', icon: 'check' }),
      h(Stat, { label: 'Failed', value: (counts.failed || 0) + (counts.timeout || 0) + (counts.abandoned || 0), hint: `${counts.failed || 0} failed · ${counts.timeout || 0} timeout`, tone: 'error', icon: 'alert' }),
      h(Stat, { label: 'Records', value: rows.length, hint: 'loaded window', icon: 'database' })),
    h('div', { className: 'hd-toolbar', style: { marginTop: 12 } },
      h(SearchBox, { value: search, onChange: setSearch, placeholder: 'Filter runs, tasks, people…' }),
      h('div', { style: { width: 140 } }, h(Select, { value: status, onChange: setStatus, options: ['running', 'succeeded', 'failed', 'timeout', 'abandoned'], placeholder: t('Status') })),
      h('div', { style: { width: 150 } }, h(Select, { value: driver, onChange: setDriver, options: drivers, placeholder: t('Drivers') }))),
    h(ErrorBox, { error, onRetry: reload }),
    loading && !data ? h(Loading) : h(Card, { flush: true }, rows.length ? h(RunsTable, { rows, onOpen: open }) : h(Empty, null, t('No runs yet'))),
    selected ? h(RunDrawer, { id: selected, onClose: close, onOpenWork, onAction }) : null);
}
function RunDrawer({ id, onClose, onOpenWork, onAction }) {
  const { data, error, loading, reload } = useApi('runItem', { id }, { poll: 0 });
  const [tab, setTab] = React.useState('log');
  const footer = data && onOpenWork ? h(Btn, { icon: 'arrow', onClick: () => { onOpenWork(data.task_id); onClose(); } }, t('Open item')) : null;
  const log = data?.log;
  const result = data?.result;
  const trajectory = data?.trajectory;
  const brief = data?.brief;
  const files = data?.files || [];
  return h(Drawer, { open: true, title: data?.task_title || 'Run', sub: id, onClose, footer },
    h(ErrorBox, { error, onRetry: reload }),
    loading && !data ? h(Loading) : null,
    data ? h('div', { className: 'hd-grid' },
      h(Card, null, h(KV, { rows: [
        ['Status', h(Pill, { tone: data.status === 'succeeded' ? 'ok' : data.status === 'running' ? 'brand' : 'error', dot: true }, data.status)],
        ['Stage', data.stage || data.kind], ['Driver', data.driver || '—'],
        ['Employee', data.employee_name || data.employee_id || '—'],
        ['Started', fmtTime(data.started_at)], ['Ended', fmtTime(data.ended_at)],
        ['Duration', fmtDuration(data.duration_s)], ['Exit', data.exit_code === null || data.exit_code === undefined ? '—' : String(data.exit_code)],
        ['Tokens', `${fmtTokens(data.tokens_in)} in / ${fmtTokens(data.tokens_out)} out`],
        ['Tools', data.tool_calls === null || data.tool_calls === undefined ? '—' : String(data.tool_calls)],
        ['Lease', fmtTime(data.lease_until)], ['Build', data.harness_build || '—'],
        ['Log', h('span', { className: 'hd-mono hd-tiny' }, data.log_path || '—')],
      ] })),
      h(Card, { title: 'Evidence', actions: h(Seg, { items: [
        { value: 'log', label: 'Log' }, { value: 'result', label: 'Result' }, { value: 'trajectory', label: 'Trajectory' }, { value: 'brief', label: 'Brief' }, { value: 'files', label: 'Files' },
      ], value: tab, onChange: setTab }) },
        tab === 'log' ? (log?.ok ? h(Pre, { text: log.text, maxHeight: 480 }) : h(Empty, null, log?.error || 'No log')) : null,
        tab === 'result' ? (result?.ok ? h(Pre, { text: result.value ?? result.text, maxHeight: 480 }) : h(Empty, null, result?.error || 'No result.json')) : null,
        tab === 'trajectory' ? (trajectory?.ok ? h(Pre, { text: trajectory.text, maxHeight: 480 }) : h(Empty, null, trajectory?.error || 'No trajectory')) : null,
        tab === 'brief' ? (brief?.ok ? h(Prose, { text: brief.text }) : h(Empty, null, brief?.error || 'No brief')) : null,
        tab === 'files' ? (files.length ? h('div', { className: 'hd-list' }, files.map((f) => h('div', { key: f.name, className: 'hd-list-item' },
          h('span', { className: 'hd-mono hd-tiny' }, f.name), h('span', { className: 'hd-muted hd-tiny', style: { marginLeft: 'auto' } }, f.size === null ? '—' : `${Math.round(f.size / 1024)} KiB`)))) : h(Empty, null, 'No files')) : null),
      onAction ? h(EntityCommands, { families: ['run'], values: { run_id: id }, title: t('Commands'), onAction }) : null) : null);
}

// ---- 50-knowledge.js ----
function SkillList({ skills, onOpen }) {
  return h('div', { className: 'hd-list' }, skills.map((skill) => h('div', {
    key: skill.name, className: 'hd-list-item hd-list-item--click', onClick: () => onOpen(skill),
  },
    h('div', { className: 'hd-row-main' },
      h('div', { className: 'hd-row-title' }, skill.name),
      h('div', { className: 'hd-row-sub' }, h('span', null, skill.kind || '—'), h('span', null, 'v' + (skill.version || '?')),
        h('span', null, skill.source || '—'), h('span', null, (skill.roles || []).join(', ') || 'no roles'))),
    h('span', { className: 'hd-muted hd-tiny' }, (skill.files || []).length + ' files'))));
}

function PlaybookList({ playbooks, onOpen }) {
  return h('div', { className: 'hd-list' }, playbooks.map((pb) => h('div', {
    key: pb.dept + '/' + pb.name, className: 'hd-list-item hd-list-item--click', onClick: () => onOpen(pb),
  },
    h('div', { className: 'hd-row-main' },
      h('div', { className: 'hd-row-title' }, pb.name),
      h('div', { className: 'hd-row-sub' }, h('span', null, pb.dept), h('span', null, 'v' + pb.version), h('span', null, `${pb.criteria || 0} criteria`))),
    h(Pill, { tone: 'brand' }, 'playbook'))));
}

function KbRow({ name, kb }) {
  return h('div', { className: 'hd-list-item' },
    h('div', { className: 'hd-row-main' },
      h('div', { className: 'hd-row-title' }, name),
      h('div', { className: 'hd-row-sub' },
        h('span', null, kb?.dept || 'org'), h('span', null, kb?.blueprint || '—'),
        h('span', null, kb?.created ? fmtTime(kb.created) : ''))),
    h(Pill, { tone: 'ok' }, 'seeded'));
}

function KbList({ kbs }) {
  const rows = kbs && typeof kbs === 'object' ? Object.entries(kbs) : [];
  return h('div', { className: 'hd-list' }, rows.map(([name, kb]) => h(KbRow, { key: name, name, kb })));
}

function MemoryList({ memory, onOpen }) {
  return h('div', { className: 'hd-list' }, memory.map((item) => h('div', {
    key: item.id, className: 'hd-list-item hd-list-item--click', onClick: () => onOpen(item),
  },
    h('div', { className: 'hd-row-main' },
      h('div', { className: 'hd-row-title' }, item.content),
      h('div', { className: 'hd-row-sub' }, h('span', null, item.scope), h('span', null, item.kind), h('span', null, item.confidence || '—'), item.pinned ? h('span', null, 'pinned') : null),
      item.provenance ? h('div', { className: 'hd-muted hd-tiny hd-mono', style: { marginTop: 3 } }, item.provenance) : null))));
}

function EpisodeList({ episodes }) {
  return h('div', { className: 'hd-list' }, episodes.map((ep) => h('div', { key: ep.id, className: 'hd-list-item' },
    h('span', { className: 'hd-dot hd-dot--' + (ep.outcome === 'success' ? 'ok' : 'error') }),
    h('div', { className: 'hd-row-main' },
      h('div', { className: 'hd-row-title' }, ep.digest || ep.id),
      h('div', { className: 'hd-row-sub' }, h('span', null, ep.scope), h('span', null, ep.outcome), h('span', null, fmtAgo(ep.ts)),
        ep.task_id ? h('span', { className: 'hd-mono' }, shortId(ep.task_id)) : null)))));
}
function KnowledgePage({ onAction }) {
  const [input, setInput] = React.useState('');
  const [query, setQuery] = React.useState('');
  const [view, setView] = React.useState('skills');
  const [selected, setSelected] = React.useState(null);
  const { data, error, loading, reload } = useApi('knowledge', { q: query, limit: 20 }, { poll: 0 });
  const ask = () => { const next = input.trim(); if (next) { setQuery(next); setView('recall'); } };
  const tabs = [
    { value: 'skills', label: t('Skills'), count: data?.skills?.length || 0 },
    { value: 'playbooks', label: t('Playbooks'), count: data?.playbooks?.length || 0 },
    { value: 'kbs', label: t('Knowledge bases'), count: data?.kbs ? Object.keys(data.kbs).length : 0 },
  ];
  if (query) tabs.unshift(
    { value: 'recall', label: t('Recall') },
    { value: 'memory', label: t('Memory'), count: Array.isArray(data?.memory) ? data.memory.length : 0 },
    { value: 'episodes', label: t('Episodes'), count: Array.isArray(data?.episodes) ? data.episodes.length : 0 });
  const recall = data?.recall;
  const openSkill = (skill) => setSelected({
    title: skill.name, sub: skill.source || 'skill', families: ['skill'], values: { name: skill.name },
    facts: [['Kind', skill.kind || '—'], ['Version', 'v' + (skill.version || '?')], ['Source', skill.source || '—'],
      ['Roles', (skill.roles || []).join(', ') || '—'], ['Files', String((skill.files || []).length)]],
  });
  const openPlaybook = (pb) => setSelected({
    title: pb.name, sub: pb.dept, families: ['playbook'], values: { name: pb.name, dept: pb.dept },
    facts: [['Department', pb.dept || '—'], ['Version', 'v' + (pb.version || '?')], ['Criteria', String(pb.criteria || 0)]],
  });
  const openMemory = (item) => setSelected({
    title: item.kind || 'memory', sub: item.id, families: ['memory'], values: { item_id: item.id },
    facts: [['Scope', item.scope || '—'], ['Kind', item.kind || '—'], ['Confidence', item.confidence || '—'],
      ['Pinned', item.pinned ? 'yes' : 'no'], ['Provenance', item.provenance || '—']],
  });
  return h('div', { className: 'hd-page' },
    h(PageHead, { title: t('Knowledge'), sub: 'Ask the joined knowledge layer, or browse the organization\'s skills, playbooks and bases.', actions: h(React.Fragment, null,
      h(Btn, { icon: 'plus', size: 'sm', onClick: () => onAction({
        command: 'skill new', title: t('New skill'),
        description: 'Creates a skill in the library: its name, its kind, what it is for and the roles it serves.',
      }) }, t('New skill')),
      h(Btn, { icon: 'plus', size: 'sm', onClick: () => onAction({
        command: 'memory add', title: t('New memory'),
        description: 'Pins an item into the organization\'s memory: the scope, the kind and the content.',
      }) }, t('New memory')),
      h(Btn, { icon: 'database', size: 'sm', onClick: () => onAction({
        command: 'kb seed', title: t('Seed knowledge base'),
        description: 'Seeds a knowledge base for a department from a blueprint.',
      }) }, t('Seed knowledge base')),
      h(Btn, { icon: 'refresh', size: 'sm', onClick: reload }, t('Refresh'))) }),
    h('div', { className: 'hd-toolbar' },
      h(SearchBox, { value: input, onChange: setInput, placeholder: 'Ask what the organization knows…', onEnter: ask }),
      h(Btn, { variant: 'primary', icon: 'search', onClick: ask }, t('Ask the organization'))),
    h(ErrorBox, { error, onRetry: reload }),
    h(Tabs, { items: tabs, value: view, onChange: setView }),
    loading && !data ? h(Loading) : null,
    !data ? null : view === 'recall' ? h(Card, { title: `Recall · ${query}` }, recall?.markdown ? h(Prose, { text: recall.markdown }) : h(Empty, null, recall?.error?.message || 'No recall answer'))
      : view === 'memory' ? (Array.isArray(data.memory) && data.memory.length ? h(Card, { title: t('Memory'), flush: false }, h(MemoryList, { memory: data.memory, onOpen: openMemory })) : h(Empty, null, data.memory?.error?.message || 'No memory matches'))
        : view === 'episodes' ? (Array.isArray(data.episodes) && data.episodes.length ? h(Card, { title: t('Episodes') }, h(EpisodeList, { episodes: data.episodes })) : h(Empty, null, data.episodes?.error?.message || 'No episode matches'))
          : view === 'skills' ? h(Card, { title: t('Skills'), flush: false }, h(SkillList, { skills: data.skills || [], onOpen: openSkill }))
            : view === 'playbooks' ? h(Card, { title: t('Playbooks') }, h(PlaybookList, { playbooks: data.playbooks || [], onOpen: openPlaybook }))
              : h(Card, { title: t('Knowledge bases') }, h(KbList, { kbs: data.kbs })),
    selected ? h(EntityDrawer, {
      title: selected.title, sub: selected.sub, families: selected.families, values: selected.values,
      facts: selected.facts, onClose: () => setSelected(null), onAction,
    }) : null);
}

// ---- 55-console.js ----
/**
 * The console: every command the kernel offers, as a form.
 *
 * The dashboard used to be a status surface with nineteen hand-written buttons while the kernel
 * registered 130 commands. This page replaces that twin with the kernel's own catalogue: pick a
 * command, fill the arguments its manifest declares, run it, read the answer.
 *
 * Nothing here decides what is safe — the manifest does (a `path` or a `shell` argument is not
 * offered, and the Host refuses one that arrives). This page only renders.
 *
 * The same catalogue is what binds a command to the OBJECT it acts on: a command whose first
 * positional is the identifier of a work item, an employee, a department, a skill, a memory item
 * or a message is an action ON that object, and the object therefore offers it. The list of
 * actions is derived, so a command added to the kernel appears on the objects it belongs to
 * without a line of client code.
 */

/**
 * A field the Chair writes a paragraph into, so it gets a textarea rather than a single line.
 *
 * The kernel already marks the prose it resolves as a file or stdin (`text`), and that is most of
 * the set; the rest is the short tail of prose the kernel does not resolve.
 */
const PROSE_ARGS = ['note', 'reason', 'description', 'body', 'text', 'content'];

/**
 * The commands that act on one object.
 *
 * The Host already worked out which commands of which family act on which identifier; the browser
 * only looks it up, so a command the kernel adds reaches this object without a line of client
 * code, and a command the kernel takes away disappears with it.
 */
function entityCommands(catalogue, families, values) {
  const names = Object.keys(values || {});
  const found = [];
  for (const family of families || []) {
    const byName = catalogue?.entities?.[family] || {};
    for (const name of names) {
      for (const command of byName[name] || []) if (!found.includes(command)) found.push(command);
    }
  }
  return found;
}

/** The command that shows one object in depth: the family's own read of that object. */
function previewCommand(catalogue, families, values) {
  const names = Object.keys(values || {});
  for (const family of families || []) {
    const byName = catalogue?.previews?.[family] || {};
    for (const name of names) {
      const preview = byName[name];
      if (preview) return preview;
    }
  }
  return null;
}

function CommandArg({ arg, value, onChange }) {
  const label = arg.flag || arg.name;
  const help = arg.help || '';
  if (arg.fenced) {
    // The manifest says this argument names a file or a command line. The browser is not
    // offered it; the form says so rather than pretending the command does not need it.
    return h('div', { key: arg.name },
      h('div', { className: 'hd-muted hd-tiny' }, `${label} — ${arg.fenced === 'path' ? 'names a file: the console does not offer it' : 'is a command line: the console does not offer it'}`));
  }
  if (arg.kind === 'boolean') {
    return h('label', { key: arg.name, className: 'hd-inline', style: { fontSize: 11.5, cursor: 'pointer' } },
      h('input', { type: 'checkbox', checked: Boolean(value), onChange: (e) => onChange(e.target.checked) }),
      h('span', null, label));
  }
  const field = h(Field, { label: label + (arg.required ? ' *' : ''), key: arg.name },
    arg.choices
      ? h(Select, { value: value || '', onChange, options: ['', ...arg.choices] })
      : (arg.text || PROSE_ARGS.includes(arg.name))
        ? h('textarea', { className: 'hd-textarea', rows: 3, value: value || '', onChange: (e) => onChange(e.target.value) })
        : h('input', {
          className: 'hd-input', value: value ?? '',
          type: arg.kind === 'integer' || arg.kind === 'number' ? 'number' : 'text',
          onChange: (e) => onChange(e.target.value),
        }));
  return h('div', { key: arg.name },
    field,
    help ? h('div', { className: 'hd-muted hd-tiny', style: { marginTop: 2 } }, help) : null);
}

function CommandForm({ command, prefill, onRun, busy, error, result }) {
  const [values, setValues] = React.useState({});
  const [confirm, setConfirm] = React.useState('');
  const [more, setMore] = React.useState(false);
  const args = command?.args || [];
  const fillable = args.filter((arg) => !arg.fenced);
  const primary = fillable.filter((arg) => arg.required || (arg.default !== null && arg.default !== undefined));
  const secondary = fillable.filter((arg) => !primary.includes(arg));
  React.useEffect(() => {
    const initial = {};
    for (const arg of fillable) {
      if (prefill && prefill[arg.name] !== undefined && prefill[arg.name] !== null) {
        initial[arg.name] = prefill[arg.name];
        continue;
      }
      if (arg.default !== null && arg.default !== undefined) {
        initial[arg.name] = arg.kind === 'boolean' ? Boolean(arg.default) : arg.default;
      }
    }
    setValues(initial); setConfirm(''); setMore(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [command?.command, JSON.stringify(prefill || {})]);
  if (!command) return null;
  const set = (name, value) => setValues((prev) => ({ ...prev, [name]: value }));
  const write = command.mutates;
  const submit = () => onRun(command.command, values, write ? confirm : '');
  return h('div', { className: 'hd-grid' },
    h(Card, { title: command.command, sub: command.help },
      h('div', { className: 'hd-inline', style: { marginBottom: 8 } },
        h(Pill, { tone: command.mutates ? 'warn' : 'quiet' }, command.mutates ? 'writes' : 'reads'),
        h(Pill, { tone: 'quiet' }, command.actor)),
      primary.length
        ? h('div', { className: 'hd-grid' }, primary.map((arg) => h(CommandArg, {
          key: arg.name, arg, value: values[arg.name], onChange: (v) => set(arg.name, v),
        })))
        : h(Empty, null, 'This command takes no arguments.'),
      secondary.length
        ? h('div', { style: { marginTop: 8 } },
          h('button', { type: 'button', className: 'hd-btn hd-btn--ghost hd-btn--sm', onClick: () => setMore(!more) },
            more ? 'Fewer options' : `More options (${secondary.length})`),
          more ? h('div', { className: 'hd-grid', style: { marginTop: 8 } }, secondary.map((arg) => h(CommandArg, {
            key: arg.name, arg, value: values[arg.name], onChange: (v) => set(arg.name, v),
          }))) : null)
        : null,
      args.some((arg) => arg.fenced)
        ? h('div', { className: 'hd-muted hd-tiny', style: { marginTop: 8 } },
          'This command also takes an argument the console does not offer; run it from the CLI.')
        : null,
      write
        ? h('div', { style: { marginTop: 10 } },
          h(Field, { label: `Type ${command.command} to confirm` },
            h('input', { className: 'hd-input', value: confirm, onChange: (e) => setConfirm(e.target.value) })))
        : null,
      h('div', { className: 'hd-actions', style: { marginTop: 10 } },
        h(Btn, { variant: 'primary', icon: 'play', disabled: busy || (write && confirm !== command.command), onClick: submit },
          busy ? t('Working…') : t('Run')),
        write ? h('span', { className: 'hd-muted hd-tiny' }, t('This command writes to the instance.')) : null)),
    h(Card, { title: t('Result') },
      h(ErrorBox, { error }),
      result ? h(CommandResult, { result }) : h(Empty, null, t('Nothing has run yet.'))));
}

/** What a command answered: prose when it answered in prose, the shape otherwise. */
function CommandResult({ result }) {
  if (result === null || result === undefined) return h(Empty, null, t('No result'));
  if (typeof result === 'string') return h(Pre, { text: result, maxHeight: 420 });
  if (typeof result !== 'object') return h(Pre, { text: JSON.stringify(result, null, 2), maxHeight: 420 });
  const prose = result.markdown || result.text || result.protocol || '';
  const rest = Object.entries(result).filter(([key]) => !['markdown', 'text', 'protocol'].includes(key));
  return h('div', null,
    rest.length
      ? h(KV, { rows: rest.slice(0, 12).map(([key, value]) => [
        key, typeof value === 'object' ? JSON.stringify(value).slice(0, 240) : String(value ?? '—'),
      ]) })
      : null,
    prose ? h(Prose, { text: prose, limit: 4000 }) : null);
}

/**
 * The commands that act on one object.
 *
 * The list is the kernel's own catalogue filtered by the object's family and identifier, so a
 * command the kernel adds appears here without a line of client code, and a command the kernel
 * takes away disappears with it.
 */
function EntityCommands({ families, values, title, onAction, after }) {
  const { data } = useSharedApi('commands', {}, { poll: 0 });
  const rows = data?.commands || [];
  // The catalogue's entity map holds command NAMES; the row is what carries the label, the
  // fence, and whether the command writes.
  const commands = entityCommands(data, families, values)
    .map((name) => rows.find((row) => row.command === name))
    .filter(Boolean);
  if (!commands.length) return null;
  return h(Card, { title: title || t('Commands'), sub: `${commands.length} the kernel offers for this` },
    h('div', { className: 'hd-inline' }, commands.map((command) => h(Btn, {
      key: command.command, size: 'sm', variant: command.mutates ? 'default' : 'ghost',
      title: command.help || command.command,
      onClick: () => onAction({
        command: command.command, prefill: values, after,
        title: `${command.command} · ${title || ''}`.trim(),
      }),
    }, command.command))));
}

/**
 * One object, in depth: what it is, what the kernel says about it, and what may be done to it.
 *
 * The preview is the object's own read command, run when the drawer opens — the deep view is
 * the kernel's answer, not the dashboard's summary of it.
 */
function EntityDrawer({ title, sub, families, values, facts, onClose, onAction, children }) {
  const { data } = useSharedApi('commands', {}, { poll: 0 });
  const commands = data?.commands || [];
  const preview = previewCommand(data, families, values);
  const [result, setResult] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [busy, setBusy] = React.useState(false);
  const key = JSON.stringify(values || {});
  const load = React.useCallback(async () => {
    if (!preview) return;
    setBusy(true); setError(null);
    try {
      // Only the arguments this command declares: the Host refuses an argument a command does
      // not have, and an object's values may name more than this one command takes.
      const row = commands.find((c) => c.command === preview);
      const args = {};
      for (const arg of row?.args || []) {
        if (values[arg.name] !== undefined && values[arg.name] !== null) args[arg.name] = values[arg.name];
      }
      const out = await apiPost('command.run', { command: preview, args });
      setResult(out?.result ?? null);
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preview, key]);
  React.useEffect(() => { load(); }, [load]);
  return h(Drawer, { open: true, title, sub, onClose },
    h(ErrorBox, { error }),
    facts ? h(Card, null, h(KV, { rows: facts })) : null,
    children,
    h(Card, { title: t('Preview'), sub: preview || null },
      busy && result === null ? h(Loading) : null,
      error ? null : (result ? h(CommandResult, { result }) : (preview ? h(Empty, null, t('No answer')) : h(Empty, null, t('This object has no read command.'))))),
    h(EntityCommands, { families, values, title, onAction, after: load }));
}

function ConsolePage() {
  const { data, error, loading, reload } = useSharedApi('commands', {}, { poll: 0 });
  const [query, setQuery] = React.useState('');
  const [selected, setSelected] = React.useState(null);
  const [busy, setBusy] = React.useState(false);
  const [runError, setRunError] = React.useState(null);
  const [result, setResult] = React.useState(null);
  const commands = data?.commands || [];
  const q = query.trim().toLowerCase();
  const shown = q
    ? commands.filter((c) => (c.command + ' ' + (c.help || '')).toLowerCase().includes(q))
    : commands;
  const groups = {};
  for (const command of shown) {
    const family = command.command.split(' ')[0];
    groups[family] = groups[family] || [];
    groups[family].push(command);
  }
  const current = selected ? commands.find((c) => c.command === selected) || selected : null;
  const run = async (name, values, confirm) => {
    setBusy(true); setRunError(null); setResult(null);
    try {
      const out = await apiPost('command.run', { command: name, args: values, confirm });
      setResult(out?.result ?? null);
    } catch (e) {
      setRunError(e);
    } finally {
      setBusy(false);
    }
  };
  return h('div', { className: 'hd-page' },
    h(PageHead, {
      title: t('Console'),
      sub: t('Every command the kernel offers, with the arguments it declares. The kernel decides which may be filled from a browser; this page only renders.'),
      actions: h(Btn, { icon: 'refresh', size: 'sm', onClick: reload }, t('Refresh')),
    }),
    h('div', { className: 'hd-toolbar' },
      h(SearchBox, { value: query, onChange: setQuery, placeholder: t('Search commands…') }),
      h('span', { className: 'hd-muted hd-tiny' }, `${shown.length} of ${commands.length}`)),
    h(ErrorBox, { error, onRetry: reload }),
    loading && !data ? h(Loading) : null,
    h('div', { className: 'hd-split hd-split--console' },
      h('div', { className: 'hd-list', style: { maxHeight: 520, overflowY: 'auto' } },
        Object.keys(groups).sort().map((family) => h('div', { key: family },
          h('div', { className: 'hd-card-sub', style: { padding: '8px 10px 2px' } }, family),
          groups[family].map((command) => h('div', {
            key: command.command, role: 'button', tabIndex: 0,
            className: 'hd-list-item hd-list-item--click' + (current?.command === command.command ? ' hd-list-item--active' : ''),
            onClick: () => { setSelected(command); setResult(null); setRunError(null); },
            onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelected(command); } },
          },
            h('div', { className: 'hd-row-main' },
              h('div', { className: 'hd-row-title' }, command.command),
              h('div', { className: 'hd-row-sub' }, command.help || '')),
            h(Pill, { tone: command.mutates ? 'warn' : 'quiet' }, command.mutates ? 'write' : 'read')))))),
      h('div', { style: { minWidth: 0 } },
        current
          ? h(CommandForm, { command: current, onRun: run, busy, error: runError, result })
          : h(Card, null, h(Empty, null, t('Pick a command on the left.'))))));
}

// ---- 60-ops.js ----
function HealthPanel({ doctor, onAction }) {
  const groups = doctor?.groups || [];
  return h(Card, {
    title: 'Health', sub: `${doctor?.errors || 0} errors · ${doctor?.warnings || 0} warnings`,
    actions: h(Btn, { size: 'sm', icon: 'refresh', onClick: () => onAction({ title: t('Run doctor'), action: 'doctor.run', submit: t('Run doctor') }) }, t('Run doctor')),
  }, groups.length ? h('div', { className: 'hd-list' }, groups.map((group) => h('div', { key: group.check, className: 'hd-list-item' },
    h('span', { className: 'hd-dot hd-dot--' + (group.severity === 'error' ? 'error' : 'warn') }),
    h('div', { className: 'hd-row-main' },
      h('div', { className: 'hd-row-title' }, group.check),
      h('div', { className: 'hd-row-sub', style: { display: 'block' } }, (group.items || []).map((item, i) => h('div', { key: i, className: 'hd-tiny' }, item.message))))))) : h(Empty, null, t('No findings')));
}

function AuditBreak({ b }) {
  return h('div', { className: 'hd-list-item' },
    h('span', { className: 'hd-dot hd-dot--error' }),
    h('div', { className: 'hd-row-main' },
      h('div', { className: 'hd-row-title' }, 'seq ' + b.seq + ' · ' + (b.reason || 'break')),
      h('div', { className: 'hd-row-sub' },
        h('span', null, b.entity), h('span', null, shortId(b.entity_id)), h('span', null, b.actor))));
}

function AuditPanel({ audit }) {
  if (!audit) return h(Card, { title: t('Audit chain') }, h(Empty));
  const breaks = Array.isArray(audit.breaks) ? audit.breaks : [];
  const broken = Number(audit.break_count || 0) > 0;
  return h(Card, { title: t('Audit chain'), sub: `${audit.checked || 0} events checked` },
    h('div', { className: 'hd-inline', style: { marginBottom: 8 } },
      h(Pill, { tone: broken ? 'error' : 'ok', dot: true }, broken ? 'break' : 'intact'),
      h(Pill, null, 'last ok #' + (audit.last_ok_seq ?? '—')),
      broken ? h(Pill, { tone: 'warn' }, 'first break #' + audit.first_break_seq) : null),
    breaks.length ? h('div', { className: 'hd-list' }, breaks.slice(0, 4).map((b) => h(AuditBreak, { key: b.seq, b }))) : h('div', { className: 'hd-muted hd-tiny' }, 'No break in the checked range.'));
}

function ScheduleRow({ row, onAction }) {
  const on = row.enabled === 1 || row.enabled === true;
  return h('div', { className: 'hd-list-item' },
    h('span', { className: 'hd-dot hd-dot--' + (on ? 'ok' : 'quiet') }),
    h('div', { className: 'hd-row-main' },
      h('div', { className: 'hd-row-title' }, `${row.kind} · ${row.cron || '—'}`),
      h('div', { className: 'hd-row-sub' }, h('span', null, row.stage || row.template_id || '—'), h('span', null, 'next ' + fmtTime(row.next_run_at)), h('span', null, 'failures ' + (row.failure_streak || 0)))),
    h(Btn, { size: 'sm', variant: on ? 'ghost' : 'default', onClick: () => onAction({
      title: (on ? 'Disable' : 'Enable') + ' schedule', action: on ? 'schedule.disable' : 'schedule.enable', payload: { id: row.id }, submit: on ? 'Disable' : 'Enable',
    }) }, on ? 'Disable' : 'Enable'));
}

function SchedulesPanel({ schedules, onAction }) {
  const rows = schedules?.rows || [];
  return h(Card, { title: t('Schedules'), sub: `${schedules?.enabled || 0} enabled · ${schedules?.failing || 0} failing` }, rows.length
    ? h('div', { className: 'hd-list' }, rows.slice(0, 8).map((row) => h(ScheduleRow, { key: row.id, row, onAction })))
    : h(Empty, null, 'No schedules'));
}

function OperationRow({ op }) {
  return h('div', { className: 'hd-list-item' },
    h('div', { className: 'hd-row-main' },
      h('div', { className: 'hd-row-title' }, op.title || op.plan || '—'),
      h('div', { className: 'hd-row-sub' },
        h('span', null, op.lane), h('span', null, op.cron || '—'),
        h('span', null, 'next ' + fmtTime(op.next_run_at)), h('span', null, `${op.fired || 0} fired`))),
    h(Pill, { tone: op.enabled ? 'ok' : 'quiet', dot: true }, op.enabled ? 'on' : 'off'));
}

function OperationsPanel({ operations }) {
  const rows = Array.isArray(operations) ? operations : [];
  return h(Card, { title: 'Operations', sub: `${rows.length} recurring` }, rows.length
    ? h('div', { className: 'hd-list' }, rows.slice(0, 8).map((op) => h(OperationRow, { key: op.schedule || op.title, op })))
    : h(Empty, null, 'No operations'));
}

function DriverRow({ driver, onAction }) {
  return h('div', { className: 'hd-list-item' },
    h('div', { className: 'hd-row-main' },
      h('div', { className: 'hd-row-title' }, driver.name),
      h('div', { className: 'hd-row-sub' }, h('span', null, (driver.stages || []).join(', ') || 'no stages'), h('span', { className: 'hd-mono' }, driver.source || '—'))),
    h(Btn, { size: 'sm', onClick: () => onAction({
      title: 'Conformance · ' + driver.name,
      description: 'Runs the driver clause against this harness. It spends real model calls and can take a few minutes.',
      action: 'conformance.run', payload: { driver: driver.name, clauses: 'driver' },
      fields: [{ key: 'confirm', label: 'Type CONFORMANCE to run', type: 'text', required: true }], submit: 'Run conformance',
    }) }, t('Conformance')));
}

function DriversPanel({ drivers, onAction }) {
  return h(Card, { title: t('Drivers'), sub: `${drivers?.length || 0} installed harness drivers` }, drivers?.length
    ? h('div', { className: 'hd-list' }, drivers.map((driver) => h(DriverRow, { key: driver.name, driver, onAction })))
    : h(Empty, null, 'No drivers'));
}

function MetricsPanel({ metrics }) {
  if (!metrics) return h(Card, { title: t('Metrics') }, h(Empty));
  const keys = Object.keys(metrics).filter((k) => metrics[k] && typeof metrics[k] === 'object' && !Array.isArray(metrics[k]));
  return h(Card, { title: t('Metrics'), sub: `window ${metrics.days || 30}d · ${metrics.dept || 'org'}` }, h('div', { className: 'hd-list' }, keys.slice(0, 12).map((key) => h('div', { key, className: 'hd-list-item' },
    h('div', { className: 'hd-row-main' }, h('div', { className: 'hd-inline', style: { justifyContent: 'space-between' } }, h('span', { className: 'hd-tiny hd-strong' }, metricLabel(key)), h('span', { className: 'hd-mono' }, metricValue(key, metrics[key].value))),
      h('div', { className: 'hd-muted hd-tiny' }, metrics[key].n ? 'n=' + metrics[key].n : (metrics[key].counter?.value ?? 'sensor')))))));
}
function ScopesPanel({ scope }) {
  const scopes = scope?.scopes || [];
  return h(Card, { title: t('Scopes'), sub: scope?.fingerprint ? 'fingerprint ' + scope.fingerprint : 'department reach' }, scopes.length
    ? h('div', { className: 'hd-list' }, scopes.map((s) => h('div', { key: s.name, className: 'hd-list-item' },
      h('div', { className: 'hd-row-main' },
        h('div', { className: 'hd-row-title' }, s.name),
        h('div', { className: 'hd-row-sub' }, h('span', null, `${(s.roots || []).length} roots`), h('span', null, `${(s.commands || []).length} commands`), h('span', null, `${(s.read_roots || []).length} read roots`)))))) : h(Empty));
}

function BackupRow({ b }) {
  return h('div', { className: 'hd-list-item' },
    h('div', { className: 'hd-row-main' },
      h('div', { className: 'hd-row-title' }, b.name),
      h('div', { className: 'hd-row-sub' },
        h('span', null, fmtTime(b.mtime)), h('span', null, `${b.files} files`),
        h('span', null, `${(b.bytes / 1024 / 1024).toFixed(1)} MiB`))));
}

function BackupsPanel({ backups, onAction }) {
  return h(Card, {
    title: t('Backups'), sub: `${backups?.length || 0} recent`,
    actions: h(Btn, { size: 'sm', icon: 'plus', onClick: () => onAction({
      title: t('Back up'), description: 'Writes a consistent copy of the instance under its backups directory.',
      action: 'backup.run', payload: { confirm: 'BACKUP' }, submit: t('Back up'),
    }) }, t('Back up')),
  }, backups?.length ? h('div', { className: 'hd-list' }, backups.slice(0, 6).map((b) => h(BackupRow, { key: b.name, b }))) : h(Empty));
}

function IsolationPlanButton() {
  const [state, setState] = React.useState({ open: false, busy: false, data: null, error: null });
  const load = async () => {
    setState((s) => ({ ...s, busy: true, error: null }));
    try {
      const res = await apiPost('isolation.plan', {});
      setState({ open: true, busy: false, data: res.result, error: null });
    } catch (error) {
      setState((s) => ({ ...s, busy: false, error }));
    }
  };
  return h(React.Fragment, null,
    h(Btn, { size: 'sm', icon: 'shield', onClick: load, disabled: state.busy }, state.busy ? 'Planning…' : 'Isolation plan'),
    h(Modal, { open: state.open, title: 'Isolation plan', sub: 'Read-only: prints the root script and ACLs the Chair applies.', onClose: () => setState((s) => ({ ...s, open: false })), footer: h(Btn, { onClick: () => setState((s) => ({ ...s, open: false })) }, t('Close')) },
      h(ErrorBox, { error: state.error }),
      state.data ? h('div', { className: 'hd-grid' },
        h(KV, { rows: [['Agent user', state.data.agent_user || '—'], ['Runner', state.data.runner || '—']] }),
        state.data.root_script ? h('div', null, h('div', { className: 'hd-field-label' }, 'Root script'), h(Pre, { text: state.data.root_script, maxHeight: 360 })) : null) : null));
}

function AutonomyRow({ row }) {
  return h('tr', { className: 'hd-tr' },
    h('td', { className: 'hd-td' }, row.dept),
    h('td', { className: 'hd-td' }, h(Pill, { tone: 'brand' }, row.mode || '—')),
    h('td', { className: 'hd-td' }, row.widen_approver || '—'),
    h('td', { className: 'hd-td' }, 'G' + (row.auto_promote_cap ?? '—')),
    h('td', { className: 'hd-td' }, 'G' + (row.ceo_initial_max ?? '—')),
    h('td', { className: 'hd-td' }, String(row.audit_sample_permille ?? '—')));
}

function AutonomyPanel({ rows }) {
  const list = Array.isArray(rows) ? rows : [];
  return h(Card, { title: 'Autonomy', sub: `${list.length} department policies` }, list.length
    ? h('div', { className: 'hd-table-wrap' }, h('table', { className: 'hd-table' },
      h('thead', null, h('tr', null, ['Dept', 'Mode', 'Widen', 'Auto cap', 'CEO max', 'Samples'].map((c) => h('th', { key: c, className: 'hd-th' }, c)))),
      h('tbody', null, list.map((row) => h(AutonomyRow, { key: row.dept, row })))))
    : h(Empty));
}

function LawPanel() {
  const [state, setState] = React.useState({ open: false, busy: '', data: null, error: null });
  const load = async (id) => {
    setState((s) => ({ ...s, busy: id, error: null }));
    try { const data = await apiGet('law', { id }); setState({ open: true, busy: '', data, error: null }); }
    catch (error) { setState((s) => ({ ...s, busy: '', error })); }
  };
  return h(Card, { title: 'Law', sub: 'The distribution’s own INTENT, BYLAWS and CONTRACT.' },
    h('div', { className: 'hd-inline' }, ['intent', 'bylaws', 'contract'].map((id) => h(Btn, {
      key: id, size: 'sm', icon: 'shield', disabled: Boolean(state.busy), onClick: () => load(id),
    }, state.busy === id ? 'Loading…' : id))),
    h(ErrorBox, { error: state.error }),
    h(Modal, { open: state.open, title: state.data?.path || 'Law', sub: 'Read-only', onClose: () => setState((s) => ({ ...s, open: false })),
      footer: h(Btn, { onClick: () => setState((s) => ({ ...s, open: false })) }, t('Close')) },
      state.data?.markdown ? h(Prose, { text: state.data.markdown, limit: 12000 }) : h(Empty)));
}

function MaintenancePanel({ onAction }) {
  return h(Card, { title: 'Maintenance', sub: 'Chair-only operations. Each writes to the instance and is confirmed.' },
    h('div', { className: 'hd-inline' },
      h(Btn, { icon: 'activity', onClick: () => onAction({
        title: 'Run heartbeat', description: 'Runs the kernel tick now: healing, feedback triggers and due schedules may dispatch work. It is the same tick the timer runs every two minutes.',
        action: 'tick.run', fields: [{ key: 'confirm', label: 'Type RUN TICK', type: 'text', required: true }], submit: 'Run tick', danger: true,
      }) }, 'Run heartbeat'),
      h(Btn, { icon: 'shield', onClick: () => onAction({ title: t('Run doctor'), action: 'doctor.run', submit: t('Run doctor') }) }, t('Run doctor')),
      h(Btn, { icon: 'plus', onClick: () => onAction({ title: 'Back up', description: 'Writes a consistent copy under the instance backups directory.', action: 'backup.run', payload: { confirm: 'BACKUP' }, submit: 'Back up' }) }, t('Back up'))));
}

function OpsPage({ onAction }) {
  const { data, error, loading, reload } = useApi('ops', {}, { poll: 30000 });
  if (!data && loading) return h(Loading, null);
  if (!data) return h('div', { className: 'hd-page' }, h(ErrorBox, { error, onRetry: reload }));
  const act = (spec) => onAction({ ...spec, after: () => { reload(); if (spec.after) spec.after(); } });
  return h('div', { className: 'hd-page' },
    h(PageHead, { title: t('Operations'), sub: 'Health, audit, schedules, drivers, scopes and backups in one operating surface.', actions: h(React.Fragment, null,
      h(Btn, { icon: 'plus', size: 'sm', onClick: () => onAction({
        command: 'schedule add', title: t('New schedule'),
        description: 'Adds a schedule: what it wakes, its cron expression and the stage or plan it serves.',
      }) }, t('New schedule')),
      h(Btn, { icon: 'plus', size: 'sm', onClick: () => onAction({
        command: 'operation add', title: t('New operation'),
        description: 'Adds a recurring operation for a department: its intent, its cadence, its lane and what it delivers.',
      }) }, t('New operation')),
      h(IsolationPlanButton, null), h(Btn, { icon: 'refresh', size: 'sm', onClick: reload }, t('Refresh'))) }),
    h(ErrorBox, { error, onRetry: reload }),
    h(ErrorBox, { error: degradationError(data) }),
    h('div', { className: 'hd-grid' },
      h(MaintenancePanel, { onAction: act }),
      h(HealthPanel, { doctor: data.doctor, onAction: act }),
      h('div', { className: 'hd-grid2' }, h(AuditPanel, { audit: data.audit }), h(SchedulesPanel, { schedules: data.schedules, onAction: act })),
      h(OperationsPanel, { operations: data.operations }),
      h(DriversPanel, { drivers: data.drivers, onAction: act }),
      h('div', { className: 'hd-grid2' }, h(MetricsPanel, { metrics: data.metrics }), h(ScopesPanel, { scope: data.scope })),
      h('div', { className: 'hd-grid2' }, h(AutonomyPanel, { rows: data.autonomy }), h(LawPanel, null)),
      h(BackupsPanel, { backups: data.backups, onAction: act })));
}

// ---- 70-messages.js ----
function MessageRow({ message, onOpen }) {
  const unacked = message.ack_required === 1 && !message.acked_at;
  return h('div', { className: 'hd-list-item hd-list-item--click', onClick: () => onOpen(message.id) },
    h('span', { className: 'hd-dot hd-dot--' + (unacked ? 'warn' : 'quiet') }),
    h('div', { className: 'hd-row-main' },
      h('div', { className: 'hd-row-title' }, message.sender_name || message.sender || '—'),
      h('div', { className: 'hd-row-sub', style: { display: 'block' } }, String(message.body || '').slice(0, 220)),
      h('div', { className: 'hd-row-sub' }, h('span', null, message.kind), h('span', null, message.to_ref), h('span', null, fmtAgo(message.ts)), unacked ? h('span', null, 'needs ack') : null)),
    h('span', { className: 'hd-muted hd-tiny hd-mono' }, shortId(message.id)));
}

function ComposeModal({ open, onClose, onAction }) {
  const [to, setTo] = React.useState('chair');
  const [kind, setKind] = React.useState('dm');
  const [body, setBody] = React.useState('');
  React.useEffect(() => { if (open) { setTo('chair'); setKind('dm'); setBody(''); } }, [open]);
  const send = () => onAction({
    title: 'Send message', action: 'msg.send', payload: { to, kind, body }, submit: t('Send'), after: onClose,
  });
  return h(Modal, { open, title: t('Compose'), sub: 'Chair authority: the message is recorded in the thread and the digest.', onClose,
    footer: h(React.Fragment, null, h(Btn, { onClick: onClose }, t('Cancel')), h(Btn, { variant: 'primary', icon: 'send', onClick: send, disabled: !body.trim() }, t('Send'))) },
    h('div', { className: 'hd-grid' },
      h(Field, { label: 'To (chair, org, emp:<id>, dept:<slug>)' }, h('input', { className: 'hd-input', value: to, onChange: (e) => setTo(e.target.value) })),
      h(Field, { label: 'Kind' }, h(Select, { value: kind, onChange: setKind, options: ['dm', 'channel', 'request', 'question', 'answer', 'proposal'] })),
      h(Field, { label: 'Message' }, h('textarea', { className: 'hd-textarea', value: body, onChange: (e) => setBody(e.target.value) }))));
}
function MessageItem({ m }) {
  return h('div', { className: 'hd-list-item' },
    h('span', { className: 'hd-dot hd-dot--' + (m.sender === 'chair' ? 'brand' : 'quiet') }),
    h('div', { className: 'hd-row-main' },
      h('div', { className: 'hd-row-title' }, `${m.sender_name || m.sender} · ${m.kind}`),
      h('div', { className: 'hd-prose', style: { marginTop: 3 } }, m.body),
      h('div', { className: 'hd-row-sub' },
        h('span', null, m.to_ref), h('span', null, fmtTime(m.ts)),
        m.ack_required ? h('span', null, m.acked_at ? 'acked' : 'unacked') : null)));
}

function MessageDrawer({ id, onClose, onAction }) {
  const { data, error, loading, reload } = useApi('thread', { id }, { poll: 15000 });
  const [body, setBody] = React.useState('');
  const root = data?.root;
  const messages = data?.messages || [];
  const reply = () => onAction({
    title: t('Reply'), action: 'msg.reply', payload: { message: id, body }, submit: t('Reply'),
    after: () => { setBody(''); reload(); },
  });
  return h(Drawer, { open: true, title: root ? (root.sender_name || root.sender || 'Thread') : 'Thread', sub: id, onClose },
    h(ErrorBox, { error, onRetry: reload }),
    loading && !data ? h(Loading) : null,
    messages.length ? h('div', { className: 'hd-list' }, messages.map((m) => h(MessageItem, { key: m.id, m }))) : h(Empty, null, t('No messages')),
    h(EntityCommands, { families: ['msg'], values: { message: id }, title: t('Commands'), onAction }),
    h('div', { style: { marginTop: 14 } },
      h(Field, { label: t('Reply') }, h('textarea', { className: 'hd-textarea', value: body, onChange: (e) => setBody(e.target.value) })),
      h(Btn, { variant: 'primary', icon: 'send', onClick: reply, disabled: !body.trim(), style: { marginTop: 8 } }, t('Reply'))));
}

function MessagesPage({ focus, onClearFocus, onAction }) {
  const [filter, setFilter] = React.useState('all');
  const [selected, setSelected] = React.useState(null);
  React.useEffect(() => { if (focus?.id) setSelected(focus.id); }, [focus?.id]);
  const [compose, setCompose] = React.useState(false);
  const { data, error, loading, reload } = useApi('messages', { filter, limit: 100 }, { poll: 15000 });
  const rows = data?.rows || [];
  const counts = data?.counts || {};
  return h('div', { className: 'hd-page' },
    h(PageHead, { title: t('Messages'), sub: 'The Chair\'s inbox and every thread the organization sent to it.', actions: h(React.Fragment, null,
      h(Btn, { icon: 'plus', size: 'sm', onClick: () => setCompose(true) }, t('Compose')),
      h(Btn, { icon: 'refresh', size: 'sm', onClick: reload }, t('Refresh'))) }),
    h('div', { className: 'hd-grid hd-stat-grid' },
      h(Stat, { label: 'Unread', value: counts.unacked || 0, hint: 'need an answer', tone: counts.unacked ? 'warn' : '', icon: 'message' }),
      h(Stat, { label: 'Incoming', value: counts.incoming || 0, hint: 'to the Chair', icon: 'arrow' }),
      h(Stat, { label: 'Sent', value: counts.sent || 0, hint: 'from the Chair', icon: 'send' }),
      h(Stat, { label: 'Threads', value: counts.total || 0, hint: 'all time', icon: 'layers' })),
    h('div', { className: 'hd-toolbar', style: { marginTop: 12 } },
      h(Seg, { items: [{ value: 'all', label: t('All') }, { value: 'unacked', label: t('Unread') }, { value: 'incoming', label: 'Incoming' }, { value: 'sent', label: 'Sent' }], value: filter, onChange: setFilter })),
    h(ErrorBox, { error, onRetry: reload }),
    loading && !data ? h(Loading) : h(Card, { flush: true }, rows.length ? h('div', { className: 'hd-list', style: { padding: '0 14px' } }, rows.map((m) => h(MessageRow, { key: m.id, message: m, onOpen: setSelected }))) : h(Empty, null, t('No messages'))),
    selected ? h(MessageDrawer, { id: selected, onClose: () => { setSelected(null); if (onClearFocus) onClearFocus(); }, onAction }) : null,
    h(ComposeModal, { open: compose, onClose: () => setCompose(false), onAction }));
}

// ---- 80-settings.js ----
function ConfigRow({ section, key, row, onSave, busy, error }) {
  const [value, setValue] = React.useState(row.value === null || row.value === undefined ? '' : String(row.value));
  const [saved, setSaved] = React.useState(false);
  React.useEffect(() => {
    setValue(row.value === null || row.value === undefined ? '' : String(row.value));
    setSaved(false);
  }, [section, key, row.value]);
  const editable = row.type !== 'table';
  const changed = editable && String(value) !== String(row.value);
  return h('div', { className: 'hd-settings-row' },
    h('div', { className: 'hd-settings-row-label' }, key),
    h('div', { className: 'hd-settings-row-value' },
      editable
        ? h('input', { className: 'hd-input', value, onChange: (e) => { setValue(e.target.value); setSaved(false); } })
        : h('span', { className: 'hd-mono hd-tiny' }, JSON.stringify(row.value)),
      h('span', { className: 'hd-muted hd-tiny' }, row.source === 'file' ? t('set in holon.toml') : t('kernel default'))),
    editable
      ? h('div', { className: 'hd-inline' },
        h(Btn, {
          size: 'sm', variant: 'primary', disabled: busy || !changed,
          onClick: async () => {
            const ok = await onSave(section, key, value);
            if (ok) setSaved(true);
          },
        }, saved ? t('Saved') : t('Save')),
        error ? h('span', { className: 'hd-muted hd-tiny' }, error) : null)
      : null);
}

function ConfigPanel() {
  const { data, error, loading, reload } = useApi('config', {}, { poll: 0 });
  const [busy, setBusy] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  const sections = data?.sections || {};
  const save = async (section, key, value) => {
    setBusy(true);
    setErrors((prev) => ({ ...prev, [`${section}.${key}`]: null }));
    try {
      await apiPost('config.set', { section, key, value });
      await reload();
      return true;
    } catch (e) {
      setErrors((prev) => ({ ...prev, [`${section}.${key}`]: e.message || String(e) }));
      return false;
    } finally {
      setBusy(false);
    }
  };
  return h('div', { className: 'hd-page' },
    h(PageHead, {
      title: t('Configuration'),
      sub: t('Every key the kernel reads, its effective value, and whether holon.toml sets it. A change is written to holon.toml and re-parsed before it is accepted.'),
      actions: h(Btn, { icon: 'refresh', size: 'sm', onClick: reload }, t('Refresh')),
    }),
    h(ErrorBox, { error, onRetry: reload }),
    loading && !data ? h(Loading) : null,
    data && data.unknown && data.unknown.length
      ? h(Card, { title: t('Unknown keys'), sub: t('holon.toml carries keys the kernel does not read: a typo, or a setting from another version.') },
        h('div', { className: 'hd-list' }, data.unknown.map((row) => h('div', { key: `${row.section}.${row.key}`, className: 'hd-list-item' },
          h('div', { className: 'hd-row-main' },
            h('div', { className: 'hd-row-title' }, row.key || row.section),
            h('div', { className: 'hd-row-sub' }, row.section)),
          h(Pill, { tone: 'warn' }, t('not read'))))))
      : null,
    Object.keys(sections).sort().map((section) => h(Card, { key: section, title: `[${section}]` },
      h('div', { className: 'hd-settings' }, Object.keys(sections[section]).sort().map((key) => h(ConfigRow, {
        key: `${section}.${key}`, section, key, row: sections[section][key],
        onSave: save, busy, error: errors[`${section}.${key}`],
      }))))));
}

function SettingsPage({ embedded = false, onOpen }) {
  const { data, error, loading, reload } = useApi('settings', {}, { poll: 0 });
  if (!data && loading) return h(Loading, null);
  if (!data) return h('div', { className: 'hd-page' }, h(ErrorBox, { error, onRetry: reload }));
  const cmd = (data.config?.command || []).join(' ');
  const body = h('div', { className: 'hd-grid' },
    h(Card, { title: t('Connection'), sub: data.instance?.home || '' },
      h(KV, { rows: [
        ['Instance', data.instance?.label || '—'],
        ['Version', data.instance?.version || '—'],
        ['Auth', data.auth || '—'],
        ['Command', h('span', { className: 'hd-mono' }, cmd || '—')],
        ['Config', h('span', { className: 'hd-mono hd-tiny' }, data.config?.configPath || '—')],
        ['Refresh', `${data.config?.refreshMs || 0} ms`],
        ['Actions', data.config?.allowActions ? h(Pill, { tone: 'ok', dot: true }, 'enabled') : h(Pill, { tone: 'warn', dot: true }, 'read-only')],
      ] }),
      h('div', { style: { marginTop: 10 } }, h(CopyBtn, { text: `holon --home ${data.instance?.home || ''} status`, label: 'Copy status command' }))),
    h(Card, { title: 'Paths' }, h('div', { className: 'hd-list' }, Object.entries(data.paths || {}).map(([key, value]) => h('div', { key, className: 'hd-list-item' },
      h('span', { className: 'hd-dot hd-dot--' + (value.exists ? 'ok' : 'error') }),
      h('div', { className: 'hd-row-main' }, h('div', { className: 'hd-row-title' }, key), h('div', { className: 'hd-mono hd-tiny hd-muted' }, value.path)))))),
    h(Card, { title: t('Drivers'), sub: `${data.drivers?.length || 0} installed` }, h('div', { className: 'hd-list' }, (data.drivers || []).map((d) => h('div', { key: d.name, className: 'hd-list-item' },
      h('div', { className: 'hd-row-main' }, h('div', { className: 'hd-row-title' }, d.name), h('div', { className: 'hd-row-sub' }, h('span', null, (d.stages || []).join(', ') || 'no stages'))),
      h(Pill, { tone: 'brand' }, 'driver'))))),
    h(Card, { title: t('Backups'), sub: `${data.backups?.length || 0} recent` }, h('div', { className: 'hd-list' }, (data.backups || []).slice(0, 5).map((b) => h('div', { key: b.name, className: 'hd-list-item' },
      h('div', { className: 'hd-row-main' }, h('div', { className: 'hd-row-title' }, b.name), h('div', { className: 'hd-row-sub' }, h('span', null, fmtTime(b.mtime)), h('span', null, `${b.files} files`))))))),
    h(ErrorBox, { error, onRetry: reload }));
  if (embedded) return h('div', null,
    h('div', { className: 'hd-card-head' }, h('div', null, h('div', { className: 'hd-card-title' }, 'Holon Command Center'), h('div', { className: 'hd-card-sub' }, 'The organization runtime is connected. Open the full operating surface from the sidebar.')), h('div', { className: 'hd-card-actions' }, onOpen ? h(Btn, { size: 'sm', variant: 'primary', onClick: onOpen }, 'Open') : null)),
    h('div', { style: { padding: '0 14px 14px' } }, h('div', { className: 'hd-grid' }, h(Card, null, h(KV, { rows: [['Instance', data.instance?.label], ['Home', data.instance?.home], ['Auth', data.auth], ['Actions', data.config?.allowActions ? 'enabled' : 'read-only']] })), h(ErrorBox, { error, onRetry: reload }))));
  return h('div', { className: 'hd-page' },
    h(PageHead, { title: t('Settings'), sub: 'How this Harness profile reaches the Holon instance, and what it is allowed to do.', actions: h(Btn, { icon: 'refresh', size: 'sm', onClick: reload }, t('Refresh')) }),
    body);
}

// ---- 90-app.js ----
function HolonIcon({ size = 18 }) {
  const s = size;
  return h('svg', { width: s, height: s, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', 'aria-hidden': true },
    h('rect', { x: 3.2, y: 3.2, width: 17.6, height: 17.6, rx: 5.2, opacity: 0.55 }),
    h('circle', { cx: 12, cy: 12, r: 5.1 }),
    h('circle', { cx: 12, cy: 12, r: 1.7, fill: 'currentColor', stroke: 'none' }),
    h('path', { d: 'M12 1.6v2.2M12 20.2v2.2M1.6 12h2.2M20.2 12h2.2', opacity: 0.45 }));
}

function Toast({ message }) {
  if (!message) return null;
  return h('div', { role: 'status', 'aria-live': 'polite', style: { position: 'fixed', left: '50%', bottom: 24, transform: 'translateX(-50%)', zIndex: 100, background: 'var(--dsw-alias-bg-layer-3, var(--dsw-alias-bg-layer-2))', border: '1px solid var(--dsw-alias-border-l2)', borderRadius: 10, padding: '8px 13px', fontSize: 11.5, boxShadow: '0 10px 30px rgba(0,0,0,.18)', maxWidth: '80vw' } }, message);
}

function ActionModal({ spec, onClose, onToast }) {
  const [values, setValues] = React.useState({});
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [result, setResult] = React.useState(null);
  const { data: catalogue } = useSharedApi('commands', {}, { poll: 0 });
  React.useEffect(() => {
    if (!spec) return;
    const initial = {};
    for (const field of spec.fields || []) {
      initial[field.key] = spec.payload?.[field.key] ?? (field.type === 'checkbox' ? false : '');
    }
    setValues(initial); setBusy(false); setError(null); setResult(null);
  }, [spec]);
  if (!spec) return null;
  const set = (key, value) => setValues((v) => ({ ...v, [key]: value }));
  // A command from the kernel's catalogue: the form is the manifest's, the arguments are the
  // manifest's, and the fence is the manifest's. Nothing here knows what the command does.
  if (spec.command) {
    const row = (catalogue?.commands || []).find((c) => c.command === spec.command);
    const runCommand = async (name, args, confirm) => {
      setBusy(true); setError(null); setResult(null);
      try {
        const out = await apiPost('command.run', { command: name, args, confirm });
        setResult(out?.result ?? null);
        onToast(spec.success || 'Done.');
        if (spec.after) spec.after();
        onClose();
      } catch (e) {
        setError(e);
      } finally {
        setBusy(false);
      }
    };
    return h(Modal, {
      open: true, title: spec.title || spec.command, sub: spec.description, onClose,
      footer: h(Btn, { onClick: onClose }, t('Close')),
    }, row
      ? h(CommandForm, { command: row, prefill: spec.prefill, onRun: runCommand, busy, error, result })
      : h(Loading));
  }
  const submit = async () => {
    for (const field of spec.fields || []) {
      if (field.required && !String(values[field.key] ?? '').trim()) {
        setError(`${field.label || field.key} is required.`); return;
      }
    }
    setBusy(true); setError(null);
    try {
      const payload = { ...(spec.payload || {}), ...values };
      await apiPost(spec.action, payload);
      onToast(spec.success || 'Done.');
      if (spec.after) spec.after();
      onClose();
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setBusy(false);
    }
  };
  const fields = (spec.fields || []).map((field) => {
    const value = values[field.key] ?? '';
    if (field.type === 'textarea') return h(Field, { key: field.key, label: field.label || field.key }, h('textarea', { className: 'hd-textarea', value, onChange: (e) => set(field.key, e.target.value) }));
    if (field.type === 'select') return h(Field, { key: field.key, label: field.label || field.key }, h(Select, { value, onChange: (v) => set(field.key, v), options: field.options || [] }));
    if (field.type === 'checkbox') return h('label', { key: field.key, className: 'hd-inline', style: { fontSize: 11.5, cursor: 'pointer' } }, h('input', { type: 'checkbox', checked: Boolean(value), onChange: (e) => set(field.key, e.target.checked) }), field.label || field.key);
    return h(Field, { key: field.key, label: field.label || field.key }, h('input', { className: 'hd-input', value, onChange: (e) => set(field.key, e.target.value) }));
  });
  return h(Modal, {
    open: true, title: spec.title || 'Confirm', sub: spec.description, onClose,
    footer: h(React.Fragment, null,
      h(Btn, { onClick: onClose, disabled: busy }, t('Cancel')),
      h(Btn, { variant: spec.danger ? 'danger' : 'primary', icon: spec.danger ? 'alert' : 'check', onClick: submit, disabled: busy }, busy ? 'Working…' : (spec.submit || t('Confirm')))),
  },
  h('div', { className: 'hd-grid' },
    h(ErrorBox, { error }),
    spec.danger ? h('div', { className: 'hd-tiny hd-muted' }, t('This action writes to the instance.')) : null,
    fields.length ? fields : null));
}
function App() {
  const [tab, setTab] = React.useState('overview');
  const [focus, setFocus] = React.useState(null);
  const [action, setAction] = React.useState(null);
  const [toast, setToast] = React.useState(null);
  const overview = useSharedApi('overview', {}, { poll: 30000 });
  React.useEffect(() => {
    if (!toast) return undefined;
    const id = setTimeout(() => setToast(null), 4200);
    return () => clearTimeout(id);
  }, [toast]);
  const go = (next) => { setFocus(null); setTab(next); };
  const openPlan = (id) => { setFocus({ kind: 'plan', id }); setTab('work'); };
  const openWork = (id) => { setFocus({ kind: 'work', id }); setTab('work'); };
  const openRun = (id) => { setFocus({ kind: 'run', id }); setTab('runs'); };
  const openMessage = (id) => { setFocus({ kind: 'message', id }); setTab('messages'); };
  const data = overview.data;
  const s = data?.stats || {};
  const hb = data?.heartbeat;
  const hbTone = !hb?.present ? 'error' : hb.stale ? 'warn' : 'ok';
  const tabs = [
    { id: 'overview', label: t('Overview') },
    { id: 'work', label: t('Work'), count: s.readyTotal || 0 },
    { id: 'org', label: t('Organization') },
    { id: 'runs', label: t('Runs'), count: s.activeRuns || 0 },
    { id: 'knowledge', label: t('Knowledge') },
    { id: 'ops', label: t('Operations'), count: s.doctorErrors || 0 },
    { id: 'messages', label: t('Messages'), count: s.unackedMessages || 0 },
    { id: 'console', label: t('Console') },
    { id: 'config', label: t('Configuration') },
    { id: 'settings', label: t('Settings') },
  ];
  const page = tab === 'overview' ? h(OverviewPage, { onNavigate: go, onOpenPlan: openPlan, onAction: setAction })
    : tab === 'work' ? h(WorkPage, { focus, onClearFocus: () => setFocus(null), onAction: setAction, onOpenRun: openRun })
      : tab === 'org' ? h(OrgPage, { onAction: setAction })
        : tab === 'runs' ? h(RunsPage, { focus, onClearFocus: () => setFocus(null), onOpenWork: openWork, onAction: setAction })
          : tab === 'knowledge' ? h(KnowledgePage, { onAction: setAction })
            : tab === 'ops' ? h(OpsPage, { onAction: setAction })
              : tab === 'messages' ? h(MessagesPage, { focus, onClearFocus: () => setFocus(null), onAction: setAction })
                : tab === 'console' ? h(ConsolePage, null)
                  : tab === 'config' ? h(ConfigPanel, null)
                    : h(SettingsPage, null);
  return h('div', { className: 'hd-root' }, h('div', { className: 'hd-shell' },
    h('div', { className: 'hd-top' },
      h('div', { className: 'hd-brand' },
        h('div', { className: 'hd-logo' }, h(HolonIcon, { size: 18 })),
        h('div', { style: { minWidth: 0 } }, h('div', { className: 'hd-title' }, 'Holon'), h('div', { className: 'hd-sub' }, `Command Center · ${data?.instance?.label || 'instance'} · ${data?.instance?.home || ''}`))),
      h('div', { className: 'hd-top-actions' },
        h(Pill, { tone: hbTone, dot: true }, `${t('Heartbeat')} ${hb?.ageSeconds ?? '—'}s`),
        h(Pill, { tone: s.doctorErrors === null ? 'warn' : s.doctorErrors ? 'error' : s.doctorWarnings ? 'warn' : 'ok', dot: true }, `${t('Doctor')} ${s.doctorErrors ?? '—'}`),
        data?.degraded ? h(Pill, { tone: 'error', dot: true }, t('Degraded')) : null,
        h(Btn, { size: 'sm', icon: 'refresh', onClick: overview.reload }, t('Refresh')))),
    h('div', { className: 'hd-tabs', role: 'tablist' }, tabs.map((item) => h('button', {
      key: item.id, type: 'button', role: 'tab', 'aria-selected': tab === item.id,
      className: 'hd-tab' + (tab === item.id ? ' hd-tab--active' : ''), onClick: () => go(item.id),
    }, item.label, item.count ? h('span', { className: 'hd-tab-count' }, item.count) : null))),
    h('div', { className: 'hd-content' }, page),
    h(Toast, { message: toast }),
    h(ActionModal, { spec: action, onClose: () => setAction(null), onToast: setToast })));
}
function Dock({ onOpen }) {
  const { data } = useSharedApi('overview', {}, { poll: 60000 });
  if (!data) return null;
  const s = data.stats || {};
  if (!s.awaitingChair && !s.doctorErrors && !data.degraded) return null;
  return h('div', { className: 'hd-dock', role: 'status', 'aria-live': 'polite' },
    h('span', { className: 'hd-dot hd-dot--' + (data.degraded || s.doctorErrors ? 'error' : 'warn') }),
    h('span', { className: 'hd-dock-text' }, 'Holon · ', h('b', null, s.awaitingChair || 0), ' awaiting · ', h('b', null, s.doctorErrors || 0), ' doctor errors · heartbeat ', h('b', null, (data.heartbeat?.ageSeconds ?? '—') + 's')),
    h(Btn, { size: 'sm', variant: 'ghost', icon: 'arrow', onClick: onOpen }, 'Open'));
}

function SettingsSection({ onOpen }) {
  return h(SettingsPage, { embedded: true, onOpen });
}

const FACTORY_RETURN = {
  inject: ['slots', 'locale'],
  apply(ctx) {
    // The dictionary is owned by this plugin: an HMR reload re-applies the factory, and a
    // namespace that is still registered throws. Effect-owning the registration gives it a
    // disposer, so a reload replaces the copy instead of colliding with it. A namespace left
    // behind by an older generation (a disable that predated this ownership) must not take the
    // whole plugin down: the copy is the same text, so the page keeps rendering.
    ctx.effect(() => {
      let dispose = () => {};
      try {
        dispose = ctx.locale.register(NS, { en: EN, zh: ZH });
      } catch (error) {
        ctx.logger?.warn?.('holon-dashboard: the locale namespace was already registered: '
          + (error?.message || error) + ' — reloading the page clears it.');
      }
      translate = ctx.locale.bind(NS);
      return () => { dispose(); translate = (text) => text; };
    }, 'holon-dashboard: locale dictionary');
    const openPanel = () => { try { ctx.layout?.selectPanel?.('holon'); } catch { /* no layout */ } };
    ctx.effect(() => {
      const el = document.createElement('style');
      el.setAttribute('data-holon-dashboard', '1');
      el.textContent = CSS;
      document.head.appendChild(el);
      return () => el.remove();
    }, 'holon-dashboard: styles');
    ctx.slots.inject('main', () => ctx.slots.register({ name: 'main', key: 'holon', locale: NS }, App));
    ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
      name: 'sidebar.panellist', id: 'holon', order: 4, locale: NS,
      label: () => t('Holon Command Center'),
      title: () => t('Holon Command Center'),
    }, HolonIcon));
    ctx.slots.inject('settings.section', () => ctx.slots.register({
      name: 'settings.section', id: 'holon', order: 45, locale: NS,
      label: () => t('Holon Command Center'),
    }, () => h(SettingsSection, { onOpen: openPanel })));
    ctx.slots.inject('conversation.composer.dock', () => ctx.slots.register({
      name: 'conversation.composer.dock', id: 'holon-dock', order: 20, locale: NS,
    }, () => h(Dock, { onOpen: openPanel })));
  },
};
    return FACTORY_RETURN;
  },
});
