import { odeServices } from '@edifice.io/client';
import { queryOptions, useQuery } from '@tanstack/react-query';

/**
 * Comment Query Keys always follow this format :
 * ['infos', infoId, 'comments', commentId]
 */
export const configQueryKeys = {
  config: () => ['config'],
};

/**
 * Provides query options for comment-related operations.
 */
export const configQueryOptions = {
  /**
   * @returns Query options for fetching comments about an info.
   */
  getConfig() {
    return queryOptions({
      queryKey: configQueryKeys.config(),
      queryFn: (): Promise<{ screebAppID: string }> =>
        odeServices.conf().getPublicConf('actualites'),
      staleTime: Infinity,
    });
  },
};

export const useConfig = () => useQuery(configQueryOptions.getConfig());
