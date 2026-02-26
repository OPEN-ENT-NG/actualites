import { useMatches } from 'react-router-dom';

export function useRouteType() {
  const matches = useMatches();
  const type: 'admin' | 'param' | 'create' | 'edit' | 'publish' | 'list' =
    matches.find((route) => route.id === 'AdminThreads')
      ? 'admin'
      : matches.find(
            (route) =>
              route.id === 'CreateInfo' || route.id === 'CreateInfoFlow',
          )
        ? 'create'
        : matches.find(
              (route) => route.id === 'EditInfo' || route.id === 'EditInfoFlow',
            )
          ? 'edit'
          : matches.find((route) => route.id === 'ThreadsSetting')
            ? 'param'
            : matches.find(
                  (route) =>
                    route.id === 'PublishInfo' ||
                    route.id === 'PublishInfoRights',
                )
              ? 'publish'
              : 'list';
  return {
    isAdminRoute: type === 'admin',
    isCreateRoute: type === 'create',
    isEditRoute: type === 'edit',
    isListRoute: type === 'list',
    isParamRoute: type === 'param',
    isPublishRoute: type === 'publish',
  };
}
