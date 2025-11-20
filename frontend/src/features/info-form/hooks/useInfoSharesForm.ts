import { InfoId, InfoStatus } from '~/models/info';
import { useSharesInfo, useUpdateInfo } from '~/services/queries';
import { useInfoFormStore } from '~/store/infoFormStore';

export function useInfoSharesForm() {
  const infoShares = useInfoFormStore.use.infoShares();
  const infoId = useInfoFormStore.use.infoId();
  const isInfoSharesFormDirty = useInfoFormStore.use.infoSharesFormDirty();
  const setInfoShares = useInfoFormStore.use.setInfoShares();
  const setInfoSharesFormDirty = useInfoFormStore.use.setInfoSharesFormDirty();
  const { mutate: updateSharesInfoMutate } = useSharesInfo();
  const { mutate: useUpdateInfoMutate } = useUpdateInfo();

  const updateSharesInfo = (onSuccess?: ({ id }: { id: InfoId }) => void) => {
    if (!infoId) {
      throw new Error('infoId is undefined');
    }
    return updateSharesInfoMutate(
      {
        resourceId: infoId,
        rights: infoShares || [],
      },
      {
        onSuccess: () => {
          onSuccess?.({ id: infoId });
        },
      },
    );
  };

  const onPublish = (onSuccess?: ({ id }: { id: InfoId }) => void) => {
    if (!infoId) {
      throw new Error('infoId is undefined');
    }

    if (isInfoSharesFormDirty) {
      updateSharesInfoMutate({
        resourceId: infoId,
        rights: infoShares || [],
      });
    }

    useUpdateInfoMutate(
      {
        infoId: infoId,
        infoStatus: InfoStatus.PUBLISHED,
        payload: {},
      },
      {
        onSuccess: () => {
          onSuccess?.({ id: infoId });
        },
      },
    );
  };

  return {
    updateSharesInfo,
    setInfoShares,
    isInfoSharesFormDirty,
    setInfoSharesFormDirty,
    onPublish,
  };
}
