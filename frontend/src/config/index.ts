/*
 * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 This is a starter file and can be deleted.
 * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 This folder should contain all config and constants
 * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 */

import { ACTION, IAction } from '@edifice.io/client';
import { THREADS_CREATOR } from './rights';

export const existingActions: IAction[] = [
  {
    id: ACTION.CREATE,
    workflow: THREADS_CREATOR,
  },
];
