import { ButtonSkeleton, Flex } from '@edifice.io/react';

export const InfoListSegmentedSkeleton = () => {
  return (
    <Flex
      direction="row"
      className="bg-gray-200 p-4 rounded"
      style={{ width: '300px' }}
    >
      <ButtonSkeleton className=" d-lg-block col-4" size="sm" />
    </Flex>
  );
};
