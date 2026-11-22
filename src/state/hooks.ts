import { active } from '../lib/workspace';
import { useFinance } from './store';
import { useShallow } from 'zustand/react/shallow';

export function useWorkspace() {
  const store = useFinance(
    useShallow((s) => ({
      data: s.data,
      storageBlocked: s.storageBlocked,
      mutationError: s.mutationError,
      change: s.change,
      resetExample: s.resetExample,
      patch: s.patch,
      setDemo: s.setDemo,
      preferences: s.preferences,
      review: s.review,
      confirmTransfer: s.confirmTransfer,
      editManual: s.editManual,
      deleteManual: s.deleteManual,
      applyActuals: s.applyActuals,
      clear: s.clear,
      restore: s.restore,
      flushSave: s.flushSave,
      dismissMutationError: s.dismissMutationError,
    })),
  );
  return { ...store, workspace: active(store.data), demo: store.data.demo };
}

/** Fine-grained selectors that avoid re-rendering on unrelated preference or inactive workspace edits. */
export const useActiveWorkspace = () => useFinance((s) => active(s.data));
export const usePlan = () => useFinance((s) => active(s.data).plan);
export const usePreferences = () => useFinance((s) => s.data.preferences);
export const useTransactions = () => useFinance((s) => active(s.data).transactions);
