/** Calendar dates use explicit UTC parts and UTC formatting, so device time zones
 * and daylight-saving changes cannot move a date. Instants display in Europe/London.
 * ISO remains the storage/API format; these functions are presentation adapters only.
 */
export const MIN_YEAR=1900;
export const MAX_YEAR=2100;
const validYear=(year:number)=>year>=MIN_YEAR&&year<=MAX_YEAR;
const calendar = (iso:string):Date|null => {
 const match=/^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);if(!match)return null;
 const [,year,month,day]=match.map(Number),d=new Date(0);d.setUTCFullYear(year,month-1,day);d.setUTCHours(12,0,0,0);
 return d.getUTCFullYear()===year&&d.getUTCMonth()===month-1&&d.getUTCDate()===day?d:null;
};
const display=(iso:string,options:Intl.DateTimeFormatOptions)=>{const d=calendar(iso);return d?new Intl.DateTimeFormat('en-GB',{...options,timeZone:'UTC'}).format(d).replace(/\bSept\b/g,'Sep'):'Date unavailable';};
export const formatDate=(iso:string)=>display(iso,{day:'numeric',month:'short',year:'numeric'});
export const formatDateLong=(iso:string)=>display(iso,{day:'numeric',month:'long',year:'numeric'});
export const formatMonth=(iso:string)=>display(iso+'-01',{month:'long',year:'numeric'});
export const formatMonthShort=(iso:string)=>display(iso+'-01',{month:'short',year:'numeric'});
export function formatDateTime(value:string|number){const d=new Date(value);return Number.isFinite(d.getTime())?new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit',hourCycle:'h23',timeZone:'Europe/London'}).format(d).replace(/\bSept\b/g,'Sep'):'Date unavailable';}
export function formatRange(start:string,end:string){const a=calendar(start),b=calendar(end);if(!a||!b)return 'Dates unavailable';if(a>b)return `${formatDate(start)} to ${formatDate(end)}`;if(a.getUTCFullYear()===b.getUTCFullYear()&&a.getUTCMonth()===b.getUTCMonth())return `${a.getUTCDate()} to ${b.getUTCDate()} ${formatMonth(end.slice(0,7))}`;return `${display(start,{day:'numeric',month:'short',...(a.getUTCFullYear()!==b.getUTCFullYear()?{year:'numeric' as const}:{})})} to ${formatDate(end)}`;}
export const formatTaxYear=(value:string)=>parseTaxYear(value)?.replace('-','/')??'Tax year unavailable';
export function parseUkDate(text:string):string|null{const value=text.trim();if(calendar(value))return validYear(Number(value.slice(0,4)))?value:null;const m=/^(\d{1,2})([/ .-])(\d{1,2})\2(\d{4})$/.exec(value);if(!m||!validYear(Number(m[4])))return null;const iso=`${m[4]}-${m[3].padStart(2,'0')}-${m[1].padStart(2,'0')}`;return calendar(iso)?iso:null;}
export function parseUkMonth(text:string):string|null{const m=/^(\d{1,2})[/ .-](\d{4})$/.exec(text.trim());if(!m||!validYear(Number(m[2])))return null;const iso=`${m[2]}-${m[1].padStart(2,'0')}`;return calendar(iso+'-01')?iso:null;}
export function parseTaxYear(text:string):string|null{const m=/^(\d{4})[/-](\d{2})$/.exec(text.trim());return m&&validYear(Number(m[1]))&&validYear(Number(m[1])+1)&&Number(m[2])===(Number(m[1])+1)%100?`${m[1]}-${m[2]}`:null;}
export const dateInput=(iso:string)=>calendar(iso)?iso.split('-').reverse().join('/'):iso;
export const monthInput=(iso:string)=>/^\d{4}-\d{2}$/.test(iso)?iso.slice(5)+'/'+iso.slice(0,4):iso;
