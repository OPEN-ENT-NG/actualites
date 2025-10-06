// import { useActionsStore } from '../store/actions';

import { useWorkflowRights } from '~/store';

// /**
//  * This hook checks the workflows rights the current user may have.
//  * Workflow rights are always loaded by the root loader.
//  */
export function useRights() {
  const rights = useWorkflowRights.use.rights();
  const canCreateThread =
    rights?.[
      'net.atos.entng.actualites.controllers.ThreadController|createThread'
    ] ?? false;

  return { canCreateThread };
}
