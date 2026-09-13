export function formatCurrency(amount: number, symbol: string): string {
  return `${symbol}${amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}
