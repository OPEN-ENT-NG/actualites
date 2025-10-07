import { QueryClient } from '@tanstack/react-query';
import { CreateInfoHeader } from '~/features/createInfo/CreateInfoHeader';
import './CreateInfo.css';

export const loader = (_queryClient: QueryClient) => async () => {
  return null;
};

export function CreateInfoShare() {
  return <CreateInfoHeader />;
}
