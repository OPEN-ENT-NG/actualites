import { ShareRight, ShareRightActionDisplayName } from '@edifice.io/client';
import {
  Alert,
  Button,
  Modal,
  ShareOptions,
  ShareResources,
  ShareResourcesRef,
  useToast,
} from '@edifice.io/react';
import { useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useI18n } from '~/hooks/useI18n';
import { Thread } from '~/models/thread';
import { baseUrlAPI } from '~/services';
import { useThreadShares } from '~/services/queries';

interface AdminThreadShareModalProps {
  /** Controls modal visibility */
  isOpen: boolean;
  /** The thread being shared */
  thread: Thread;

  /** Callback when operation succeeds, with operation result as parameter */
  onSuccess: () => void;

  /** Callback when operation is cancelled */
  onCancel: () => void;
}

export const AdminThreadShareModal = ({
  isOpen,
  onCancel,
  onSuccess,
  thread,
}: AdminThreadShareModalProps) => {
  const { data: threadShares } = useThreadShares(thread.id);
  const { t } = useI18n();
  const toast = useToast();
  const shareInfoRef = useRef<ShareResourcesRef>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const shareOptions = useMemo<ShareOptions>(() => {
    return {
      resourceCreatorId: threadShares?.owner || '',
      resourceId: String(thread.id),
      resourceRights: threadShares?.rights || [],
      shareUrls: {
        getResourceRights: `${baseUrlAPI}/threads/${String(thread.id)}/shares`,
        saveResourceRights: `${baseUrlAPI}/threads/${String(thread.id)}/shares`,
        getShareMapping: `${baseUrlAPI}/rights/sharing`,
      },
      filteredActions: [
        'contrib',
        'publish',
        'manager',
      ] as ShareRightActionDisplayName[],
      defaultActions: [
        {
          id: 'contrib',
          displayName: 'contrib',
        },
      ],
    };
  }, [threadShares, thread.id]);

  const handleCloseModal = () => {
    onCancel();
  };

  const handleShareThreadSubmit = (isSubmitting: boolean) => {
    setIsSaving(isSubmitting);
  };

  const handleShareThreadChange = (_: ShareRight[], isDirty: boolean) => {
    setIsDirty(isDirty);
  };

  const handleShareThreadSubmitSuccess = () => {
    setIsDirty(false);
    setIsSaving(false);
    toast.success(t('actualites.adminThreads.shareModal.success'));
    onSuccess();
  };

  const handleShareClick = () => {
    if (isDirty) {
      // Save shares, then publish in onSuccess callback
      shareInfoRef.current?.handleShare(false);
    } else {
      handleCloseModal();
    }
  };

  return createPortal(
    <Modal
      id={`admin-share-thread-modal`}
      size="lg"
      isOpen={isOpen}
      onModalClose={handleCloseModal}
    >
      <Modal.Header onModalClose={handleCloseModal}>
        {t(`actualites.adminThreads.modal.modalTitle`)}
      </Modal.Header>

      <Modal.Body>
        <Alert type="info" className="mb-24">
          <div style={{ whiteSpace: 'pre-line' }}>
            {t('actualites.adminThreads.shareRightsInfo')}
          </div>
        </Alert>
        <ShareResources
          ref={shareInfoRef}
          onSuccess={handleShareThreadSubmitSuccess}
          onChange={handleShareThreadChange}
          onSubmit={handleShareThreadSubmit}
          shareOptions={shareOptions}
        />
      </Modal.Body>

      <Modal.Footer>
        <Button
          color="tertiary"
          onClick={handleCloseModal}
          type="button"
          variant="ghost"
          disabled={isSaving}
        >
          {t('actualites.adminThreads.modal.cancel')}
        </Button>
        <Button
          type="submit"
          color="primary"
          isLoading={isSaving}
          disabled={!isDirty || isSaving}
          variant="filled"
          onClick={handleShareClick}
        >
          {t('actualites.adminThreads.modal.save')}
        </Button>
      </Modal.Footer>
    </Modal>,
    (document.getElementById('portal') as HTMLElement) || document.body,
  );
};

export default AdminThreadShareModal;
