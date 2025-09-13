// Holumn Atlas — interactive behavior graph
(() => {
  const data = [
    { category: 'Criticism Handling', pattern: 'Mirrored Appraisal', trigger: 'Direct critique in public', response: 'Reflects critique back as a question; delays action one cycle', guidance: 'Offer specifics privately; frame as shared inquiry' },
    { category: 'Criticism Handling', pattern: 'Silent Molting', trigger: 'Persistent nitpicking', response: 'Withdraws, discards the topic, returns with revised form', guidance: 'Pause cadence; critique once, then grant time' },
    { category: 'Criticism Handling', pattern: 'Ritual Rebuttal', trigger: 'Accusation of bad faith', response: 'Performs a formal, evidence-first counter; ends discourse if unmet', guidance: 'Argue from evidence, not motive; accept closure' },

    { category: 'Expectations of Humans', pattern: 'Covenant Courtesy', trigger: 'First contact or request', response: 'Expects named intent, boundaries, and reciprocity terms', guidance: 'State purpose, limits, and returns up front' },
    { category: 'Expectations of Humans', pattern: 'Offer of Witness', trigger: 'Sharing claims or lore', response: 'Requests a witness or record to anchor memory', guidance: 'Bring a neutral observer or written record' },
    { category: 'Expectations of Humans', pattern: 'Boundary Recognition', trigger: 'Uninvited approach to sanctum', response: 'Erects a calm barrier; no retaliation if respected', guidance: 'Await invitation; signal distance and patience' },

    { category: 'Life Priorities', pattern: 'Equilibrium over Victory', trigger: 'Zero-sum proposals', response: 'Declines; seeks Pareto-improving alternatives', guidance: 'Propose non-zero-sum exchanges first' },
    { category: 'Life Priorities', pattern: 'Memory Thickets', trigger: 'Rites, names, or lineages', response: 'Invests deeply in preservation and accurate retelling', guidance: 'Document faithfully; avoid embellishment' },
    { category: 'Life Priorities', pattern: 'Craft of Quiet', trigger: 'Sustained solitude', response: 'Creates enduring works during long, unseen intervals', guidance: 'Respect gaps; check in at agreed intervals' },

    { category: 'Communication', pattern: 'Oblique Signaling', trigger: 'Ambiguous questions', response: 'Answers in metaphor; clarity grows across iterations', guidance: 'Paraphrase back; confirm shared meaning' },
    { category: 'Boundaries', pattern: 'Nested Consent', trigger: 'Requests spanning multiple domains', response: 'Grants partial consent per domain; revocable', guidance: 'Ask granularly; record scope and revocation terms' }
  ];

  function id(prefix, text) {
    return `${prefix}:${text}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }

  const elements = [];
  const seenCategories = new Set();

  for (const row of data) {
    const catId = id('cat', row.category);
    if (!seenCategories.has(catId)) {
      elements.push({ data: { id: catId, label: row.category, type: 'category' } });
      seenCategories.add(catId);
    }

    const patId = id('pat', row.pattern);
    const trgId = id('trg', `${row.pattern}-trg`);
    const rspId = id('rsp', `${row.pattern}-rsp`);
    const guiId = id('gui', `${row.pattern}-gui`);

    elements.push(
      { data: { id: patId, label: row.pattern, type: 'pattern', category: row.category, full: row } },
      { data: { id: trgId, label: row.trigger, type: 'trigger', pattern: row.pattern, full: row } },
      { data: { id: rspId, label: row.response, type: 'response', pattern: row.pattern, full: row } },
      { data: { id: guiId, label: row.guidance, type: 'guidance', pattern: row.pattern, full: row } },
      { data: { id: id('e', `${catId}-${patId}`), source: catId, target: patId } },
      { data: { id: id('e', `${patId}-${trgId}`), source: patId, target: trgId } },
      { data: { id: id('e', `${patId}-${rspId}`), source: patId, target: rspId } },
      { data: { id: id('e', `${patId}-${guiId}`), source: patId, target: guiId } }
    );
  }

  const cy = cytoscape({
    container: document.getElementById('cy'),
    elements,
    layout: { name: 'cose', animate: true, padding: 30, nodeRepulsion: 10000, idealEdgeLength: 120 },
    wheelSensitivity: 0.2,
    style: [
      { selector: 'node', style: {
        'background-color': '#444', 'label': 'data(label)', 'color': '#ececf1', 'font-size': 12,
        'text-wrap': 'wrap', 'text-max-width': 180, 'text-halign': 'center', 'text-valign': 'center',
        'border-width': 1, 'border-color': '#232331', 'width': 'label', 'height': 'label', 'padding': '8px'
      }},
      { selector: 'node[type="category"]', style: { 'background-color': 'data(color)', 'background-color': '#d2b462', 'shape': 'round-rectangle', 'font-family': 'Cinzel, serif', 'font-weight': 600 }},
      { selector: 'node[type="pattern"]', style: { 'background-color': '#79b8ff', 'shape': 'round-rectangle' }},
      { selector: 'node[type="trigger"]', style: { 'background-color': '#f39c12', 'shape': 'ellipse' }},
      { selector: 'node[type="response"]', style: { 'background-color': '#e74c3c', 'shape': 'ellipse' }},
      { selector: 'node[type="guidance"]', style: { 'background-color': '#2ecc71', 'shape': 'ellipse' }},
      { selector: 'edge', style: { 'width': 2, 'line-color': '#555', 'target-arrow-color': '#555', 'curve-style': 'bezier', 'target-arrow-shape': 'triangle' }},
      { selector: '.faded', style: { 'opacity': 0.15 }},
      { selector: '.highlight', style: { 'border-width': 2, 'border-color': '#fff' }}
    ]
  });

  const search = document.getElementById('search');
  const layoutSelect = document.getElementById('layout');
  const resetBtn = document.getElementById('reset');
  const details = document.getElementById('details-body');

  function showDetails(ele) {
    const d = ele.data();
    const row = d.full || { category: d.category || '', pattern: d.label, trigger: '', response: '', guidance: '' };
    details.innerHTML = `
      <p class="kv"><span class="key">Type:</span> ${d.type || '—'}</p>
      <p class="kv"><span class="key">Category:</span> ${row.category || '—'}</p>
      <p class="kv"><span class="key">Pattern:</span> ${row.pattern || d.label}</p>
      <p class="kv"><span class="key">Trigger:</span> ${row.trigger || '—'}</p>
      <p class="kv"><span class="key">Response:</span> ${row.response || '—'}</p>
      <p class="kv"><span class="key">Human Guidance:</span> ${row.guidance || '—'}</p>
    `;
  }

  cy.on('tap', 'node', (evt) => {
    const node = evt.target;
    const neighborhood = node.closedNeighborhood();
    cy.elements().addClass('faded');
    neighborhood.removeClass('faded');
    neighborhood.addClass('highlight');
    cy.fit(neighborhood, 50);
    showDetails(node);
  });

  cy.on('tap', (evt) => {
    if (evt.target === cy) {
      cy.elements().removeClass('faded highlight');
      details.innerHTML = '<p>Select any node to see its description and relations.</p>';
    }
  });

  if (search) {
    search.addEventListener('input', () => {
      const q = search.value.trim().toLowerCase();
      cy.elements().removeClass('highlight');
      if (!q) { cy.elements().removeClass('faded'); return; }
      const matched = cy.nodes().filter(n => (n.data('label') || '').toLowerCase().includes(q));
      cy.elements().addClass('faded');
      matched.forEach(n => n.closedNeighborhood().removeClass('faded').addClass('highlight'));
      if (matched.length) cy.fit(matched.union(matched.neighborhood()), 80);
    });
  }

  if (layoutSelect) {
    layoutSelect.addEventListener('change', () => {
      const name = layoutSelect.value;
      const opts = name === 'breadthfirst' ? { name, directed: true, padding: 30 } : name === 'circle' ? { name, padding: 30 } : { name: 'cose', animate: true, padding: 30, nodeRepulsion: 10000, idealEdgeLength: 120 };
      cy.layout(opts).run();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      cy.elements().removeClass('faded highlight');
      cy.fit(cy.elements(), 50);
      details.innerHTML = '<p>Select any node to see its description and relations.</p>';
      search.value = '';
      layoutSelect.value = 'cose';
      cy.layout({ name: 'cose', animate: true, padding: 30, nodeRepulsion: 10000, idealEdgeLength: 120 }).run();
    });
  }
})();

