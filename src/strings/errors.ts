/** Keep internal exception messages and tests stable. Only translate at UI boundaries.
 * Unknown failures cannot promise that a previous write did not happen.
 */
const messages:Record<string,string>={
 'Invalid backup structure.':'This file isn’t a Headroom backup. Choose a file exported from Headroom.',
 'Saved data uses an unsupported version.':'This data is from a version Headroom can’t read. Update the app and try again.',
 'Unsupported ledger version.':'This data is from a version Headroom can’t read. Update the app and try again.',
 'Unsupported planning version.':'This data is from a version Headroom can’t read. Update the app and try again.',
 'Use pounds with at most two decimal places (no thousands separators).':'Enter amounts like 1234.56, with no commas.',
 'Account names must be unique.':'You already have an account with that name. Choose another name.',
 'Invalid ledger text.':'These account details can’t be read. Check the source file and try again.',
 'Missing ledger identity.':'An account or transaction reference is missing. Check the source file and try again.',
 'Invalid planning records.':'These planning details can’t be read. Check them and try again.',
 'Annotation has no transaction.':'The transaction for these details is missing. Refresh your list and try again.',
 'Money must be safe integer pence':'This amount can’t be read. Check the amount and try again.',
 'Use an integer amount in pence.':'This amount can’t be read. Check the amount and try again.',
 'Use a valid YYYY-MM-DD date.':'Enter a date like 18/10/2026.',
 'Use a tax year such as 2026-27.':'Enter a tax year like 2026/27.',
 'Enter a target month such as 2027-06.':'Enter a month like 06/2027.',
 'Use dates in YYYY-MM-DD or DD/MM/YYYY format.':'Enter a date like 18/10/2026.',
 'The pairing ticket is invalid.':'This linking code can’t be used. Ask the server owner for a new link.',
 'Authentication was not completed.':'App lock wasn’t changed. Try again and unlock using your phone.',
 'Enrol device biometrics before enabling app lock.':'Set up fingerprint or face unlock in your phone settings, then try again.',
};
export function toUserMessage(error:unknown):string{
 const raw=error instanceof Error?error.message:typeof error==='string'?error:'';
 if(messages[raw])return messages[raw];
 if(Object.values(messages).includes(raw))return raw;
 const row=/^Wrong column count on row (\d+)$/.exec(raw);if(row)return `Row ${row[1]} has a different number of columns from the header. Check the file and try again.`;
 const column=/^Choose one unique column: (.+)$/.exec(raw);if(column)return `Choose a column with a unique heading for ${column[1]}.`;
 // Reviewed, specific plain messages are added explicitly as each screen is migrated.
 return 'Something went wrong. Check the latest saved data and try again.';
}
