import { create } from 'zustand';
import { InfoId, InfoStatus } from '~/models/info';
import { ThreadId } from '~/models/thread';
import { createSelectors } from './createSelectors';

export enum CreationStep {
  INFO_DETAILS = 0,
  INFO_RIGHTS = 1,
}

export interface InfoDetailsFormParams {
  infoId?: InfoId;
  infoStatus?: InfoStatus;
  thread_id?: ThreadId;
  title: string;
  headline: boolean;
  content: string;
}

export interface InfoDetailsFormState {
  isValid: boolean;
  isDirty: boolean;
}

interface InfoFormState {
  infoDetailsForm: InfoDetailsFormParams | undefined;
  infoDetailsFormState: InfoDetailsFormState;
  resetInfoDetailsForm: (values?: InfoDetailsFormParams) => void;
  currentCreationStep: CreationStep;
  setResetInfoDetailsForm: (
    value: (values?: InfoDetailsFormParams) => void,
  ) => void;
  setInfoDetailsForm: (value: InfoDetailsFormParams) => void;
  setInfoDetailsFormState: (value: InfoDetailsFormState) => void;
  setCurrentCreationStep: (value: CreationStep) => void;
}

export const useInfoFormStore = createSelectors(
  create<InfoFormState>((set) => ({
    infoDetailsForm: undefined,
    infoDetailsFormState: { isValid: false, isDirty: false },
    currentCreationStep: CreationStep.INFO_DETAILS,
    resetInfoDetailsForm: () => {},
    setInfoDetailsForm: (infoDetailsForm) => set({ infoDetailsForm }),
    setInfoDetailsFormState: (infoDetailsFormState) =>
      set({ infoDetailsFormState }),
    setResetInfoDetailsForm: (resetInfoDetailsForm) =>
      set({ resetInfoDetailsForm }),
    setCurrentCreationStep: (creationStep) =>
      set({ currentCreationStep: creationStep }),
  })),
);
