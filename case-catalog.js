// Source links are optional: a summary-only case remains a valid entry.
export function normalizeCases(input) {
  if (!Array.isArray(input)) throw new Error('Invalid case catalog');
  return input.flatMap(item => {
    if (!item || typeof item.id !== 'string' || typeof item.title !== 'string' || !item.title.trim()) return [];
    const summary = typeof item.summary === 'string' ? item.summary.trim() : '';
    let url = '';
    try {
      if (typeof item.url === 'string' && item.url.trim()) {
        const candidate = new URL(item.url.trim());
        if (candidate.protocol === 'https:' && !candidate.username && !candidate.password) url = candidate.href;
      }
    } catch {}
    if (!summary && !url) return [];
    const categories = [...new Set((Array.isArray(item.categories) ? item.categories : typeof item.category === 'string' ? [item.category] : [])
      .filter(value => typeof value === 'string' && value.trim()).map(value => value.trim()))];
    return [{id:item.id, title:item.title.trim(), country:typeof item.country === 'string' ? item.country : '',
      language:typeof item.language === 'string' ? item.language : '', categories, summary, url}];
  });
}
