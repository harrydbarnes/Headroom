/** Hidden output is independent of the amount, including its length and sign. */
export function amountDisplay(value:number,precise:boolean,hidden:boolean){
 if(hidden)return '••••••';
 return new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP',minimumFractionDigits:precise?2:0,maximumFractionDigits:precise?2:0}).format(value/100);
}

/** A hidden layer never retains real text, including invisible layout or accessibility content. */
export function amountContent(value:number,precise:boolean,hidden:boolean){
 const mask=amountDisplay(0,false,true),text=hidden?null:amountDisplay(value,precise,false);
 return {mask,text,label:hidden?'Amount hidden':text!};
}
