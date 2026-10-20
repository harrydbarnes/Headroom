/** Numeric drafts use displayed units; money is converted back to pence on commit. */
export function numberFieldValue(text: string, {
  money = true, min = 0, max = 1e10, integer = false,
}: {money?: boolean; min?: number; max?: number; integer?: boolean} = {}): number | null {
  if (text === '') return min === 0 ? 0 : null;
  const number = Number(text);
  if (!/^(?:\d+(?:\.\d{0,2})?|\.\d{1,2})$/.test(text) || !Number.isFinite(number) ||
      number < min || number > max || (integer && !Number.isInteger(number))) return null;
  return money ? Math.round(number * 100) : number;
}

export function numberFieldText(value: number, money: boolean, focused = false) {
  return value === 0 && !focused ? '' : String(money ? value / 100 : value);
}
