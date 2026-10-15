import Decimal from 'decimal.js';
Decimal.set({precision:40, rounding:Decimal.ROUND_HALF_UP});
export const D = Decimal;
/** All public monetary values are safe integer pence. */
export type Pence = number;
export function pence(pounds: Decimal.Value): Pence { return checked(new D(pounds).mul(100).toDecimalPlaces(0).toNumber()); }
export function checked(n:number):Pence {if(!Number.isSafeInteger(n))throw new RangeError('Money must be safe integer pence');return n;}
export function nonnegative(n:number):Pence {checked(n);if(n<0)throw new RangeError('Money cannot be negative');return n;}
export function rounded(n:Decimal.Value):Pence{return checked(new D(n).toDecimalPlaces(0).toNumber());}
export function percent(amount:Pence,rate:number):Pence {checked(amount);if(!Number.isFinite(rate))throw new RangeError('Invalid percentage');return rounded(new D(amount).mul(rate).div(100));}
export function total(items:Pence[]):Pence{return checked(items.reduce((s,n)=>s+checked(n),0));}
export function rate(n:number,max=100):number{if(!Number.isFinite(n)||n<0||n>max)throw new RangeError('Invalid rate');return n;}
