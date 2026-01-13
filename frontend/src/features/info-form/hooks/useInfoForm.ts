import { useMatches } from 'react-router-dom';

export function useInfoForm() {
  const matches = useMatches();
  const type: 'edit' | 'create' | 'publish' = matches.find(
    (route) => route.id === 'EditInfo',
  )
    ? 'edit'
    : matches.find(
          (route) => route.id === 'CreateInfo' || route.id === 'CreateInfoFlow',
        )
      ? 'create'
      : 'publish';

  return {
    type,
  };
}
