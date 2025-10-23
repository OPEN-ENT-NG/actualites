// import { useActionsStore } from '../store/actions';

import { THREAD_CREATION_RIGHT } from '~/config/rights';
import { useActionUserRights } from '~/store';

// /**
//  * This hook checks the workflows rights the current user may have.
//  * Workflow rights are always loaded by the root loader.
//  */
export function useUserRights() {
  const rights = useActionUserRights.use.rights();
  const canCreateThread = rights?.[THREAD_CREATION_RIGHT] ?? false;

  return { canCreateThread };
}
