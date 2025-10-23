/*
 * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 This is a starter file and can be deleted.
 * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 This folder should contain all config and constants
 * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 */

import { ACTION, IAction } from '@edifice.io/client';
import { THREAD_CREATION_RIGHT } from './rights';

export const existingActions: IAction[] = [
  {
    id: ACTION.CREATE,
    workflow: THREAD_CREATION_RIGHT,
  },
];
