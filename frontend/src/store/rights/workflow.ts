import { create } from 'zustand';
import { createSelectors } from '../createSelectors';
import { existingActions } from '~/config';

interface WorkflowRightsState {
  rights: Record<string, boolean>;
  setRights: (rights: Record<string, boolean>) => void;
}

const initialRights = existingActions.reduce(
  (acc, action) => {
    acc[action.workflow] = false;
    return acc;
  },
  {} as Record<string, boolean>,
);

export const useWorkflowRights = createSelectors(
  create<WorkflowRightsState>((set) => ({
    rights: initialRights,
    setRights: (rights) => set({ rights }),
  })),
);
