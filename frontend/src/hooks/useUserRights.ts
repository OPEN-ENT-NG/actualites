// import { useActionsStore } from '../store/actions';

import { useEdificeClient } from '@edifice.io/react';
import { useMemo } from 'react';
import { THREADS_CREATOR } from '~/config/rights';
import { useActionUserRights } from '~/store';

// /**
//  * This hook checks the workflows rights the current user may have.
//  * Workflow rights are always loaded by the root loader.
//  */
export function useUserRights() {
  const { user } = useEdificeClient();

  const rights = useActionUserRights.use.rights();
  const canCreateThread = rights?.[THREADS_CREATOR] ?? false;

  const canParamThreads = useMemo(() => {
    return (
      user?.functions.ADMIN_LOCAL &&
      user?.functions.ADMIN_LOCAL.scope.length > 1
    );
  }, [user]);

  return { canCreateThread, canParamThreads };
}
