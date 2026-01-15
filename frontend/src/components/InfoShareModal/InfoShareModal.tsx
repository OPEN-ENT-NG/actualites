import { ShareRight, ShareRightActionDisplayName } from '@edifice.io/client';
import {
  Alert,
  Button,
  Flex,
  Modal,
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
    <Modal
      id={`info-share-modal`}
      size="lg"
      isOpen={isOpen}
      onModalClose={onCancel}
    >
      <Modal.Header onModalClose={onCancel}>
        {t(`actualites.info.shareForm.title`)}
      </Modal.Header>
      <Modal.Body>
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
      </Modal.Body>
      <Modal.Footer>
        <Button
          color="primary"
          variant="ghost"
          onClick={onCancel}
          data-testid="actualites.info.form.cancelButton"
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
          data-testid="actualites.info.form.saveButton"
        >
          {t('actualites.info.shareForm.save')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
