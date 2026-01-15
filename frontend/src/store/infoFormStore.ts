import { ShareRight } from '@edifice.io/client';
import { create } from 'zustand';
import { InfoId, InfoStatus } from '~/models/info';
import { ThreadId } from '~/models/thread';
import { createSelectors } from './createSelectors';

export enum InfoWorkflowStep {
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
  publicationDate: Date;
  expirationDate: Date;
}

export interface InfoDetailsFormState {
  isValid: boolean;
  isDirty: boolean;
}

interface InfoFormState {
  currentWorkflowStep: InfoWorkflowStep;
  infoId: InfoId | undefined;
  setCurrentWorkflowStep: (value: InfoWorkflowStep) => void;
  setInfoId: (value: InfoId) => void;

  // Info Details Form
  infoDetailsForm: InfoDetailsFormParams | undefined;
  infoDetailsFormState: InfoDetailsFormState;
  resetInfoDetailsForm: (values?: InfoDetailsFormParams) => void;
  setInfoDetailsForm: (value: InfoDetailsFormParams) => void;
  setInfoDetailsFormState: (value: InfoDetailsFormState) => void;
  setResetInfoDetailsForm: (
    value: (values?: InfoDetailsFormParams) => void,
  ) => void;

  // Info Shares Form
  infoShares: ShareRight[] | undefined;
  infoSharesFormDirty: boolean;
  handleInfoSharesSave: () => void;
  setInfoShares: (value: ShareRight[] | undefined) => void;
  setInfoSharesFormDirty: (value: boolean) => void;
  setHandleInfoSharesSave: (value: () => void) => void;
}

export const useInfoFormStore = createSelectors(
  create<InfoFormState>((set) => ({
    currentWorkflowStep: InfoWorkflowStep.INFO_DETAILS,
    infoId: undefined,
    infoDetailsForm: undefined,
    infoDetailsFormState: { isValid: false, isDirty: false },
    infoShares: undefined,
    infoSharesFormDirty: false,
    handleInfoSharesSave: () => {},
    resetInfoDetailsForm: () => {},
    setInfoId: (infoId) => set({ infoId }),
    setInfoDetailsForm: (infoDetailsForm) => set({ infoDetailsForm }),
    setInfoDetailsFormState: (infoDetailsFormState) =>
      set({ infoDetailsFormState }),
    setResetInfoDetailsForm: (resetInfoDetailsForm) =>
      set({ resetInfoDetailsForm }),
    setCurrentWorkflowStep: (creationStep) =>
      set({ currentWorkflowStep: creationStep }),
    setInfoShares: (infoRights) => set({ infoShares: infoRights }),
    setInfoSharesFormDirty: (infoRightsFormDirty) =>
      set({ infoSharesFormDirty: infoRightsFormDirty }),
    setHandleInfoSharesSave: (handleInfoSharesSave) =>
      set({ handleInfoSharesSave }),
  })),
);
