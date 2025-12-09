import { ButtonSkeleton, Flex } from '@edifice.io/react';
import '../AdminThreadList.css';
import { AdminThreadSkeleton } from './AdminThreadSkeleton';

export function AdminThreadListSkeleton() {
  return (
    <>
      <ButtonSkeleton className="col-2 my-16" />
      <Flex direction="column" gap="16" fill>
        <Flex justify="center">
          <ButtonSkeleton className="col-12 col-lg-8" />
        </Flex>
        <AdminThreadSkeleton />
        <AdminThreadSkeleton />
        <AdminThreadSkeleton />
        <AdminThreadSkeleton />
      </Flex>
    </>
  );
}
