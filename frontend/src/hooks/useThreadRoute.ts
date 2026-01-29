import { useMatches } from 'react-router-dom';

export function useThreadRoute() {
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
    type,
  };
}
