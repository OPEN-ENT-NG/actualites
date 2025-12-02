import { ButtonSkeleton, Flex } from '@edifice.io/react';
import './AdminThreadList.css';
import { AdminThreadSkeleton } from './AdminThreadSkeleton';

export function AdminThreadListSkeleton() {
  return (
    <Flex direction="column" gap="16" fill>
      <ButtonSkeleton className="col-2 mt-8" />
      <AdminThreadSkeleton />
      <AdminThreadSkeleton />
      <AdminThreadSkeleton />
      <AdminThreadSkeleton />
    </Flex>
  );
}
