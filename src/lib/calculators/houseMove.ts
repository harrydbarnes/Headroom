import {D,nonnegative,percent,rate,rounded,total,type Pence} from './money';
import {monthlyPayment,stressTest,type MortgageInput} from './mortgage';
export type Buyer='standard'|'firstTime'|'additional';
export type TaxPeriod='current'|'2024-10-31'|'2022-09-23';
export interface SDLTInput {price:Pence;buyer:Buyer;period?:TaxPeriod;nonResident?:boolean;}
/** Single residential purchases in England / NI. Historic periods are explicit. */
export function stampDuty(i:SDLTInput):Pence {
 nonnegative(i.price);if(!['standard','firstTime','additional'].includes(i.buyer))throw new RangeError('Invalid buyer type');
 const historical=i.period==='2024-10-31'||i.period==='2022-09-23';
 if(i.period&&!['current','2024-10-31','2022-09-23'].includes(i.period))throw new RangeError('Invalid tax period');
 const price=new D(i.price),limit=historical?62500000:50000000,relief=historical?42500000:30000000;
 const additional=i.buyer==='additional'&&i.price>=4000000?(i.period==='2022-09-23'?3:5):0,extra=additional+(i.nonResident?2:0);
 if(i.buyer==='firstTime'&&i.price<=limit)return rounded(D.max(0,price.minus(relief)).mul(.05).plus(price.mul(i.nonResident?.02:0)));
 const thresholds=historical?[25000000,92500000,150000000,Infinity]:[12500000,25000000,92500000,150000000,Infinity];
 const rates=historical?[0,5,10,12]:[0,2,5,10,12];let lower=0,tax=new D(0);
 thresholds.forEach((upper,j)=>{const band=D.max(0,D.min(price,upper).minus(lower));tax=tax.plus(band.mul(rates[j]+extra).div(100));lower=upper;});return rounded(tax);
}
export interface FeeInput {legalNet:Pence;legalVat:number;arrangement:Pence;valuation:Pence;booking:Pence;survey:Pence;surveyTier:'homebuyer'|'structural'|'custom';landRegistry:Pence;searches:Pence;epc:Pence;removals:Pence;storage:Pence;works:Pence;}
export function transactionCosts(i:FeeInput){Object.entries(i).forEach(([k,v])=>{if(k!=='surveyTier'&&k!=='legalVat')nonnegative(v as number);});rate(i.legalVat);const legal=i.legalNet+percent(i.legalNet,i.legalVat);const {legalNet,legalVat,surveyTier,...rest}=i;const breakdown={legal,...rest};return {breakdown,total:total(Object.values(breakdown))};}
export interface SaleInput {selling:boolean;price:Pence;redemption:Pence;erc:Pence;agentPercent:number;agentVat:number;listing:Pence;aml:Pence;}
export function saleEquity(i:SaleInput){[i.price,i.redemption,i.erc,i.listing,i.aml].forEach(nonnegative);rate(i.agentPercent);rate(i.agentVat);if(!i.selling)return {commission:0,saleFees:0,netEquity:0};const commission=rounded(new D(i.price).mul(i.agentPercent).div(100).mul(new D(1).plus(new D(i.agentVat).div(100)))),saleFees=total([commission,i.listing,i.aml,i.erc]);return {commission,saleFees,netEquity:i.price-i.redemption-saleFees};}
export interface HouseMoveInput {purchase:Pence;buyer:Buyer;period:TaxPeriod;nonResident:boolean;sale:SaleInput;fees:FeeInput;savings:Pence;extraSavings:Pence;reserve:Pence;loanMode:'required'|'fixed';fixedLoan:Pence;annualRate:number;years:number;interestOnly:boolean;ltvCeiling:number;borrowingLimit:Pence;exchangePercent:number;upfront:Pence;}
export function houseMove(i:HouseMoveInput){
 [i.purchase,i.savings,i.extraSavings,i.reserve,i.fixedLoan,i.borrowingLimit,i.upfront].forEach(nonnegative);rate(i.ltvCeiling);rate(i.exchangePercent);
 const sale=saleEquity(i.sale),fees=transactionCosts(i.fees),sdlt=stampDuty({price:i.purchase,buyer:i.buyer,period:i.period,nonResident:i.nonResident});
 const purchaseCosts=total([fees.total,sdlt]),cashRequired=total([i.purchase,purchaseCosts]),availableCash=total([i.savings,i.extraSavings]);
 const requiredLoan=Math.max(0,cashRequired+i.reserve-sale.netEquity-availableCash),loan=i.loanMode==='required'?requiredLoan:i.fixedLoan;
 const cashAfterCompletion=sale.netEquity+availableCash+loan-cashRequired,ltv=i.purchase?new D(loan).div(i.purchase).mul(100).toNumber():null;
 const mortgage:MortgageInput={principal:loan,annualRate:i.annualRate,years:i.years,interestOnly:i.interestOnly};
 const payment=monthlyPayment(mortgage),early=i.sale.selling?i.sale.listing+i.sale.aml+i.upfront:i.upfront,exchangeDeposit=percent(i.purchase,i.exchangePercent);
 return {sale,fees,sdlt,purchaseCosts,totalPurchaseCost:cashRequired,cashRequiredToComplete:cashRequired-loan,requiredLoan,loan,payment,cashAfterCompletion,bufferGap:Math.max(0,i.reserve-cashAfterCompletion),ltv,stress:stressTest(mortgage),exchange:{deposit:exchangeDeposit,early,savingsRemaining:availableCash-early,gap:Math.max(0,exchangeDeposit-(availableCash-early))},warnings:[...(loan>i.borrowingLimit?['Mortgage exceeds indicative borrowing limit']:[]),...(ltv!==null&&ltv>i.ltvCeiling?['Mortgage exceeds chosen LTV ceiling']:[]),...(loan>0&&(ltv===null||ltv>=100)?['Loan is at least the property value']:[]),...(cashAfterCompletion<0?['Cash shortfall at completion']:[]),...(cashAfterCompletion<i.reserve?['Cash buffer below target']:[])]};
}
