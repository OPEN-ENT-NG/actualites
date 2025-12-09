import { ButtonSkeleton, Flex, Image, TextSkeleton } from '@edifice.io/react';

export function AdminThreadSkeleton() {
  return (
    <Flex
      align="center"
      className="p-8 p-lg-12 admin-thread rounded"
      gap="24"
      fill
    >
      <Image height={80} width={80} alt="" className="placeholder" src="" />
      <Flex direction="column" gap="4" fill>
        <TextSkeleton className="col-12 col-md-8 col-xl-6" size="lg" />
        <TextSkeleton className="col-11 col-md-4 col-xl-4" />
      </Flex>
      <Flex gap="4" className="col-3 pe-lg-40" align="center" justify="end">
        <ButtonSkeleton className="d-none d-lg-block col-4" size="sm" />
        <ButtonSkeleton className="d-none d-lg-block col-4" size="sm" />
        <ButtonSkeleton className="col-4" size="sm" />
      </Flex>
    </Flex>
  );
}
