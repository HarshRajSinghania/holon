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
