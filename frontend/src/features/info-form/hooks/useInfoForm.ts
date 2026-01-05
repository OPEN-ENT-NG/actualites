import { useMatches } from 'react-router-dom';

export function useInfoForm() {
  const matches = useMatches();
  const type = matches.find((route) => route.id === 'EditInfo')
    ? 'edit'
    : 'create';

  return {
    type,
  };
}
