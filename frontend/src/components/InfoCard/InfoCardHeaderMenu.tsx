import { Button, Dropdown } from '@edifice.io/react';
import {
  IconDelete,
  IconEdit,
  IconHide,
  IconSend,
  IconSubmitToValidate,
  IconWrite,
} from '@edifice.io/react/icons';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '~/hooks/useI18n';
import { useInfoActionDropdown } from '~/hooks/useInfoActionDropdown';
import { useInfoDelete } from '~/hooks/useInfoDelete';
import { useInfoPublishOrSubmit } from '~/hooks/useInfoPublishOrSubmit';
import { useInfoUnpublish } from '~/hooks/useInfoUnpublish';
import { useInfoUnsubmit } from '~/hooks/useInfoUnsubmit';
import { PortalModal } from '../PortalModal';
import { InfoCardProps } from './InfoCard';

export type InfoCardHeaderMenuProps = Pick<InfoCardProps, 'info'>;

export const InfoCardHeaderMenu = ({ info }: InfoCardHeaderMenuProps) => {
  const {
    isOwner,
    isDraft,
    thread,
    canDelete,
    canEdit,
    canPublish,
    canSubmit,
    canUnpublish,
    canUnsubmit,
  } = useInfoActionDropdown(info);

  const { publishOrSubmit } = useInfoPublishOrSubmit();
  const {
    unpublish,
    handleUnpublishAlertClose,
    handleUnpublishAlertOpen,
    isUnpublishAlertOpen,
  } = useInfoUnpublish();
  const {
    unsubmit,
    handleUnsubmitAlertClose,
    handleUnsubmitAlertOpen,
    isUnsubmitAlertOpen,
  } = useInfoUnsubmit();
  const {
    trash,
    handleDeleteAlertClose,
    handleDeleteAlertOpen,
    isDeleteAlertOpen,
  } = useInfoDelete();

  const { t, common_t } = useI18n();
  const navigate = useNavigate();

  const handleEditClick = () => {
    navigate(`/infos/${info.id}/edit`);
  };

  const handleSubmitClick = () => {
    if (thread) {
      if (isOwner) {
        publishOrSubmit({ ...info, thread: thread }, canPublish);
      } else {
        navigate(`/infos/${info.id}/publish`);
      }
    }
  };

  const handleUnsubmitClick = () => {
    if (thread) {
      unsubmit({ ...info, thread: thread });
    }
    handleUnsubmitAlertClose();
  };

  const handleUnpublishClick = () => {
    if (thread) {
      unpublish({ ...info, thread: thread });
    }
    handleUnpublishAlertClose();
  };

  const handleDeleteClick = () => {
    if (thread) {
      trash({ ...info, thread: thread });
    }
    handleDeleteAlertClose();
  };

  return (
    <>
      <Dropdown.Menu>
        {canEdit && (
          <Dropdown.Item
            data-testid="info-card-header-edit-dd-item"
            icon={<IconEdit />}
            onClick={handleEditClick}
          >
            {t('actualites.info.actions.edit')}
          </Dropdown.Item>
        )}

        {canUnpublish && (
          <Dropdown.Item
            data-testid="info-card-header-unpublish-dd-item"
            icon={<IconHide />}
            onClick={handleUnpublishAlertOpen}
          >
            {t('actualites.info.actions.unpublish')}
          </Dropdown.Item>
        )}

        {canUnsubmit && (
          <Dropdown.Item
            data-testid="info-card-header-unsubmit-dd-item"
            icon={<IconWrite />}
            onClick={handleUnsubmitAlertOpen}
          >
            {t('actualites.info.actions.unsubmit')}
          </Dropdown.Item>
        )}

        {isDraft && canPublish && (
          <Dropdown.Item
            data-testid={
              isOwner
                ? 'info-card-header-publish-dd-item'
                : 'info-card-header-submit-dd-item'
            }
            icon={isOwner ? <IconSend /> : <IconSubmitToValidate />}
            onClick={handleSubmitClick}
          >
            {isOwner
              ? t('actualites.info.actions.publish')
              : t('actualites.info.actions.validateAndPublish')}
          </Dropdown.Item>
        )}
        {canSubmit && (
          <Dropdown.Item
            data-testid="info-card-header-submit-dd-item"
            icon={<IconSubmitToValidate />}
            onClick={handleSubmitClick}
          >
            {t('actualites.info.actions.submitToValidation')}
          </Dropdown.Item>
        )}

        {canDelete && (
          <Dropdown.Item
            data-testid="info-card-header-delete-dd-item"
            icon={<IconDelete />}
            onClick={handleDeleteAlertOpen}
          >
            {t('actualites.info.actions.delete')}
          </Dropdown.Item>
        )}
      </Dropdown.Menu>

      {isUnsubmitAlertOpen && (
        <PortalModal
          id="modal-unsubmit"
          onModalClose={handleUnsubmitAlertClose}
          isOpen={isUnsubmitAlertOpen}
          size={'sm'}
          header={t('actualites.info.unsubmit.modal.title')}
          footer={
            <>
              <Button
                variant="ghost"
                color="tertiary"
                onClick={handleUnsubmitAlertClose}
              >
                {common_t('cancel')}
              </Button>
              <Button color="danger" onClick={handleUnsubmitClick}>
                {t('actualites.info.actions.unsubmit')}
              </Button>
            </>
          }
        >
          {t('actualites.info.unsubmit.modal.body')}
        </PortalModal>
      )}

      {isUnpublishAlertOpen && (
        <PortalModal
          id="modal-unpublish"
          onModalClose={handleUnpublishAlertClose}
          isOpen={isUnpublishAlertOpen}
          size={'sm'}
          header={t('actualites.info.unpublish.modal.title')}
          footer={
            <>
              <Button
                variant="ghost"
                color="tertiary"
                onClick={handleUnpublishAlertClose}
              >
                {common_t('close')}
              </Button>
              <Button color="danger" onClick={handleUnpublishClick}>
                {t('actualites.info.actions.unpublish')}
              </Button>
            </>
          }
        >
          {t('actualites.info.unpublish.modal.body')}
        </PortalModal>
      )}

      {isDeleteAlertOpen && (
        <PortalModal
          id="modal-delete"
          onModalClose={handleDeleteAlertClose}
          isOpen={isDeleteAlertOpen}
          size={'sm'}
          header={t('actualites.info.delete.modal.title')}
          footer={
            <>
              <Button
                variant="ghost"
                color="tertiary"
                onClick={handleDeleteAlertClose}
              >
                {t('actualites.info.delete.modal.cancel')}
              </Button>
              <Button color="danger" onClick={handleDeleteClick}>
                {t('actualites.info.delete.modal.action')}
              </Button>
            </>
          }
        >
          {t('actualites.info.delete.modal.body')}
        </PortalModal>
      )}
    </>
  );
};
