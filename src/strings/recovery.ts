// Presentation copy only. Stored values and contracts remain in the domain modules.
export const recoveryCopy = {

 replaceUnreadableSavedData: "Replace unreadable saved data?",
 restoreConfirmBody: (value0:unknown,value1:unknown)=>`This restores ${value0} and ${value1} from a checked backup, and resets unreadable example data. It can’t be undone. The phone link is unchanged. Export recovery records first if you need the originals.`,
 cancel: "Cancel",
 restoreBackup: "Restore backup",
 recoverYourData: "Recover your data",
 editingPaused: "Editing is paused. Default or example values are not being presented as your recovered finances.",
 preserveYourRecords: "Preserve your records",
 exportPrivacySummary: "Exports contain private financial information.",
 exportPrivacyDetail: "Exports contain private financial information. Save them to a private folder. Recovery records are an unchecked copy of the original data. They can’t be restored as a normal backup.",
 exportYourBackup: "Export your backup",
 yourBackupWasWritten: "Your backup was written.",
 exportCancelled: "Export cancelled.",
 backupShareReceipt: "Share sheet closed. Confirm the destination saved your backup.",
 exportRecoveryRecords: "Export recovery records",
 recoveryRecordsExportedText: "Recovery records exported. Keep them private.",
 archiveShareReceipt: "Share sheet closed. Confirm the destination saved the archive.",
 tryOpeningAgain: "Try opening again",
 restoreABackup: "Restore a backup",
 restoreUnavailableHelp: "If storage itself is unavailable, restore will report a save failure. No successful save is claimed until the data has been written.",
} as const;
