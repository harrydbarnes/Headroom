export function parseCSV(text: string) {
  const rows: string[][] = [];
  let row: string[] = [],
    cell = '',
    quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (quoted && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else quoted = !quoted;
    } else if (c === ',' && !quoted) {
      row.push(cell);
      cell = '';
    } else if ((c === '\n' || c === '\r') && !quoted) {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(cell);
      if (row.some((x) => x.trim())) rows.push(row);
      row = [];
      cell = '';
    } else cell += c;
  }
  if (quoted) throw Error('A quoted CSV field is unfinished.');
  row.push(cell);
  if (row.some((x) => x.trim())) rows.push(row);
  return rows;
}

export function dateValue(s: string) {
  s = s.trim();
  let m: string[] | null = s.match(/^(\d{4})-(\d{2})-(\d{2})(?:$|T)/);
  if (!m) {
    const uk = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (uk)
      m = Object.assign(['', uk[3], uk[2].padStart(2, '0'), uk[1].padStart(2, '0')], {
        index: 0,
        input: s,
      });
  }
  if (!m) throw Error('Use dates in YYYY-MM-DD or DD/MM/YYYY format.');
  const value = `${m[1]}-${m[2]}-${m[3]}`;
  const d = new Date(value + 'T00:00:00Z');
  if (!Number.isFinite(d.getTime()) || d.toISOString().slice(0, 10) !== value)
    throw Error('The CSV contains an invalid date.');
  return value;
}
