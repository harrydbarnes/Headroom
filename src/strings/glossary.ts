import type {Movement} from '../lib/finance';
export const glossary={personal:'your data',example:'example data',moneyIn:'Money in',moneyOut:'Money out',type:'Type',linkPhone:'Link this phone',connectBank:'Connect a bank',refresh:'Refresh transactions',completeMonth:'Check this month is complete',otherAccounts:'Cash and other accounts',headroom:'monthly headroom',baseline:'monthly baseline'} as const;
const movementLabels:Record<Movement,string>={purchase:'Spending',income:'Income',refund:'Refund',transfer:'Transfer',repayment:'Repayment',review:'Needs review'};
export const movementLabel=(movement:Movement)=>movementLabels[movement];

export const bankStatusLabel=(state:'loading'|'unpaired'|'unavailable'|'verified')=>({loading:'Checking connection',unpaired:'Phone not linked',unavailable:'Connection unavailable',verified:'Connection checked'})[state];

const options:Record<string,string>={
 in:'Money in',out:'Money out',all:'All money',none:'None',previous:'Previous working day',next:'Next working day',
 weekly:'Weekly',fortnightly:'Fortnightly','four-weekly':'Every four weeks',monthly:'Monthly',yearly:'Yearly',
 overall:'Overall',category:'Category',merchant:'Merchant',positive:'Unused money only',both:'Unused money and overspending',
 unknown:'Unknown',cash:'Cash',current:'Current',savings:'Savings','credit card':'Credit card',loan:'Loan',mortgage:'Mortgage',investment:'Investment',pension:'Pension',personal:'Personal',joint:'Joint',business:'Business',
 manual:'Recorded by you',provider:'Downloaded from bank',future:'Dated in the future',stale:'Over 24 hours old',expected:'Expected',settled:'Matched payment',overdue:'Overdue',ambiguous:'Needs a match check',
 'defined contribution':'Defined contribution','defined benefit':'Defined benefit',hybrid:'Hybrid',
 'full salary':'Full salary','basic salary':'Basic salary','reference salary':'Reference salary','scheme earnings':'Scheme earnings','qualifying earnings':'Qualifying earnings',
 'net pay':'Net pay','relief at source':'Relief at source','salary sacrifice':'Salary sacrifice',
 'full match':'Full employer match','chosen rate':'Chosen contribution rate','headroom floor':'Minimum monthly headroom','rest of UK':'Rest of UK',Scotland:'Scotland',
 '12':'Monthly','13':'Every four weeks','26':'Fortnightly','52':'Weekly'
};
/** Unrecognised values are custom user names, not translated identifiers. */
export const optionLabel=(value:string)=>options[value]??value;
