import { useMatches } from 'react-router-dom';

export function useRouteType() {
  const matches = useMatches();
  const type: 'admin' | 'param' | 'create' | 'list' = matches.find(
    (route) => route.id === 'AdminThreads',
  )
    ? 'admin'
    : matches.find(
          (route) => route.id === 'CreateInfo' || route.id === 'CreateInfoFlow',
        )
      ? 'create'
      : matches.find((route) => route.id === 'ThreadsSetting')
        ? 'param'
        : 'list';
  return {
    isAdminRoute: type === 'admin',
    isCreateRoute: type === 'create',
    isParamRoute: type === 'param',
    isListRoute: type === 'list',
  };
}
