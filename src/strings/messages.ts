import {errorCatalog} from './errorCatalog';
import {toUserMessage} from './errors';
import {formatMonth} from '../lib/dates';
import {counted} from './format';
const messages:Record<string,string>={
 'consent expired. Reconnect your bank.':'Permission expired. Connect this bank again.',
 'cached retrieval remains incomplete. Check account coverage and retry after the 15-minute cache window.':'Some downloaded transactions are still missing. Check this bank’s accounts and refresh again after 15 minutes.',
 'non-GBP account omitted.':'An account in another currency was left out. Only GBP accounts are supported.',
 'a transaction was omitted because its reference, date or currency was unavailable.':'A transaction was left out because its reference, date or currency was missing. Check your bank statement.',
 'Enable Banking is busy. Please try again later.':'Enable Banking is busy. Try again later.',
 'Enable Banking declined access. Check your application, linked accounts and consent.':'Enable Banking refused access. Ask the server owner to check the application, linked accounts and bank permission, then try again.',

 'Confirm full month coverage in Activity first.':'Check this month is complete in Activity first.',
 'Confirm three complete reviewed past months before generating suggestions.':'Check three past months are complete and reviewed before viewing suggestions.',
 'Choose spendable accounts with dated balance snapshots.':'Choose accounts you can spend from and record a balance date for each.',
 'At least one starting snapshot is older than 24 hours.':'At least one starting balance is over 24 hours old.',
 'Ambiguous booked matches need explicit reconciliation.':'Some payments have more than one possible match. Check and link each one.',
 'Exact bank/card coverage depends on consent and provider permissions. Missing balances are unknown.':'Support depends on your exact bank or card and its permission. Missing balances are unknown.',
 'Explicitly linked booked entry':'Payment linked by you',
 'Exact merchant, account, amount; within three days':'Same merchant, account and amount, within three days',
 'Linked entry missing or changed; review required':'Linked payment is missing or changed. Check the match.',
 'Defined-benefit/hybrid inputs are recorded only; DC match scenarios are unavailable.':'Defined benefit and hybrid details are records only. Employer-match comparisons are available only for defined contribution schemes.',
};
/** Presentation adapter: preserve unrecognised warnings, particularly financial caveats. */
export function displayMessage(value:string):string{
 if(messages[value])return messages[value];
 if(errorCatalog[value])return toUserMessage(value);
 if(/^Enable Banking request failed \(\d+\)\.$/.test(value))return 'The bank request failed. Try again later or ask the server owner to check the connection.';
 const review=/^(\d+) transactions still need review\.$/.exec(value);if(review){const n=Number(review[1]);return n?`${counted(n,'transaction')} ${n===1?'needs':'need'} review.`:'No transactions need review.';}
 const based=/^Based on (.+)\. Coverage is your attestation\. Review before accepting\.$/.exec(value);if(based)return `Based on ${based[1].split(', ').map(formatMonth).join(', ')}. You confirm these months are complete; check suggestions before accepting.`;
 const imported=/^The latest bank import was (partial|failed); some booked activity may be missing\.$/.exec(value);if(imported)return 'The latest refresh was incomplete. Some completed transactions may be missing.';
 return value.replace(/[\u2013\u2014]/g,':');
}

/** Bank warnings prefix the bank name. Treat only this source as an error boundary;
 * ordinary financial warnings containing a colon must retain their caveats.
 */
export function displayBankMessage(value:string):string{
 const colon=value.indexOf(': ');if(colon>0){const detail=value.slice(colon+2),translated=displayMessage(detail);return value.slice(0,colon)+': '+(translated===detail?toUserMessage(detail):translated);}
 const translated=displayMessage(value);return translated===value?toUserMessage(value):translated;
}
