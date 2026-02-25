// import { useActionsStore } from '../store/actions';

import { useEdificeClient } from '@edifice.io/react';
import { useMemo } from 'react';
import { CAN_USE_FALC, THREADS_CREATOR } from '~/config/rights';
import { useThreadHasPreferences } from '~/services/queries';
import { useActionUserRights } from '~/store';

// The number of structures a user must have in their admin local function scope to be considered as super admin
const NUMBER_OF_STRUCTURES_TO_BE_SUPER_ADML = 5;

// /**
//  * This hook checks the workflows rights the current user may have.
//  * Workflow rights are always loaded by the root loader.
//  */
export function useUserRights() {
  const { user } = useEdificeClient();
  const { data: threadHasPreferences } = useThreadHasPreferences();

  const rights = useActionUserRights.use.rights();
  const canCreateThread = rights[THREADS_CREATOR] ?? false;
  const canUseFalc = rights?.[CAN_USE_FALC] ?? false;

  const canParamThreads = useMemo(() => {
    return (
      // Check that user has admin local function with a scope on more than NUMBER_OF_STRUCTURES_TO_BE_SUPER_ADML structures,
      // which means they are super admin and can access param threads page
      (user?.functions.ADMIN_LOCAL &&
        user?.functions.ADMIN_LOCAL.scope.length >
          NUMBER_OF_STRUCTURES_TO_BE_SUPER_ADML) ||
      threadHasPreferences
    );
  }, [user]);

  return { canCreateThread, canParamThreads, canUseFalc };
}
