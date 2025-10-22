import { Flex, Stepper, TextSkeleton } from '@edifice.io/react';

export function InfoFormHeaderSkeleton() {
  return (
    <Flex direction="column" gap="16">
      <Stepper currentStep={0} nbSteps={2} />
      <Flex direction="column" gap="2">
        <h1 className="placeholder col-3" />
        <TextSkeleton size="lg" className="col-3" />
      </Flex>
    </Flex>
  );
}
