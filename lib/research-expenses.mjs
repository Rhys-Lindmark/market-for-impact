// Organization size is separate from the marginal cost-effectiveness model.
export function expenseSummary(record) {
  const years = [...(record?.years ?? [])].sort((a, b) => b.year - a.year).slice(0, 3);
  const valid = years.length === 3 && new Set(years.map(row => row.year)).size === 3
    && years.every(row => Number.isFinite(row.expenses) && row.expenses >= 0 && row.fullYear !== false)
    && years[0].year - years[2].year === 2;
  return {years, average: valid ? years.reduce((sum, row) => sum + row.expenses, 0) / 3 : null};
}
