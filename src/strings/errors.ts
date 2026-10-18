import {formatMonth} from '../lib/dates';
import {counted} from './format';
/** Exact internal keys are contracts. All presentation translation lives here. */
const exact:Record<string,{message:string;display?:string;passthrough?:boolean}> = {
  "Banking storage is not configured.": {
    "message": "The server can’t store bank data yet. Ask its owner to finish setup, then try again.",
    "display": "The server can’t store bank data yet. Ask its owner to finish setup, then try again."
  },
  "Unexpected provider redirect.": {
    "message": "The bank returned an unexpected web address. Close the browser and try connecting from Headroom again.",
    "display": "The bank returned an unexpected web address. Close the browser and try connecting from Headroom again."
  },
  "Transaction history exceeded the import limit. No partial import was saved.": {
    "message": "This history is too large to add. No partial refresh was saved. Ask the server owner to check the history request.",
    "display": "This history is too large to add. No partial refresh was saved. Ask the server owner to check the history request."
  },
  "PUBLIC_ORIGIN must be a bare HTTPS origin.": {
    "message": "The server’s public address isn’t set correctly. Ask its owner to check the HTTPS address, then try again.",
    "display": "The server’s public address isn’t set correctly. Ask its owner to check the HTTPS address, then try again."
  },
  "Set a random DEVICE_TOKEN (32+ random bytes) and 32-byte base64url BANKING_ENCRYPTION_KEY.": {
    "message": "The server’s security setup is incomplete. Ask its owner to check the device token and encryption key, then try again.",
    "display": "The server’s security setup is incomplete. Ask its owner to check the device token and encryption key, then try again."
  },
  "Invalid URL": {
    "message": "This server address can’t be used. Enter its HTTPS address and try again.",
    "display": "This server address can’t be used. Enter its HTTPS address and try again."
  },
  "Invalid bank": {
    "message": "This bank can’t be used. Choose a supported bank and try again.",
    "display": "This bank can’t be used. Choose a supported bank and try again."
  },
  "Set PUBLIC_ORIGIN and DEVICE_TOKEN in your server environment.": {
    "message": "The server’s address or device token is missing. Ask its owner to finish setup and try again.",
    "display": "The server’s address or device token is missing. Ask its owner to finish setup and try again."
  },
  "Could not issue a pairing ticket. Check the server and device token.": {
    "message": "The server couldn’t create a pairing link. Ask its owner to check the server and device token, then try again.",
    "display": "The server couldn’t create a pairing link. Ask its owner to check the server and device token, then try again."
  },
  "Too many outstanding pairing tickets.": {
    "message": "Too many pairing links are still active. Wait two minutes, then ask the server owner for a new one.",
    "display": "Too many pairing links are still active. Wait two minutes, then ask the server owner for a new one."
  },
  "Enter the HTTPS server address without a path, login details, query or fragment.": {
    "message": "Enter the server’s HTTPS address, with nothing after the host name.",
    "display": "Enter the server’s HTTPS address, with nothing after the host name."
  },
  "A quoted CSV field is unfinished.": {
    "message": "A quoted value in this statement file is unfinished. Check its quotation marks and try again.",
    "display": "A quoted value in this statement file is unfinished. Check its quotation marks and try again."
  },
  "Use dates in YYYY-MM-DD or DD/MM/YYYY format.": {
    "message": "Enter a date like 18/10/2026.",
    "display": "Enter a date like 18/10/2026."
  },
  "The CSV contains an invalid date.": {
    "message": "This statement file has a date that can’t be read. Check its dates and try again.",
    "display": "This statement file has a date that can’t be read. Check its dates and try again."
  },
  "The CSV needs headers and transaction rows.": {
    "message": "This statement file is missing column headings or transactions. Choose a complete statement file and try again.",
    "display": "This statement file is missing column headings or transactions. Choose a complete statement file and try again."
  },
  "CSV headers must include Date, Description (or Merchant), and Amount.": {
    "message": "This statement file needs Date, Description or Merchant, and Amount columns. Check the column headings and try again.",
    "display": "This statement file needs Date, Description or Merchant, and Amount columns. Check the column headings and try again."
  },
  "Too many forecast occurrences.": {
    "message": "There are too many scheduled payments to forecast. Shorten the forecast period and try again.",
    "display": "There are too many scheduled payments to forecast. Shorten the forecast period and try again."
  },
  "Your server returned an invalid connection status.": {
    "message": "The server’s connection details couldn’t be read. Check the connection again or ask the server owner for help.",
    "display": "The server’s connection details couldn’t be read. Check the connection again or ask the server owner for help."
  },
  "Use a valid goal target month.": {
    "message": "The goal’s target month can’t be read. Enter a month like 06/2027.",
    "display": "The goal’s target month can’t be read. Enter a month like 06/2027."
  },
  "Invalid planning assumptions": {
    "message": "These planning details can’t be read. Check the details or choose a recent Headroom backup and try again.",
    "display": "These planning details can’t be read. Check the details or choose a recent Headroom backup and try again."
  },
  "Invalid debt APR": {
    "message": "This debt’s interest rate can’t be read. Check the rate and try again.",
    "display": "This debt’s interest rate can’t be read. Check the rate and try again."
  },
  "Invalid goal deadline": {
    "message": "The goal deadline can’t be read. Enter a month like 06/2027.",
    "display": "The goal deadline can’t be read. Enter a month like 06/2027."
  },
  "Use an integer amount in pence.": {
    "message": "This amount can’t be read. Check the amount and try again.",
    "display": "This amount can’t be read. Check the amount and try again."
  },
  "Invalid ledger text.": {
    "message": "These account details can’t be read. Check the source file and try again.",
    "display": "These account details can’t be read. Check the source file and try again."
  },
  "Invalid ledger list.": {
    "message": "These account details can’t be read. Check the details or choose a recent Headroom backup and try again.",
    "display": "These account details can’t be read. Check the details or choose a recent Headroom backup and try again."
  },
  "Missing ledger identity.": {
    "message": "An account or transaction reference is missing. Check the source file and try again.",
    "display": "An account or transaction reference is missing. Check the source file and try again."
  },
  "Duplicate ledger identity.": {
    "message": "These account details can’t be read. Check the details or choose a recent Headroom backup and try again.",
    "display": "These account details can’t be read. Check the details or choose a recent Headroom backup and try again."
  },
  "Invalid balance date.": {
    "message": "These account details can’t be read. Check the details or choose a recent Headroom backup and try again.",
    "display": "These account details can’t be read. Check the details or choose a recent Headroom backup and try again."
  },
  "Unsupported ledger version.": {
    "message": "This data is from a version Headroom can’t read. Update the app and try again.",
    "display": "This data is from a version Headroom can’t read. Update the app and try again."
  },
  "Invalid account.": {
    "message": "These account details can’t be read. Check the details or choose a recent Headroom backup and try again.",
    "display": "These account details can’t be read. Check the details or choose a recent Headroom backup and try again."
  },
  "Account names must be unique.": {
    "message": "You already have an account with that name. Choose another name.",
    "display": "You already have an account with that name. Choose another name."
  },
  "Invalid balance account or source.": {
    "message": "These account details can’t be read. Check the details or choose a recent Headroom backup and try again.",
    "display": "These account details can’t be read. Check the details or choose a recent Headroom backup and try again."
  },
  "Annotation has no transaction.": {
    "message": "The transaction for these details is missing. Refresh your list and try again.",
    "display": "The transaction for these details is missing. Refresh your list and try again."
  },
  "Splits must have the parent direction and sum to its amount.": {
    "message": "The split amounts don’t match the transaction. Use money in or money out consistently and make them add up to the original amount.",
    "display": "The split amounts don’t match the transaction. Use money in or money out consistently and make them add up to the original amount."
  },
  "Duplicate transaction annotation.": {
    "message": "These transaction details can’t be read. Check the details or choose a recent Headroom backup and try again.",
    "display": "These transaction details can’t be read. Check the details or choose a recent Headroom backup and try again."
  },
  "Import account missing.": {
    "message": "The account for this statement file is missing. Select an account and try again.",
    "display": "The account for this statement file is missing. Select an account and try again."
  },
  "Duplicate import transaction.": {
    "message": "These transaction details can’t be read. Check the details or choose a recent Headroom backup and try again.",
    "display": "These transaction details can’t be read. Check the details or choose a recent Headroom backup and try again."
  },
  "Invalid saved CSV mapping.": {
    "message": "These planning details can’t be read. Check the details or choose a recent Headroom backup and try again.",
    "display": "These planning details can’t be read. Check the details or choose a recent Headroom backup and try again."
  },
  "Use pounds with at most two decimal places (no thousands separators).": {
    "message": "Enter amounts like 1234.56, with no commas.",
    "display": "Enter amounts like 1234.56, with no commas."
  },
  "CSV exceeds 20 MB.": {
    "message": "This statement file is over 20 MB. Choose a smaller statement file and try again.",
    "display": "This statement file is over 20 MB. Choose a smaller statement file and try again."
  },
  "Choose an active account.": {
    "message": "This account is archived. Reopen it or choose an active account.",
    "display": "This account is archived. Reopen it or choose an active account."
  },
  "Use a debit or credit on each row.": {
    "message": "A row can contain money in or money out, not both. Check those columns and try again.",
    "display": "A row can contain money in or money out, not both. Check those columns and try again."
  },
  "Use a valid non-negative rate.": {
    "message": "This rate can’t be used. Enter zero or more, within the limit shown.",
    "display": "This rate can’t be used. Enter zero or more, within the limit shown."
  },
  "Invalid pension scheme.": {
    "message": "These pension details can’t be read. Check the details or choose a recent Headroom backup and try again.",
    "display": "These pension details can’t be read. Check the details or choose a recent Headroom backup and try again."
  },
  "Scheme end precedes its effective date.": {
    "message": "The pension scheme ends before it starts. Check both dates and try again.",
    "display": "The pension scheme ends before it starts. Check both dates and try again."
  },
  "Choose monthly, four-weekly, fortnightly or weekly pay.": {
    "message": "Choose monthly, four-weekly, fortnightly or weekly pay.",
    "passthrough": true
  },
  "Match tiers need increasing upper employee rates.": {
    "message": "The pension matching bands aren’t in order. List their upper employee percentages from lowest to highest.",
    "display": "The pension matching bands aren’t in order. List their upper employee percentages from lowest to highest."
  },
  "Use a tax year such as 2026-27.": {
    "message": "Enter a tax year like 2026/27.",
    "display": "Enter a tax year like 2026/27."
  },
  "Evidence notes exceed 2,000 characters.": {
    "message": "These notes are over 2,000 characters. Shorten them and try again.",
    "display": "These notes are over 2,000 characters. Shorten them and try again."
  },
  "Use a valid calendar date.": {
    "message": "Enter a date like 18/10/2026.",
    "display": "Enter a date like 18/10/2026."
  },
  "Choose a valid period anchor.": {
    "message": "The first payday can’t be read. Enter a date like 18/10/2026.",
    "display": "The first payday can’t be read. Enter a date like 18/10/2026."
  },
  "Choose a supported period.": {
    "message": "This payment frequency isn’t supported. Choose one of the listed frequencies.",
    "display": "This payment frequency isn’t supported. Choose one of the listed frequencies."
  },
  "Choose a valid period date.": {
    "message": "The period date can’t be read. Enter a date like 18/10/2026.",
    "display": "The period date can’t be read. Enter a date like 18/10/2026."
  },
  "Amounts must be non-negative.": {
    "message": "This amount is below zero. Enter zero or more.",
    "display": "This amount is below zero. Enter zero or more."
  },
  "Use a valid YYYY-MM-DD date.": {
    "message": "Enter a date like 18/10/2026.",
    "display": "Enter a date like 18/10/2026."
  },
  "Choose a supported option.": {
    "message": "This option isn’t supported. Choose an option from the list.",
    "display": "This option isn’t supported. Choose an option from the list."
  },
  "Choose yes or no.": {
    "message": "This choice can’t be read. Set the switch on or off and try again.",
    "display": "This choice can’t be read. Set the switch on or off and try again."
  },
  "Invalid planning records.": {
    "message": "These planning details can’t be read. Check them and try again.",
    "display": "These planning details can’t be read. Check them and try again."
  },
  "Planning record identities must be unique.": {
    "message": "Some planning records have the same reference. Check the source data or restore a recent backup.",
    "display": "Some planning records have the same reference. Check the source data or restore a recent backup."
  },
  "Unsupported planning version.": {
    "message": "This data is from a version Headroom can’t read. Update the app and try again.",
    "display": "This data is from a version Headroom can’t read. Update the app and try again."
  },
  "Use a unique custom category name.": {
    "message": "That category name is already used. Choose another name.",
    "display": "That category name is already used. Choose another name."
  },
  "A subcategory needs a root category in the same group.": {
    "message": "This subcategory needs a main category in the same group. Choose a main category without its own parent.",
    "display": "This subcategory needs a main category in the same group. Choose a main category without its own parent."
  },
  "Budget end must follow its start.": {
    "message": "The budget ends before or on its start date. Choose a later end date.",
    "display": "The budget ends before or on its start date. Choose a later end date."
  },
  "Choose an existing budget category.": {
    "message": "That budget category isn’t available. Choose a category from the list.",
    "display": "That budget category isn’t available. Choose a category from the list."
  },
  "Invalid closed period.": {
    "message": "These planning details can’t be read. Check the details or choose a recent Headroom backup and try again.",
    "display": "These planning details can’t be read. Check the details or choose a recent Headroom backup and try again."
  },
  "End date precedes the first payment.": {
    "message": "The end date is before the first payment. Check both dates and try again.",
    "display": "The end date is before the first payment. Check both dates and try again."
  },
  "One price per effective date.": {
    "message": "More than one price is recorded for the same date. Keep one price for each date.",
    "display": "More than one price is recorded for the same date. Keep one price for each date."
  },
  "A due date may be settled once.": {
    "message": "This due date already has a matched payment. Check the existing match before adding another.",
    "display": "This due date already has a matched payment. Check the existing match before adding another."
  },
  "Cancellation instructions exceed 2,000 characters.": {
    "message": "The cancellation notes are over 2,000 characters. Shorten them and try again.",
    "display": "The cancellation notes are over 2,000 characters. Shorten them and try again."
  },
  "A booked transaction may settle only one expected event.": {
    "message": "This transaction is already linked to another expected payment or refund. Check that match before linking it again.",
    "display": "This transaction is already linked to another expected payment or refund. Check that match before linking it again."
  },
  "Choose valid forecast accounts and a horizon from 1 to 366 days.": {
    "message": "The forecast needs listed accounts and a period of 1 to 366 days. Check both and try again.",
    "display": "The forecast needs listed accounts and a period of 1 to 366 days. Check both and try again."
  },
  "Your figures changed after this preview. Reopen it before applying.": {
    "message": "Your data changed after this preview. Open the preview again before applying it.",
    "display": "Your data changed after this preview. Open the preview again before applying it."
  },
  "Explicitly confirm the excluded Other spending, or recategorise it first.": {
    "message": "Explicitly confirm the excluded Other spending, or recategorise it first.",
    "passthrough": true
  },
  "Confirm annual bills are excluded and the annual reserve stays unchanged.": {
    "message": "Confirm annual bills are excluded and the annual reserve stays unchanged.",
    "passthrough": true
  },
  "Only manual transactions can have their source details edited.": {
    "message": "Downloaded amounts, dates and accounts can’t be edited here. Change the transaction’s type or category instead.",
    "display": "Downloaded amounts, dates and accounts can’t be edited here. Change the transaction’s type or category instead."
  },
  "Only manual transactions can be deleted here. Disconnecting a bank does not delete its imported history.": {
    "message": "Only transactions you entered manually can be deleted here. Disconnecting a bank keeps its downloaded history. Check the transaction source.",
    "display": "Only transactions you entered manually can be deleted here. Disconnecting a bank keeps its downloaded history. Check the transaction source."
  },
  "Select two existing transfer entries.": {
    "message": "Select two existing transfer entries.",
    "passthrough": true
  },
  "Transfer match changed or is ambiguous. Review both sides individually.": {
    "message": "Transfer match changed or is ambiguous. Review both sides individually.",
    "passthrough": true
  },
  "Enter a merchant, account, valid past or current date and a positive amount.": {
    "message": "Enter a merchant, account, valid past or current date and a positive amount.",
    "passthrough": true
  },
  "Invalid backup structure.": {
    "message": "This file isn’t a Headroom backup. Choose a file exported from Headroom.",
    "display": "This file isn’t a Headroom backup. Choose a file exported from Headroom."
  },
  "Invalid backup text.": {
    "message": "This backup file can’t be read. Check the details or choose a recent Headroom backup and try again.",
    "display": "This backup file can’t be read. Check the details or choose a recent Headroom backup and try again."
  },
  "Invalid backup amount.": {
    "message": "This backup file can’t be read. Check the details or choose a recent Headroom backup and try again.",
    "display": "This backup file can’t be read. Check the details or choose a recent Headroom backup and try again."
  },
  "Invalid backup list.": {
    "message": "This backup file can’t be read. Check the details or choose a recent Headroom backup and try again.",
    "display": "This backup file can’t be read. Check the details or choose a recent Headroom backup and try again."
  },
  "Invalid backup date.": {
    "message": "This backup file can’t be read. Check the details or choose a recent Headroom backup and try again.",
    "display": "This backup file can’t be read. Check the details or choose a recent Headroom backup and try again."
  },
  "Invalid coverage confirmation.": {
    "message": "These planning details can’t be read. Check the details or choose a recent Headroom backup and try again.",
    "display": "These planning details can’t be read. Check the details or choose a recent Headroom backup and try again."
  },
  "Invalid planning rate.": {
    "message": "These planning details can’t be read. Check the details or choose a recent Headroom backup and try again.",
    "display": "These planning details can’t be read. Check the details or choose a recent Headroom backup and try again."
  },
  "Annual total and monthly reserve disagree.": {
    "message": "The yearly bills total and monthly reserve don’t match. Check both amounts and try again.",
    "display": "The yearly bills total and monthly reserve don’t match. Check both amounts and try again."
  },
  "Invalid debt APR.": {
    "message": "This debt’s interest rate can’t be read. Check the rate and try again.",
    "display": "This debt’s interest rate can’t be read. Check the rate and try again."
  },
  "Invalid debt minimum or goal priority.": {
    "message": "These planning details can’t be read. Check the details or choose a recent Headroom backup and try again.",
    "display": "These planning details can’t be read. Check the details or choose a recent Headroom backup and try again."
  },
  "Invalid backup transaction.": {
    "message": "This backup file can’t be read. Check the details or choose a recent Headroom backup and try again.",
    "display": "This backup file can’t be read. Check the details or choose a recent Headroom backup and try again."
  },
  "Duplicate transaction identities in backup.": {
    "message": "This backup file can’t be read. Check the details or choose a recent Headroom backup and try again.",
    "display": "This backup file can’t be read. Check the details or choose a recent Headroom backup and try again."
  },
  "Unknown move assumption.": {
    "message": "These move assumptions can’t be read. Check the details or choose a recent Headroom backup and try again.",
    "display": "These move assumptions can’t be read. Check the details or choose a recent Headroom backup and try again."
  },
  "Invalid move assumption type.": {
    "message": "These move assumptions can’t be read. Check the details or choose a recent Headroom backup and try again.",
    "display": "These move assumptions can’t be read. Check the details or choose a recent Headroom backup and try again."
  },
  "Invalid move assumptions.": {
    "message": "These move assumptions can’t be read. Check the details or choose a recent Headroom backup and try again.",
    "display": "These move assumptions can’t be read. Check the details or choose a recent Headroom backup and try again."
  },
  "No current housing payment must have a zero amount.": {
    "message": "A plan with no current housing payment still has an amount. Set the current housing payment to zero.",
    "display": "A plan with no current housing payment still has an amount. Set the current housing payment to zero."
  },
  "Invalid move input origin.": {
    "message": "These move assumptions can’t be read. Check the details or choose a recent Headroom backup and try again.",
    "display": "These move assumptions can’t be read. Check the details or choose a recent Headroom backup and try again."
  },
  "Invalid completed month.": {
    "message": "These planning details can’t be read. Check the details or choose a recent Headroom backup and try again.",
    "display": "These planning details can’t be read. Check the details or choose a recent Headroom backup and try again."
  },
  "Invalid account coverage.": {
    "message": "These account details can’t be read. Check the details or choose a recent Headroom backup and try again.",
    "display": "These account details can’t be read. Check the details or choose a recent Headroom backup and try again."
  },
  "Duplicate or empty coverage accounts.": {
    "message": "These account details can’t be read. Check the details or choose a recent Headroom backup and try again.",
    "display": "These account details can’t be read. Check the details or choose a recent Headroom backup and try again."
  },
  "Duplicate covered months.": {
    "message": "These planning details can’t be read. Check the details or choose a recent Headroom backup and try again.",
    "display": "These planning details can’t be read. Check the details or choose a recent Headroom backup and try again."
  },
  "A workspace supports at most 1,000 merchant rules. Remove unused rules before adding more.": {
    "message": "You can save up to 1,000 merchant rules. Remove unused rules before adding more.",
    "display": "You can save up to 1,000 merchant rules. Remove unused rules before adding more."
  },
  "Invalid merchant rule.": {
    "message": "These planning details can’t be read. Check the details or choose a recent Headroom backup and try again.",
    "display": "These planning details can’t be read. Check the details or choose a recent Headroom backup and try again."
  },
  "Invalid rule direction.": {
    "message": "These planning details can’t be read. Check the details or choose a recent Headroom backup and try again.",
    "display": "These planning details can’t be read. Check the details or choose a recent Headroom backup and try again."
  },
  "Invalid example guide step.": {
    "message": "These planning details can’t be read. Check the details or choose a recent Headroom backup and try again.",
    "display": "These planning details can’t be read. Check the details or choose a recent Headroom backup and try again."
  },
  "Invalid setup checklist.": {
    "message": "These planning details can’t be read. Check the details or choose a recent Headroom backup and try again.",
    "display": "These planning details can’t be read. Check the details or choose a recent Headroom backup and try again."
  },
  "Invalid import receipt.": {
    "message": "These transaction details can’t be read. Check the details or choose a recent Headroom backup and try again.",
    "display": "These transaction details can’t be read. Check the details or choose a recent Headroom backup and try again."
  },
  "Invalid import outcome.": {
    "message": "These transaction details can’t be read. Check the details or choose a recent Headroom backup and try again.",
    "display": "These transaction details can’t be read. Check the details or choose a recent Headroom backup and try again."
  },
  "Invalid import count.": {
    "message": "These transaction details can’t be read. Check the details or choose a recent Headroom backup and try again.",
    "display": "These transaction details can’t be read. Check the details or choose a recent Headroom backup and try again."
  },
  "This workspace exceeds the 20 MB backup limit. Export your existing data before adding more.": {
    "message": "Your data is over the 20 MB backup limit. Export your existing data before adding more.",
    "display": "Your data is over the 20 MB backup limit. Export your existing data before adding more."
  },
  "This workspace exceeds the 20 MB backup limit.": {
    "message": "Your data is over the 20 MB backup limit. Reduce its size before exporting again.",
    "display": "Your data is over the 20 MB backup limit. Reduce its size before exporting again."
  },
  "Backup exceeds 20 MB.": {
    "message": "This backup is over 20 MB. Choose a smaller Headroom backup.",
    "display": "This backup is over 20 MB. Choose a smaller Headroom backup."
  },
  "This file is not valid JSON. Choose an exported Headroom backup.": {
    "message": "This file can’t be read as a Headroom backup. Choose a file exported from Headroom.",
    "display": "This file can’t be read as a Headroom backup. Choose a file exported from Headroom."
  },
  "Choose a Headroom version 2, 3 or 4 backup.": {
    "message": "This backup format isn’t supported. Update Headroom or choose a supported Headroom backup.",
    "display": "This backup format isn’t supported. Update Headroom or choose a supported Headroom backup."
  },
  "Saved data uses an unsupported version.": {
    "message": "This data is from a version Headroom can’t read. Update the app and try again.",
    "display": "This data is from a version Headroom can’t read. Update the app and try again."
  },
  "Restored data hasn’t been saved. Try saving again before closing Headroom.": {
    "message": "Restored data hasn’t been saved. Try saving again before closing Headroom.",
    "passthrough": true
  },
  "Enrol device biometrics before enabling app lock.": {
    "message": "Set up fingerprint or face unlock in your phone settings, then try again.",
    "display": "Set up fingerprint or face unlock in your phone settings, then try again."
  },
  "Authentication was not completed.": {
    "message": "App lock wasn’t changed. Try again and unlock using your phone.",
    "display": "App lock wasn’t changed. Try again and unlock using your phone."
  },
  "Restored data hasn’t been saved yet. Try saving again before closing Headroom.": {
    "message": "Restored data hasn’t been saved yet. Try saving again before closing Headroom.",
    "passthrough": true
  },
  "Use your finance API HTTPS origin, with no path.": {
    "message": "Enter your server’s HTTPS address with no path after the host name.",
    "display": "Enter your server’s HTTPS address with no path after the host name."
  },
  "Use the server device token (at least 43 characters).": {
    "message": "Ask the server owner for the full device token, then try linking this phone again.",
    "display": "Ask the server owner for the full device token, then try linking this phone again."
  },
  "Pair your finance server in Settings first.": {
    "message": "Link this phone in Settings before connecting a bank.",
    "display": "Link this phone in Settings before connecting a bank."
  },
  "Your finance server returned an unreadable response. Check its HTTPS address and try again.": {
    "message": "your Headroom server returned an unreadable response. Check its HTTPS address and try again.",
    "passthrough": false
  },
  "File sharing is unavailable on this device.": {
    "message": "This phone can’t share files right now. Check its sharing settings and try again.",
    "display": "This phone can’t share files right now. Check its sharing settings and try again."
  },
  "File sharing is unavailable.": {
    "message": "This phone can’t share files right now. Check its sharing settings and try again.",
    "display": "This phone can’t share files right now. Check its sharing settings and try again."
  },
  "Use the HTTPS pairing link generated by your server.": {
    "message": "This pairing link can’t be used. Ask the server owner for a new one.",
    "display": "This pairing link can’t be used. Ask the server owner for a new one."
  },
  "The pairing ticket is invalid.": {
    "message": "This pairing link can’t be used. Ask the server owner for a new one.",
    "display": "This pairing link can’t be used. Ask the server owner for a new one."
  },
  "Pairing expired or was already used. Generate another link.": {
    "message": "This pairing link expired or was already used. Ask the server owner for a new link.",
    "display": "This pairing link expired or was already used. Ask the server owner for a new link."
  },
  "Leave example mode to connect a real bank.": {
    "message": "Show your data before connecting a real bank.",
    "display": "Show your data before connecting a real bank."
  },
  "Restore saved storage before importing transactions.": {
    "message": "Your saved data needs recovery before transactions can be added. Reopen it or restore a backup first.",
    "display": "Your saved data needs recovery before transactions can be added. Reopen it or restore a backup first."
  },
  "Leave example mode before importing real accounts.": {
    "message": "Show your data before refreshing real accounts.",
    "display": "Show your data before refreshing real accounts."
  },
  "Workspace changed during import. Return to personal figures and refresh again.": {
    "message": "Your data changed during refresh. Show your data and refresh transactions again.",
    "display": "Your data changed during refresh. Show your data and refresh transactions again."
  },
  "Unsupported storage version.": {
    "message": "These planning details can’t be read. Check the details or choose a recent Headroom backup and try again.",
    "display": "These planning details can’t be read. Check the details or choose a recent Headroom backup and try again."
  },
  "Stored transaction identities do not match their records.": {
    "message": "The saved transaction references don’t match their records. Reopen your data or restore a recent backup.",
    "display": "The saved transaction references don’t match their records. Reopen your data or restore a recent backup."
  },
  "The selected transactions changed. Select them again.": {
    "message": "The selected transactions changed. Select them again.",
    "passthrough": true
  },
  "This treatment does not match the selected debit/credit directions.": {
    "message": "This type doesn’t match the selected money in or money out. Check the type and try again.",
    "display": "This type doesn’t match the selected money in or money out. Check the type and try again."
  },
  "Use a valid YYYY-MM-DD export date.": {
    "message": "Enter an export date like 18/10/2026.",
    "display": "Enter an export date like 18/10/2026."
  },
  "Export end must follow start.": {
    "message": "The export end date is before its start date. Choose an end date on or after the start.",
    "display": "The export end date is before its start date. Choose an end date on or after the start."
  },
  "Use a valid past or current balance date.": {
    "message": "This balance date can’t be used. Enter today or an earlier date, like 18/10/2026.",
    "display": "This balance date can’t be used. Enter today or an earlier date, like 18/10/2026."
  },
  "Use upper employee percentage = employer match rate on each line.": {
    "message": "A matching band can’t be read. Write one band per line, like 6 = 100, with the employee percentage first.",
    "display": "A matching band can’t be read. Write one band per line, like 6 = 100, with the employee percentage first."
  },
  "A rule already exists for this merchant and direction. Edit that rule instead.": {
    "message": "A rule already exists for this merchant and money flow. Edit that rule instead.",
    "display": "A rule already exists for this merchant and money flow. Edit that rule instead."
  },
  "Use category = pounds for each split.": {
    "message": "A split needs a category and amount. Write each line like Groceries = 12.50.",
    "display": "A split needs a category and amount. Write each line like Groceries = 12.50."
  },
  "Enter an application ID and a PKCS#8 PEM private key (BEGIN PRIVATE KEY).": {
    "message": "Ask the server owner to check the Enable Banking account details and signing key, then try again.",
    "display": "Ask the server owner to check the Enable Banking account details and signing key, then try again."
  },
  "The restored figures have not been saved. Retry saving before closing the app.": {
    "message": "Restored data hasn’t been saved. Try saving again before closing Headroom.",
    "display": "Restored data hasn’t been saved. Try saving again before closing Headroom."
  },
  "Saved data could not be opened. Your existing records have not been replaced.": {
    "message": "Your saved data couldn’t be opened. The original records are still there. Try opening again or restore a backup.",
    "display": "Your saved data couldn’t be opened. The original records are still there. Try opening again or restore a backup."
  },
  "Changes are in memory but could not be saved. Retry before closing the app.": {
    "message": "Your changes haven’t been saved to this phone. Try saving again before closing Headroom.",
    "display": "Your changes haven’t been saved to this phone. Try saving again before closing Headroom."
  },
  "The edit could not be validated. Your previous figures are unchanged.": {
    "message": "This edit couldn’t be checked. Your earlier data is unchanged. Check the details and try again.",
    "display": "This edit couldn’t be checked. Your earlier data is unchanged. Check the details and try again."
  },
  "Restore or reopen your saved data before editing.": {
    "message": "Your saved data needs recovery. Try opening it again or restore a backup before editing.",
    "display": "Your saved data needs recovery. Try opening it again or restore a backup before editing."
  },
  "Use the named debt or goal list to change these figures.": {
    "message": "This amount belongs to a named debt or goal. Open that debt or goal to change it.",
    "display": "This amount belongs to a named debt or goal. Open that debt or goal to change it."
  },
  "Examples could not be reset.": {
    "message": "Example data couldn’t be reset. Try again.",
    "display": "Example data couldn’t be reset. Try again."
  },
  "Storage is unavailable. Retry opening the saved data before restoring a backup.": {
    "message": "Saved data can’t be opened right now. Try opening it again before restoring a backup.",
    "display": "Saved data can’t be opened right now. Try opening it again before restoring a backup."
  },
  "Backup could not be restored.": {
    "message": "The backup couldn’t be restored. Choose a supported Headroom backup and try again.",
    "display": "The backup couldn’t be restored. Choose a supported Headroom backup and try again."
  },
  "Screenshot protection could not be applied. Your financial screens remain hidden until you retry or explicitly turn this request off.": {
    "message": "Screen protection couldn’t be applied. Your financial screens remain hidden. Try again or turn protection off.",
    "display": "Screen protection couldn’t be applied. Your financial screens remain hidden. Try again or turn protection off."
  },
  "Screen protection could not be disabled. Its last confirmed state is shown.": {
    "message": "Screen protection couldn’t be turned off. Check the switch for its last confirmed setting and try again.",
    "display": "Screen protection couldn’t be turned off. Check the switch for its last confirmed setting and try again."
  },
  "The finance API could not complete this request.": {
    "message": "The server couldn’t complete this request. Check the connection and try again.",
    "display": "The server couldn’t complete this request. Check the connection and try again."
  },
  "Money must be safe integer pence": {
    "message": "This amount can’t be read. Check the amount and try again.",
    "passthrough": true
  },
  "Enter a target month such as 2027-06.": {
    "message": "Enter a month like 06/2027.",
    "passthrough": true
  },
  "consent expired. Reconnect your bank.": {
    "message": "Permission expired. Connect this bank again.",
    "display": "Permission expired. Connect this bank again."
  },
  "cached retrieval remains incomplete. Check account coverage and retry after the 15-minute cache window.": {
    "message": "Some downloaded transactions are still missing. Check this bank’s accounts and refresh again after 15 minutes.",
    "display": "Some downloaded transactions are still missing. Check this bank’s accounts and refresh again after 15 minutes."
  },
  "non-GBP account omitted.": {
    "message": "An account in another currency was left out. Only GBP accounts are supported.",
    "display": "An account in another currency was left out. Only GBP accounts are supported."
  },
  "a transaction was omitted because its reference, date or currency was unavailable.": {
    "message": "A transaction was left out because its reference, date or currency was missing. Check your bank statement.",
    "display": "A transaction was left out because its reference, date or currency was missing. Check your bank statement."
  },
  "Enable Banking is busy. Please try again later.": {
    "message": "Enable Banking is busy. Try again later.",
    "display": "Enable Banking is busy. Try again later."
  },
  "Enable Banking declined access. Check your application, linked accounts and consent.": {
    "message": "Enable Banking refused access. Ask the server owner to check the application, linked accounts and bank permission, then try again.",
    "display": "Enable Banking refused access. Ask the server owner to check the application, linked accounts and bank permission, then try again."
  },
  "Confirm full month coverage in Activity first.": {
    "message": "Check this month is complete in Activity first.",
    "display": "Check this month is complete in Activity first."
  },
  "Confirm three complete reviewed past months before generating suggestions.": {
    "message": "Check three past months are complete and reviewed before viewing suggestions.",
    "display": "Check three past months are complete and reviewed before viewing suggestions."
  },
  "Choose spendable accounts with dated balance snapshots.": {
    "message": "Choose accounts you can spend from and record a balance date for each.",
    "display": "Choose accounts you can spend from and record a balance date for each."
  },
  "At least one starting snapshot is older than 24 hours.": {
    "message": "At least one starting balance is over 24 hours old.",
    "display": "At least one starting balance is over 24 hours old."
  },
  "Ambiguous booked matches need explicit reconciliation.": {
    "message": "Some payments have more than one possible match. Check and link each one.",
    "display": "Some payments have more than one possible match. Check and link each one."
  },
  "Exact bank/card coverage depends on consent and provider permissions. Missing balances are unknown.": {
    "message": "Support depends on your exact bank or card and its permission. Missing balances are unknown.",
    "display": "Support depends on your exact bank or card and its permission. Missing balances are unknown."
  },
  "Explicitly linked booked entry": {
    "message": "Payment linked by you",
    "display": "Payment linked by you"
  },
  "Exact merchant, account, amount; within three days": {
    "message": "Same merchant, account and amount, within three days",
    "display": "Same merchant, account and amount, within three days"
  },
  "Linked entry missing or changed; review required": {
    "message": "Linked payment is missing or changed. Check the match.",
    "display": "Linked payment is missing or changed. Check the match."
  },
  "Defined-benefit/hybrid inputs are recorded only; DC match scenarios are unavailable.": {
    "message": "Defined benefit and hybrid details are records only. Employer-match comparisons are available only for defined contribution schemes.",
    "display": "Defined benefit and hybrid details are records only. Employer-match comparisons are available only for defined contribution schemes."
  },
  "Invalid projection": {
    "message": "Check the opening amount, monthly amount, interest rate and projection length."
  },
  "Invalid debt projection": {
    "message": "Check the debt interest rate and projection length."
  },
  "Invalid buyer type": {
    "message": "Choose a buyer type from the options shown."
  },
  "Invalid tax period": {
    "message": "Choose a tax period from the options shown."
  },
  "Money cannot be negative": {
    "message": "Enter an amount of zero or more."
  },
  "Invalid percentage": {
    "message": "Enter a valid percentage."
  },
  "Invalid rate": {
    "message": "Enter a rate within the limits shown."
  },
  "Term must be 1 to 50 whole years": {
    "message": "Enter a mortgage term from 1 to 50 whole years."
  },
  "Imported data or receipt failed validation. Previous figures retained.": {
    "message": "The downloaded data could not be checked. Review your data and try refreshing again."
  },
  "Import failed. Previous data retained.": {
    "message": "Transactions could not be refreshed. Try again."
  },
  "Connection status could not be checked.": {
    "message": "The bank connection could not be checked. Try again."
  },
  "Choose a completed past month.": {
    "message": "Choose a completed past month."
  },
  "Review every transaction in this month first.": {
    "message": "Review every transaction in this month first."
  },
  "Categorise the remaining uncategorised spending first.": {
    "message": "Choose categories for the remaining spending first."
  },
  "This month has no reviewed spending to use.": {
    "message": "This month has no reviewed spending to use."
  },
  "Net refunds exceed spending in a baseline category. Choose another month or enter a manual baseline.": {
    "message": "Refunds are higher than spending in a monthly baseline category. Choose another month or enter a manual baseline."
  }
};
export const genericError='Something went wrong. Try again. If it keeps happening, restart Headroom.';
type Pattern={match:RegExp;message:(match:RegExpExecArray)=>string;display?:boolean};
const patterns:Pattern[]=[
 {match:/^Row (\d+) has the wrong number of columns\.$/,message:m=>`Row ${m[1]} has a different number of columns from the header. Check the file and try again.`},
 {match:/^Check the merchant and amount on row (\d+)\.$/,message:m=>`Check the merchant and amount on row ${m[1]}.`},
 {match:/^Invalid data on row (\d+)\.$/,message:m=>`Check the details on row ${m[1]} and try again.`},
 {match:/^Future CSV transaction on row (\d+)$/,message:m=>`Row ${m[1]} has a future date. Check the date and try again.`},
 {match:/^Enter a name or reference \(maximum (\d+) characters\)\.$/,message:m=>`Enter a name or reference with at most ${m[1]} characters.`},
 {match:/^Duplicate or empty identities in (.+)\.$/,message:()=> 'Some records have missing or repeated references. Check the source data and try again.'},
 {match:/^Wrong column count on row (\d+)$/,message:m=>`Row ${m[1]} has a different number of columns from the header. Check the file and try again.`},
 {match:/^Choose one unique column: (.+)$/,message:m=>`Choose a column with a unique heading for ${m[1]}.`},
 {match:/^Enter a (?:date|month|tax year) like /,message:m=>m.input},
 {match:/^Enable Banking request failed \(\d+\)\.$/,display:true,message:()=> 'The bank request failed. Try again later or ask the server owner to check the connection.'},
 {match:/^(\d+) transactions still need review\.$/,display:true,message:m=>{const n=Number(m[1]);return n?`${counted(n,'transaction')} ${n===1?'needs':'need'} review.`:'No transactions need review.';}},
 {match:/^Based on (.+)\. Coverage is your attestation\. Review before accepting\.$/,display:true,message:m=>`Based on ${m[1].split(', ').map(formatMonth).join(', ')}. You confirm these months are complete. Check suggestions before accepting.`},
 {match:/^The latest bank import was (partial|failed); some booked activity may be missing\.$/,display:true,message:()=> 'The latest refresh was incomplete. Some completed transactions may be missing.'},
];
function pattern(raw:string,displayOnly=false){for(const entry of patterns){if(displayOnly&&!entry.display)continue;const match=entry.match.exec(raw);if(match)return entry.message(match);}}
export function toUserMessage(error:unknown):string{
 const raw=error instanceof Error?error.message:typeof error==='string'?error:'';
 if(exact[raw])return exact[raw].message;
 if(Object.values(exact).some(entry=>entry.message===raw||entry.display===raw))return raw;
 return pattern(raw)??genericError;
}
/** Unknown financial warnings retain their full caveats. */
export function displayMessage(value:string):string{
 if(exact[value])return exact[value].passthrough?value:exact[value].display??exact[value].message;
 return pattern(value,true)??value.replace(/[\u2013\u2014]/g,':');
}
export function displayBankMessage(value:string):string{
 const colon=value.indexOf(': ');if(colon>0){const detail=value.slice(colon+2),translated=displayMessage(detail);return value.slice(0,colon)+': '+(translated===detail?toUserMessage(detail):translated);}
 const translated=displayMessage(value);return translated===value?toUserMessage(value):translated;
}
