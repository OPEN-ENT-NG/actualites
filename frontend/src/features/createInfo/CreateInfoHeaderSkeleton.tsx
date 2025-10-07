import { Stepper, TextSkeleton } from '@edifice.io/react';

export function CreateInfoHeaderSkeleton() {
  return (
    <>
      <Stepper currentStep={0} nbSteps={2} />
      <h1 className="placeholder col-3 mt-24" />
      <TextSkeleton size="lg" className="col-3 mt-2" />
    </>
  );
}
