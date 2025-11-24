import { InfoId, InfoStatus } from '~/models/info';
import { useUpdateInfo } from '~/services/queries';

export function useInfoSharesForm({
  infoId,
  handleInfoSharesSave,
}: {
  infoId: InfoId;
  handleInfoSharesSave?: () => void;
}) {
  const { mutate: useUpdateInfoMutate } = useUpdateInfo();

  const handlePublish = (isDirty: boolean) => {
    if (!infoId) {
      throw new Error('infoId is undefined');
    }

    if (isDirty) {
      handleInfoSharesSave?.();
    }

    useUpdateInfoMutate(
      {
        infoId: infoId,
        infoStatus: InfoStatus.PUBLISHED,
        payload: {},
      },
      {
        onSuccess: () => {},
      },
    );
  };

  return {
    handlePublish,
  };
}
