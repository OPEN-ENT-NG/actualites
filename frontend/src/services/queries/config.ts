import { odeServices } from '@edifice.io/client';
import { queryOptions, useQuery } from '@tanstack/react-query';

/**
 * Config Query Keys
 */
export const configQueryKeys = {
  config: () => ['config'],
};

/**
 * Provides query options for fetching config values related to actualites, such as the Screeb app ID.
 */
export const configQueryOptions = {
  /**
   * @returns Query options for fetching the actualites configuration, including the Screeb app ID. The query is cached indefinitely since config values are not expected to change frequently.
   */
  getConfig() {
    return queryOptions({
      queryKey: configQueryKeys.config(),
      queryFn: (): Promise<{ 'screeb-app-id'?: string }> =>
        odeServices.conf().getPublicConf('actualites'),
      staleTime: Infinity,
    });
  },
};

export const useConfig = () => useQuery(configQueryOptions.getConfig());
