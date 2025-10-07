import { create } from 'zustand';
import { Info } from '~/models/info';
import { createSelectors } from './createSelectors';

export enum CreationStep {
  INFO_PARAM = 0,
  INFO_SHARE = 1,
}

interface CreationState {
  info: Info | undefined;
  currentCreationStep: CreationStep;
  setInfo: (value: Info | undefined) => void;
  setCurrentCreationStep: (value: CreationStep) => void;
}

export const useCreationStore = createSelectors(
  create<CreationState>((set) => ({
    info: undefined,
    currentCreationStep: CreationStep.INFO_PARAM,
    setInfo: (info) => set({ info }),
    setCurrentCreationStep: (creationStep) =>
      set({ currentCreationStep: creationStep }),
  })),
);
