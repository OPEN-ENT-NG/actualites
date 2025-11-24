import { ShareRight, ShareRightActionDisplayName } from '@edifice.io/client';
import {
  Button,
  Flex,
  ShareOptions,
  ShareResources,
  ShareResourcesRef,
  TextSkeleton,
  useBreakpoint,
} from '@edifice.io/react';
import {
  IconArrowLeft,
  IconArrowRight,
  IconSave,
} from '@edifice.io/react/icons';
import { QueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  LoaderFunctionArgs,
  useLoaderData,
  useNavigate,
} from 'react-router-dom';
import { InfoFormActionsSkeleton, InfoFormHeaderSkeleton } from '~/features';
import { InfoFormHeader } from '~/features/info-form/components/InfoFormHeader';
import { useInfoSharesForm } from '~/features/info-form/hooks/useInfoSharesForm';
import { isInfoDetailsValid } from '~/features/info-form/utils/utils';
import { useI18n } from '~/hooks/useI18n';
import { InfoStatus } from '~/models/info';
import { baseUrlAPI } from '~/services';
import {
  infoQueryOptions,
  useInfoById,
  useInfoShares,
} from '~/services/queries';
import { CreationStep, useInfoFormStore } from '~/store/infoFormStore';

interface CreateInfoRightsProps {
  infoId: number;
}

export const loader =
  (queryClient: QueryClient) =>
  async ({ params }: LoaderFunctionArgs) => {
    const infoId = params['infoIdAsString']
      ? Number.parseInt(params['infoIdAsString'])
      : NaN;

    if (isNaN(infoId)) {
      throw new Error('Invalid infoId');
    }

    const queryMessage = infoQueryOptions.getInfoById(Number(infoId));

    queryClient.ensureQueryData(queryMessage);
    return { infoId };
  };

export function CreateInfoRights() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { md } = useBreakpoint();

  const { infoId } = useLoaderData() as CreateInfoRightsProps;
  const { data: info } = useInfoById(infoId);
  const { handlePublish } = useInfoSharesForm({ infoId });
  const shareInfoRef = useRef<ShareResourcesRef>(null);

  const [isDirty, setIsDirty] = useState(false);
  const [isDetailValid, setIsDetailValid] = useState(false);

  const setCurrentCreationStep = useInfoFormStore.use.setCurrentCreationStep();

  useEffect(() => {
    setCurrentCreationStep(CreationStep.INFO_RIGHTS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (info) {
      const infoDetails = {
        infoId: info.id,
        content: info.content,
        headline: info.headline,
        thread_id: info.thread.id,
        title: info.title,
      };
      const detailValid = isInfoDetailsValid(infoDetails);

      if (!detailValid) {
        // If details are not valid, go back to details step
        navigate('..', { relative: 'path' });
        return;
      }

      setIsDetailValid(detailValid);
    }
  }, [info, infoId]);

  // Share Modal State
  const { data: infoShares } = useInfoShares(infoId);

  const shareOptions = useMemo<ShareOptions>(() => {
    return {
      resourceCreatorId: infoShares?.owner || '',
      resourceId: String(infoId),
      resourceRights: infoShares?.rights || [],
      filteredActions: ['read', 'comment'] as ShareRightActionDisplayName[],
      urls: {
        getResourceRights: `${baseUrlAPI}/infos/${String(infoId)}/shares`,
        saveResourceRights: `${baseUrlAPI}/infos/${String(infoId)}/shares`,
        getShareMapping: `${baseUrlAPI}/rights/sharing`,
      },
    };
  }, [infoShares]);

  const handleShareInfoChange = (_: ShareRight[], isDirty: boolean) => {
    setIsDirty(isDirty);
  };

  const handleShareInfoSubmitSuccess = () => {
    setIsDirty(false);
    navigate('/');
  };

  const handleCancelClick = () => {
    navigate('..', { relative: 'path' });
  };

  const handleInfoSharesSave = () => {
    shareInfoRef.current?.handleShare();
  };

  const canPublish = info?.status !== InfoStatus.PUBLISHED && isDetailValid;

  if (!info) {
    return (
      <>
        <InfoFormHeaderSkeleton />
        <TextSkeleton className="col-12" />
        <InfoFormActionsSkeleton />
      </>
    );
  }

  return (
    <>
      <InfoFormHeader />
      <ShareResources
        ref={shareInfoRef}
        onSuccess={handleShareInfoSubmitSuccess}
        onChange={handleShareInfoChange}
        shareOptions={shareOptions}
      />
      <Flex
        direction={md ? 'row' : 'column-reverse'}
        justify="end"
        align={md ? 'center' : 'end'}
        gap="12"
        className="mb-48"
      >
        <Button
          color="primary"
          variant="ghost"
          onClick={handleCancelClick}
          data-testid="actualites.info.form.cancelButton"
          leftIcon={<IconArrowLeft />}
        >
          {t('actualites.info.createForm.previousStep')}
        </Button>
        <Flex gap="12">
          <Button
            color="primary"
            variant="outline"
            type="submit"
            leftIcon={<IconSave />}
            onClick={handleInfoSharesSave}
            disabled={!isDirty}
            data-testid="actualites.info.form.saveDraftButton"
          >
            {t('actualites.info.createForm.saveDraft')}
          </Button>
          <Button
            color="primary"
            type="submit"
            rightIcon={<IconArrowRight />}
            onClick={() => handlePublish(isDirty)}
            disabled={!canPublish}
            data-testid="actualites.info.form.submitButton"
          >
            {t('actualites.info.createForm.publish')}
          </Button>
        </Flex>
      </Flex>
    </>
  );
}
