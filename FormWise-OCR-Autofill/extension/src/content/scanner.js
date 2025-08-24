export function scanFields(doc) {
  const inputs = [...doc.querySelectorAll('input, select, textarea')];
  const fields = inputs.map((el, idx) => {
    const id = el.id || `fw_${idx}`;
    const label = el.labels && el.labels[0] ? el.labels[0].innerText.trim()
      : el.getAttribute('aria-label') || el.name || el.placeholder || 'Field';
    return {
      id,
      label,
      type: el.type || el.tagName.toLowerCase(),
      required: el.required || false,
      pattern: el.getAttribute('pattern') || null,
      maxlength: el.getAttribute('maxlength') || null
    };
  });
  return { fields };
}

export function fillFields(doc, pairs) {
  const byId = new Map(pairs.map(p => [p.fieldId, p.value]));
  const inputs = [...doc.querySelectorAll('input, select, textarea')];
  inputs.forEach((el, idx) => {
    const fid = el.id || `fw_${idx}`;
    if (byId.has(fid)) {
      const v = byId.get(fid);
      if (el.tagName === 'SELECT') {
        const opt = [...el.options].find(o => o.value === v || o.text === v);
        if (opt) el.value = opt.value;
      } else {
        el.value = v;
      }
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
}
