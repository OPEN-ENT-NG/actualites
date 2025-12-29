import { Flex, Stepper, TextSkeleton } from '@edifice.io/react';
import { useInfoForm } from '../hooks/useInfoForm';

export function InfoFormHeaderSkeleton() {
  const { type } = useInfoForm();
  return (
    <Flex direction="column" gap="16" className="mb-24">
      {type === 'create' && <Stepper currentStep={0} nbSteps={2} />}
      <Flex direction="column" gap="2">
        <h1 className="placeholder col-3" />
        <TextSkeleton size="lg" className="col-3" />
      </Flex>
    </Flex>
  );
}
