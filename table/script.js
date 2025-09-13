(() => {
  const table = document.getElementById('artifactTable');
  if (!table) return;

  const tbody = table.querySelector('tbody');
  const headers = Array.from(table.querySelectorAll('thead th'));
  const filterInput = document.getElementById('filter');

  let sortState = { key: null, dir: 1 }; // 1 = asc, -1 = desc

  function getCellValue(tr, key) {
    const cell = tr.querySelector(`[data-key="${key}"]`);
    return cell ? cell.textContent.trim() : '';
  }

  function isNumeric(str) {
    return /^-?\d+(?:\.\d+)?$/.test(str.replace(/[, ]/g, ''));
  }

  function compare(a, b, key, dir) {
    const va = getCellValue(a, key);
    const vb = getCellValue(b, key);
    const na = isNumeric(va) ? parseFloat(va.replace(/[, ]/g, '')) : NaN;
    const nb = isNumeric(vb) ? parseFloat(vb.replace(/[, ]/g, '')) : NaN;
    let res;
    if (!Number.isNaN(na) && !Number.isNaN(nb)) {
      res = na - nb;
    } else {
      res = va.localeCompare(vb, undefined, { sensitivity: 'base' });
    }
    return res * dir;
  }

  function clearSortIndicators() {
    headers.forEach(h => {
      h.classList.remove('sort-asc', 'sort-desc');
      h.setAttribute('aria-sort', 'none');
    });
  }

  function applySort(key) {
    if (sortState.key === key) {
      sortState.dir *= -1;
    } else {
      sortState.key = key;
      sortState.dir = 1;
    }
    const rows = Array.from(tbody.querySelectorAll('tr'));
    rows.sort((a, b) => compare(a, b, key, sortState.dir));
    rows.forEach(r => tbody.appendChild(r));
    clearSortIndicators();
    const active = headers.find(h => h.dataset.key === key);
    if (active) {
      active.classList.add(sortState.dir === 1 ? 'sort-asc' : 'sort-desc');
      active.setAttribute('aria-sort', sortState.dir === 1 ? 'ascending' : 'descending');
    }
  }

  headers.forEach(h => {
    h.addEventListener('click', () => applySort(h.dataset.key));
    h.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        applySort(h.dataset.key);
      }
    });
    h.tabIndex = 0;
  });

  function filterRows(term) {
    const q = term.trim().toLowerCase();
    const rows = Array.from(tbody.querySelectorAll('tr'));
    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      row.style.display = text.includes(q) ? '' : 'none';
    });
  }

  if (filterInput) {
    filterInput.addEventListener('input', () => filterRows(filterInput.value));
  }
})();

