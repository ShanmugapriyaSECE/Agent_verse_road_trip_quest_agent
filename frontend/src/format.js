export function formatINR(amount) {
  if (amount === null || amount === undefined || isNaN(Number(amount))) return "—";
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(amount));
}
