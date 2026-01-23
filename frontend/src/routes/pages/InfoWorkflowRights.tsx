import { ShareRight, ShareRightActionDisplayName } from '@edifice.io/client';
import {
  Alert,
  Button,
  ButtonSkeleton,
  Flex,
  ShareOptions,
  ShareResources,
  ShareResourcesRef,
  useBreakpoint,
  useUser,
} from '@edifice.io/react';
import {
  IconArrowLeft,
  IconSave,
  IconSend,
  IconSubmitToValidate,
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
import { isInfoDetailsValid } from '~/features/info-form/utils/utils';
import { useI18n } from '~/hooks/useI18n';
import { useInfoPublishOrSubmit } from '~/hooks/useInfoPublishOrSubmit';
import { getThreadUserRights } from '~/hooks/utils/threads';
import { InfoStatus } from '~/models/info';
import { baseUrlAPI } from '~/services';
import {
  infoQueryOptions,
  useInfoById,
  useInfoShares,
} from '~/services/queries';
import { InfoWorkflowStep, useInfoFormStore } from '~/store/infoFormStore';

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

    const queryInfo = infoQueryOptions.getInfoById(Number(infoId));

    queryClient.ensureQueryData(queryInfo);
    return { infoId };
  };

export function InfoWorkflowRights() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { md } = useBreakpoint();
  const { user } = useUser();

  const { infoId } = useLoaderData() as CreateInfoRightsProps;
  const { data: info } = useInfoById(infoId);
  const shareInfoRef = useRef<ShareResourcesRef>(null);
  const isPublishing = useRef(false);
  const { publishOrSubmit } = useInfoPublishOrSubmit();
  const setCurrentCreationStep = useInfoFormStore.use.setCurrentWorkflowStep();

  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setCurrentCreationStep(InfoWorkflowStep.INFO_RIGHTS);
  }, [setCurrentCreationStep]);

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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [info, infoId]);

  // Share Modal State
  const { data: infoShares } = useInfoShares(infoId);

  const shareOptions = useMemo<ShareOptions>(() => {
    return {
      resourceCreatorId: infoShares?.owner || '',
      resourceCreatorDisplayName: info?.owner.displayName, // can be undefined, it's OK
      resourceId: String(infoId),
      resourceRights: infoShares?.rights || [],
      shareUrls: {
        getResourceRights: `${baseUrlAPI}/infos/${String(infoId)}/shares`,
        saveResourceRights: `${baseUrlAPI}/infos/${String(infoId)}/shares`,
        getShareMapping: `${baseUrlAPI}/rights/sharing`,
      },
      filteredActions: ['read', 'comment'] as ShareRightActionDisplayName[],
      defaultActions: [
        {
          id: 'read',
          displayName: 'read',
        },
      ],
    };
  }, [infoShares, infoId]);

  const canPublish = getThreadUserRights(
    info?.thread,
    user?.userId || '',
  ).canPublishInThread;

  const handleShareInfoSubmit = (isSubmitting: boolean) => {
    setIsSaving(isSubmitting);
  };

  const handleShareInfoChange = (_: ShareRight[], isDirty: boolean) => {
    setIsDirty(isDirty);
  };

  const handleShareInfoSubmitSuccess = () => {
    if (!info) return;
    setIsDirty(false);
    if (isPublishing.current) {
      publishOrSubmit(
        info,
        canPublish ? InfoStatus.PUBLISHED : InfoStatus.PENDING,
      );
    } else {
      navigate(`/threads/?status=draft`);
      setIsSaving(false);
    }
  };

  const handleCancelClick = () => {
    navigate('..', { relative: 'path' });
  };

  const handlePublishClick = () => {
    if (!info) return;

    isPublishing.current = true;
    if (isDirty) {
      // Save shares, then publish in onSuccess callback
      shareInfoRef.current?.handleShare(false);
    } else {
      // No changes to save, publish immediately
      publishOrSubmit(
        info,
        canPublish ? InfoStatus.PUBLISHED : InfoStatus.PENDING,
      );
    }
  };

  const handleInfoSharesSave = () => {
    shareInfoRef.current?.handleShare();
    setIsSaving(true);
  };

  if (!info) {
    return (
      <>
        <InfoFormHeaderSkeleton />
        <Flex direction="column" gap="8">
          <h1 className="placeholder col-6" />
          <ButtonSkeleton className="col-6" />
          <div className="placeholder col-12" style={{ height: '200px' }} />
          <ButtonSkeleton className="col-4" />
          <InfoFormActionsSkeleton />
        </Flex>
      </>
    );
  }

  return (
    <>
      <InfoFormHeader />
      <Alert type="info" className="w-100">
        <div style={{ whiteSpace: 'pre-line' }}>
          {t('actualites.info.createForm.rights.infoMessage')}
        </div>
      </Alert>
      <ShareResources
        ref={shareInfoRef}
        onSuccess={handleShareInfoSubmitSuccess}
        onChange={handleShareInfoChange}
        onSubmit={handleShareInfoSubmit}
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
          disabled={isSaving}
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
            disabled={!isDirty || isSaving || isPublishing.current}
            isLoading={isSaving}
            data-testid="actualites.info.form.saveDraftButton"
          >
            {t('actualites.info.createForm.saveDraft')}
          </Button>
          <Button
            color="primary"
            type="submit"
            leftIcon={canPublish ? <IconSend /> : <IconSubmitToValidate />}
            onClick={handlePublishClick}
            data-testid="actualites.info.form.submitButton"
            disabled={isSaving || isPublishing.current}
            isLoading={isPublishing.current}
          >
            {t(
              canPublish
                ? 'actualites.info.createForm.publish'
                : 'actualites.info.createForm.submit',
            )}
          </Button>
        </Flex>
      </Flex>
    </>
  );
}
