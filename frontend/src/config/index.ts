/*
 * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 This is a starter file and can be deleted.
 * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 This folder should contain all config and constants
 * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 */

import { ACTION, IAction } from '@edifice.io/client';

export const existingActions: IAction[] = [
  {
    id: ACTION.CREATE,
    workflow:
      'net.atos.entng.actualites.controllers.ThreadController|createThread',
  },
];
