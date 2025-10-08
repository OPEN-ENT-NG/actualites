import { create } from 'zustand';
import { ThreadId } from '~/models/thread';
import { createSelectors } from './createSelectors';

export enum CreationStep {
  /**
   * Filling info parameters (title, content, thread, ...)
   */
  INFO_PARAM = 0,
  INFO_SHARE = 1,
}
export interface CreationInfoFormParams {
  thread_id?: ThreadId;
  title: string;
  headline: boolean;
  content: string;
}

export interface CreationInfoForm {
  values: CreationInfoFormParams;
  isValid: boolean;
  isDirty: boolean;
}

interface CreationState {
  infoForm?: {
    values: CreationInfoFormParams;
    isValid: boolean;
    isDirty: boolean;
  };
  resetForm: () => void;
  currentCreationStep: CreationStep;
  setInfoForm: (value: CreationInfoForm) => void;
  setResetForm: (value: () => void) => void;
  setCurrentCreationStep: (value: CreationStep) => void;
}

export const useCreationStore = createSelectors(
  create<CreationState>((set) => ({
    infoForm: undefined,
    resetForm: () => {},
    currentCreationStep: CreationStep.INFO_PARAM,
    setInfoForm: (infoForm) => set({ infoForm }),
    setResetForm: (resetForm) => set({ resetForm }),
    setCurrentCreationStep: (creationStep) =>
      set({ currentCreationStep: creationStep }),
  })),
);
