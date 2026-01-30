import { ViewsCounters } from '@edifice.io/client';
import { create } from 'zustand';
import { InfoId } from '~/models/info';
import { createSelectors } from './createSelectors';

interface InfoAudienceState {
  viewsCounterByInfoId: ViewsCounters | undefined;
  updateViewsCounterByInfoId: (value: { [infoId: InfoId]: number }) => void;
}

export const useInfoAudienceStore = createSelectors(
  create<InfoAudienceState>((set) => ({
    viewsCounterByInfoId: undefined,
    updateViewsCounterByInfoId: (value) =>
      set((previousState) => ({
        ...previousState,
        viewsCounterByInfoId: {
          ...previousState.viewsCounterByInfoId,
          ...value,
        },
      })),
  })),
);
