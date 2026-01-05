import { ButtonSkeleton, Flex, useBreakpoint } from '@edifice.io/react';
import { useInfoForm } from '../hooks/useInfoForm';

export function InfoFormActionsSkeleton() {
  const { md } = useBreakpoint();
  const { type } = useInfoForm();

  return (
    <Flex
      direction={md ? 'row' : 'column-reverse'}
      justify="end"
      align={md ? 'center' : 'end'}
      gap="12"
      className="mb-48"
    >
      <ButtonSkeleton className="col-1" />
      {type === 'create' ? (
        <Flex gap="12" className="col-4 me-12">
          <ButtonSkeleton className="col-6" />
          <ButtonSkeleton className="col-6" />
        </Flex>
      ) : (
        <ButtonSkeleton className="col-6" />
      )}
    </Flex>
  );
}
