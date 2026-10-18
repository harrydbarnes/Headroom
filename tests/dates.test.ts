import {describe,it,expect} from 'vitest';
import {MIN_YEAR,MAX_YEAR,formatDate,formatDateLong,formatMonth,formatMonthShort,formatDateTime,formatRange,formatTaxYear,parseUkDate,parseUkMonth,parseTaxYear,dateInput,monthInput} from '../src/lib/dates';
describe('UK presentation dates',()=>{
 it('bounds typed dates, months and complete tax years',()=>{
  expect(MIN_YEAR).toBe(1900);expect(MAX_YEAR).toBe(2100);
  for(const year of ['0001','0099','1899','2101']){expect(parseUkDate(`01/01/${year}`)).toBeNull();expect(parseUkDate(`${year}-01-01`)).toBeNull();expect(parseUkMonth(`01/${year}`)).toBeNull();expect(parseTaxYear(`${year}/${String((Number(year)+1)%100).padStart(2,'0')}`)).toBeNull();}
  expect(parseUkDate('01/01/1900')).toBe('1900-01-01');expect(parseUkDate('31/12/2100')).toBe('2100-12-31');expect(parseUkMonth('12/2100')).toBe('2100-12');
  expect(parseTaxYear('1900/01')).toBe('1900-01');expect(parseTaxYear('2099/00')).toBe('2099-00');expect(parseTaxYear('2100/01')).toBeNull();
  expect(parseUkDate('29/02/1900')).toBeNull();expect(parseUkDate('29/02/2000')).toBe('2000-02-29');expect(parseUkDate('29/02/2100')).toBeNull();
 });
 it.each(['/','-','.',' '])('accepts %s as a day-first or month separator',separator=>{
  expect(parseUkDate(`18${separator}10${separator}2026`)).toBe('2026-10-18');expect(parseUkDate(`01${separator}02${separator}2027`)).toBe('2027-02-01');expect(parseUkMonth(`10${separator}2026`)).toBe('2026-10');
  expect(dateInput(parseUkDate(`18${separator}10${separator}2026`)!)).toBe('18/10/2026');expect(monthInput(parseUkMonth(`10${separator}2026`)!)).toBe('10/2026');
 });
 it('checks ISO first and rejects mixed separators and impossible dates',()=>{
  expect(parseUkDate('2026-10-18')).toBe('2026-10-18');expect(parseUkDate('2027-01-02')).toBe('2027-01-02');
  for(const value of ['18-10/2026','18.10-2026','31.04.2026','29-02-2027','01.13.2027','18 10 26'])expect(parseUkDate(value)).toBeNull();
  for(const value of ['00.2026','13-2026','10 26','2026-10'])expect(parseUkMonth(value)).toBeNull();
 });
 it('shows both full dates for reversed ranges',()=>{
  expect(formatRange('2026-09-30','2026-09-01')).toBe('30 Sep 2026 to 1 Sep 2026');expect(formatRange('2027-01-01','2026-12-31')).toBe('1 Jan 2027 to 31 Dec 2026');expect(formatRange('invalid','2026-09-01')).toBe('Dates unavailable');
 });
 it('uses UK calendar and month formats',()=>{expect(formatDate('2026-10-18')).toBe('18 Oct 2026');expect(formatDateLong('2026-10-18')).toBe('18 October 2026');expect(formatMonth('2026-09')).toBe('September 2026');expect(formatMonthShort('2026-09')).toBe('Sep 2026');expect(formatDateTime('2026-10-18T13:30:59Z')).toBe('18 Oct 2026, 14:30');});
 it('formats ranges without losing cross-year dates',()=>{expect(formatRange('2026-09-01','2026-09-30')).toBe('1 to 30 September 2026');expect(formatRange('2026-09-28','2026-10-03')).toBe('28 Sep to 3 Oct 2026');expect(formatRange('2026-12-31','2027-01-01')).toBe('31 Dec 2026 to 1 Jan 2027');});
 it('parses day first, leap days, ISO paste and valid month ends',()=>{expect(parseUkDate('01/02/2027')).toBe('2027-02-01');expect(parseUkDate('1/2/2027')).toBe('2027-02-01');expect(parseUkDate('29/02/2028')).toBe('2028-02-29');expect(parseUkDate('2026-10-18')).toBe('2026-10-18');for(const s of ['31/04/2027','29/02/2027','18/10/26','2027-02-30','0/1/2027'])expect(parseUkDate(s)).toBeNull();});
 it('round trips dates and parses month and tax-year inputs',()=>{for(const d of ['2026-10-18','2028-02-29','2027-03-25','2027-10-31'])expect(parseUkDate(dateInput(d))).toBe(d);expect(parseUkMonth('6/2027')).toBe('2027-06');expect(parseUkMonth('13/2027')).toBeNull();expect(parseTaxYear('2026/27')).toBe('2026-27');expect(parseTaxYear('2026-27')).toBe('2026-27');expect(parseTaxYear('2026/28')).toBeNull();expect(formatTaxYear('2026-27')).toBe('2026/27');});
 it('does not shift calendar dates across time zones or DST boundaries',()=>{const previous=process.env.TZ;try{for(const zone of ['Pacific/Honolulu','Pacific/Kiritimati','Europe/London']){process.env.TZ=zone;expect(formatDate('2027-03-25')).toBe('25 Mar 2027');expect(formatDate('2027-10-31')).toBe('31 Oct 2027');expect(formatDateTime('2027-10-31T01:30:00Z')).toBe('31 Oct 2027, 01:30');}}finally{process.env.TZ=previous;}});
});
