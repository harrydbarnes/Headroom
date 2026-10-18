export const formatCount=(n:number)=>new Intl.NumberFormat('en-GB').format(n);
/** Supply complete singular/plural forms; zero-specific sentences belong to the caller. */
export const plural=(n:number,one:string,other:string)=>n===1?one:other;
export const counted=(n:number,one:string,other=one+'s')=>`${formatCount(n)} ${plural(n,one,other)}`;
