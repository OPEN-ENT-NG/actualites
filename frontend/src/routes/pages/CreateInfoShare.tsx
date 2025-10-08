import { QueryClient } from '@tanstack/react-query';
import { CreateInfoFormHeader } from '~/features/create-info/components/CreateInfoFormHeader';
import './CreateInfo.css';

export const loader = (_queryClient: QueryClient) => async () => {
  return null;
};

export function CreateInfoShare() {
  return <CreateInfoFormHeader />;
}
