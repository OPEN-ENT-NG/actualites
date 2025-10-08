import { ButtonSkeleton, Flex, useBreakpoint } from '@edifice.io/react';

export function CreateInfoFormActionsSkeleton() {
  const { md } = useBreakpoint();

  return (
    <Flex
      direction={md ? 'row' : 'column-reverse'}
      justify="end"
      align={md ? 'center' : 'end'}
      gap="12"
      wrap="reverse"
    >
      <ButtonSkeleton className="col-1" />
      <Flex gap="12" className="col-4 me-12">
        <ButtonSkeleton className="col-6" />
        <ButtonSkeleton className="col-6" />
      </Flex>
    </Flex>
  );
}
