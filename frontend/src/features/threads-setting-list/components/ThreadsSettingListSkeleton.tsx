import { ButtonSkeleton, Flex } from '@edifice.io/react';
import '../ThreadsSettingList.css';
import { ThreadsSettingSkeleton } from './ThreadsSettingSkeleton';

export function ThreadsSettingListSkeleton() {
  return (
    <>
      <ButtonSkeleton className="col-2 my-16" />
      <Flex direction="column" gap="16" fill>
        <Flex justify="center">
          <ButtonSkeleton className="col-12 col-lg-8" />
        </Flex>
        <ThreadsSettingSkeleton />
        <ThreadsSettingSkeleton />
        <ThreadsSettingSkeleton />
        <ThreadsSettingSkeleton />
      </Flex>
    </>
  );
}
