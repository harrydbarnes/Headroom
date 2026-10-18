export const formatCount=(n:number)=>new Intl.NumberFormat('en-GB').format(n);
/** Supply complete singular/plural forms; zero-specific sentences belong to the caller. */
export const plural=(n:number,one:string,other:string)=>n===1?one:other;
export const counted=(n:number,one:string,other=one+'s')=>`${formatCount(n)} ${plural(n,one,other)}`;

export const counts={
 year:(n:number)=>counted(n,'year','years'),
 verifiedBankConnection:(n:number)=>counted(n,"verified bank connection","verified bank connections"),
 transaction:(n:number)=>counted(n,"transaction","transactions"),
 selectedTransaction:(n:number)=>counted(n,"selected transaction","selected transactions"),
 overlappingMonth:(n:number)=>counted(n,"overlapping month","overlapping months"),
 completePastMonth:(n:number)=>counted(n,"complete past month","complete past months"),
 scenario:(n:number)=>counted(n,"scenario","scenarios"),
 merchantRule:(n:number)=>counted(n,"merchant rule","merchant rules"),
 moveScenario:(n:number)=>counted(n,"move scenario","move scenarios"),
 day:(n:number)=>counted(n,"day","days"),
 pastMonth:(n:number)=>counted(n,"past month","past months"),
 reviewedSpendingEntry:(n:number)=>counted(n,"reviewed spending entry","reviewed spending entries"),
 row:(n:number)=>counted(n,"row","rows"),
 existingMatch:(n:number)=>counted(n,"existing match","existing matches"),
 importedRow:(n:number)=>counted(n,"imported row","imported rows"),
 includedSpendingTransaction:(n:number)=>counted(n,"included spending transaction","included spending transactions"),
 excludedTransaction:(n:number)=>counted(n,"excluded transaction","excluded transactions"),
 purchaseOrRefund:(n:number)=>counted(n,"purchase or refund","purchases and refunds"),
 otherTransaction:(n:number)=>counted(n,"other transaction","other transactions"),
 spendingTransaction:(n:number)=>counted(n,"spending transaction","spending transactions"),
 otherSpendingTransaction:(n:number)=>counted(n,"other spending transaction","other spending transactions"),
 annualBillTransaction:(n:number)=>counted(n,"annual-bill transaction","annual-bill transactions"),
 recordedBankConnection:(n:number)=>counted(n,"recorded bank connection","recorded bank connections"),
 existingTransaction:(n:number)=>counted(n,"existing transaction","existing transactions"),
 month:(n:number)=>counted(n,"month","months"),
} as const;
