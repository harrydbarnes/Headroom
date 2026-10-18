import {formatCount} from './format';
export const bankingCopy={
 cancelled:'Bank connection cancelled. Existing bank permission and transactions on this phone are unchanged.',
 linked:'Phone linked. You can now find your bank.',
 chooseBank:'Choose the exact bank and account product you use.',
 connected:'Bank connection checked. Refresh transactions, then disconnect any old expired permission.',
 noConnection:'Connection cancelled. No new bank connection was added.',
 unfinished:'Bank connection isn’t complete or checked yet. Finish in your bank’s browser, then check the connection again.',
 disconnected:'Bank permission removed and downloaded server data deleted. Transactions on this phone remain until you delete them.',
 counts:(added:number,updated:number,unchanged:number,warnings:string)=>`${formatCount(added)} new, ${formatCount(updated)} updated, ${formatCount(unchanged)} unchanged. ${warnings}`,
 shareTitle:'Save your Headroom data privately',
};
