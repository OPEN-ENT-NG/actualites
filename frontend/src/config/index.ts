/*
 * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 This is a starter file and can be deleted.
 * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 This folder should contain all config and constants
 * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 */

import { ACTION, ActionType, IAction } from '@edifice.io/client';
import { CAN_USE_FALC, THREADS_CREATOR } from './rights';

export const existingActions: IAction[] = [
  {
    id: ACTION.CREATE,
    workflow: THREADS_CREATOR,
  },
  {
    id: 'simplify' as ActionType,
    workflow: CAN_USE_FALC,
  },
];
