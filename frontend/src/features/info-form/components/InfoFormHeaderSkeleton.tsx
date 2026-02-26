import { Flex, Stepper, TextSkeleton } from '@edifice.io/react';
import { useRouteType } from '~/hooks/useRouteType';

export function InfoFormHeaderSkeleton() {
  const { isCreateRoute } = useRouteType();
  return (
    <Flex direction="column" gap="16" className="mb-24">
      {isCreateRoute && <Stepper currentStep={0} nbSteps={2} />}
      <Flex direction="column" gap="2">
        <h1 className="placeholder col-3" />
        <TextSkeleton size="lg" className="col-3" />
      </Flex>
    </Flex>
  );
}
