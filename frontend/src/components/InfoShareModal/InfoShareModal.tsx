import { ShareRight, ShareRightActionDisplayName } from '@edifice.io/client';
import {
  Alert,
  Button,
  Flex,
  ShareOptions,
  ShareResources,
  ShareResourcesRef,
} from '@edifice.io/react';
import { IconSave } from '@edifice.io/react/icons';
import { useMemo, useRef, useState } from 'react';
import { useI18n } from '~/hooks/useI18n';
import { Info } from '~/models/info';
import { baseUrlAPI } from '~/services';
import { useInfoShares } from '~/services/queries';
import { PortalModal } from '~/components/PortalModal';

export function InfoShareModal({
  info,
  isOpen,
  onCancel,
  onSubmit,
}: {
  info: Info;
  isOpen: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}) {
  const { t } = useI18n();
  const shareInfoRef = useRef<ShareResourcesRef>(null);

  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Share Modal State
  const { data: infoShares } = useInfoShares(info.id);

  const shareOptions = useMemo<ShareOptions>(() => {
    return {
      resourceCreatorId: infoShares?.owner || '',
      resourceId: String(info.id),
      resourceCreatorDisplayName: info.owner.displayName,
      resourceRights: infoShares?.rights || [],
      shareUrls: {
        getResourceRights: `${baseUrlAPI}/infos/${String(info.id)}/shares`,
        saveResourceRights: `${baseUrlAPI}/infos/${String(info.id)}/shares`,
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
  }, [infoShares, info.id]);

  const handleShareInfoSubmit = (isSubmitting: boolean) => {
    setIsSaving(isSubmitting);
  };

  const handleShareInfoChange = (_: ShareRight[], isDirty: boolean) => {
    setIsDirty(isDirty);
  };

  const handleShareInfoSubmitSuccess = () => {
    setIsDirty(false);
    setIsSaving(false);
    onSubmit();
  };

  const handleInfoSharesSave = () => {
    shareInfoRef.current?.handleShare();
    setIsSaving(true);
  };

  return (
    <PortalModal
      id="info-share-modal"
      size="lg"
      isOpen={isOpen}
      onModalClose={onCancel}
      header={t('actualites.info.shareForm.title')}
      footer={
        <>
          <Button
            color="primary"
            variant="ghost"
            onClick={onCancel}
            data-testid="info-share-modal-cancel-button"
            disabled={isSaving}
          >
            {t('actualites.info.createForm.cancel')}
          </Button>
          <Button
            color="primary"
            variant="outline"
            type="submit"
            leftIcon={<IconSave />}
            onClick={handleInfoSharesSave}
            disabled={!isDirty || isSaving}
            isLoading={isSaving}
            data-testid="info-share-modal-save-button"
          >
            {t('actualites.info.shareForm.save')}
          </Button>
        </>
      }
    >
      <Flex gap={'24'} direction="column">
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
      </Flex>
    </PortalModal>
  );
}
