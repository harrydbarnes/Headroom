import type {Movement} from '../lib/finance';
export const glossary={personal:'your data',example:'example data',moneyIn:'Money in',moneyOut:'Money out',type:'Type',linkPhone:'Link this phone',connectBank:'Connect a bank',refresh:'Refresh transactions',completeMonth:'Check this month is complete',otherAccounts:'Cash and other accounts',headroom:'monthly headroom',baseline:'monthly baseline'} as const;
const movementLabels:Record<Movement,string>={purchase:'Spending',income:'Income',refund:'Refund',transfer:'Transfer',repayment:'Repayment',review:'Needs review'};
export const movementLabel=(movement:Movement)=>movementLabels[movement];
