// import { useActionsStore } from '../store/actions';

import { THREADS_CREATOR } from '~/config/rights';
import { useActionUserRights } from '~/store';

// /**
//  * This hook checks the workflows rights the current user may have.
//  * Workflow rights are always loaded by the root loader.
//  */
export function useUserRights() {
  const rights = useActionUserRights.use.rights();
  const canCreateThread = rights?.[THREADS_CREATOR] ?? false;

  return { canCreateThread };
}
