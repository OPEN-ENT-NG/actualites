import {
  Badge,
  Button,
  Dropdown,
  Flex,
  IconButton,
  IconButtonProps,
  Image,
  useBreakpoint,
  useUser,
} from '@edifice.io/react';
import {
  IconClock,
  IconClockAlert,
  IconDelete,
  IconEdit,
  IconHide,
  IconOptions,
  IconSave,
  IconSend,
  IconSubmitToValidate,
} from '@edifice.io/react/icons';
import clsx from 'clsx';
import { RefAttributes, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import iconHeadline from '~/assets/icon-headline.svg';
import { useI18n } from '~/hooks/useI18n';
import { useInfoDelete } from '~/hooks/useInfoDelete';
import { useInfoPublishOrSubmit } from '~/hooks/useInfoPublishOrSubmit';
import { useInfoStatus } from '~/hooks/useInfoStatus';
import { useInfoUnpublish } from '~/hooks/useInfoUnpublish';
import { useThread } from '~/hooks/useThread';
import { getThreadUserRights } from '~/hooks/utils/threads';
import { InfoExtendedStatus, InfoStatus } from '~/models/info';
import { PortalModal } from '../PortalModal';
import { InfoCardProps } from './InfoCard';
import { InfoCardThreadHeader } from './InfoCardThreadHeader';
import { UserInfo } from './UserInfo';

export type InfoCardHeaderProps = Pick<InfoCardProps, 'info'> & {
  extendedStatus?: InfoExtendedStatus;
};

export const InfoCardHeader = ({
  info,
  extendedStatus,
}: InfoCardHeaderProps) => {
  const thread = useThread(info.threadId);

  const [dropDownVisible, setDropDownVisible] = useState(false);
  const { isExpired } = useInfoStatus(info);

  const { publishOrSubmit } = useInfoPublishOrSubmit();
  const {
    unpublish,
    handleUnpublishAlertClose,
    handleUnpublishAlertOpen,
    isUnpublishAlertOpen,
  } = useInfoUnpublish();
  const {
    trash,
    handleDeleteAlertClose,
    handleDeleteAlertOpen,
    isDeleteAlertOpen,
  } = useInfoDelete();
  const { user } = useUser();

  const {
    canContribute,
    canPublish: canPublishInThread,
    canManage,
  } = getThreadUserRights(thread, user?.userId || '');

  const { t, common_t } = useI18n();
  const navigate = useNavigate();
  const { md, lg } = useBreakpoint();
  const styles = lg
    ? { gridTemplateColumns: '1fr auto 1fr', gap: '12px' }
    : { gridTemplateColumns: '1fr', gap: '12px' };

  const isOwner = info.owner.id === user?.userId;

  const canSubmit = info.status === InfoStatus.DRAFT && canContribute;

  const canPublish =
    (info.status === InfoStatus.DRAFT || info.status === InfoStatus.PENDING) &&
    canPublishInThread;

  const canEdit =
    (info.status === InfoStatus.DRAFT && info.owner.id === user?.userId) ||
    (info.status === InfoStatus.PENDING &&
      (info.owner.id === user?.userId || canPublish || canManage)) ||
    (info.status === InfoStatus.PUBLISHED && (canPublish || canManage));

  const canUnpublish =
    info.status === InfoStatus.PUBLISHED &&
    ((canContribute && info.owner.id === user?.userId) ||
      canPublish ||
      canManage);

  const canDelete = info.owner.id === user?.userId || canManage || canPublish;

  const classes = clsx({
    'text-center': md,
  });

  const badgeContent = () => (
    <div style={{ textAlign: 'right' }}>
      {info.status === 'DRAFT' && (
        <Badge className="bg-blue-200 text-blue">
          <Flex align="center" gap="8" wrap="nowrap" className="mx-4">
            {t('actualites.info.status.draft')}
            <IconSave />
          </Flex>
        </Badge>
      )}
      {canPublish && (
        <Button
          variant="outline"
          data-testid="info-card-header-validate-submit-button"
          leftIcon={isOwner ? <IconSend /> : <IconSubmitToValidate />}
          onClick={handleSubmitClick}
          color="secondary"
        >
          {isOwner
            ? t('actualites.info.actions.publish')
            : t('actualites.info.actions.validateAndPublish')}
        </Button>
      )}
      {!isExpired && extendedStatus === InfoExtendedStatus.INCOMING && (
        <Badge className="bg-purple-200 text-purple-500">
          <Flex align="center" gap="8" wrap="nowrap" className="mx-4">
            {t('actualites.info.status.incoming')}
            <IconClock />
          </Flex>
        </Badge>
      )}
      {isExpired && (
        <Badge className="bg-red-200 text-red-500">
          <Flex align="center" gap="8" wrap="nowrap" className="mx-4">
            {t('actualites.info.status.expired')}
            <IconClockAlert />
          </Flex>
        </Badge>
      )}
    </div>
  );

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
    <header key={info.id} className="mb-12">
      <div className="d-grid" style={styles}>
        <Flex align="center" justify="between">
          <InfoCardThreadHeader thread={thread} />
          {!lg && badgeContent()}
        </Flex>
        <h3 data-testid="info-name" className={classes}>
          {info?.title}
        </h3>
        {lg && badgeContent()}
      </div>

      <Flex className="flex-fill mt-12" align="center" wrap="nowrap" gap="16">
        {info.headline && (
          <Image
            src={iconHeadline}
            alt={t('actualites.info.alt.headline')}
            width={24}
            height={24}
          />
        )}
        <UserInfo info={info} />

        {info.headline && (
          <Image
            src={iconHeadline}
            style={{ rotate: '180deg' }}
            alt={t('actualites.info.alt.headline')}
            width={24}
            height={24}
          />
        )}
      </Flex>
      <div className="info-card-dropdown position-absolute top-0 end-0 z-2">
        <Dropdown
          placement="bottom-end"
          overflow
          onToggle={setDropDownVisible}
          noWrap
        >
          {(
            triggerProps: JSX.IntrinsicAttributes &
              Omit<IconButtonProps, 'ref'> &
              RefAttributes<HTMLButtonElement>,
          ) => (
            <>
              <IconButton
                {...triggerProps}
                aria-label={t('actualites.info.open.menu')}
                className={
                  'bg-white infocard-header-dropdown-button' +
                  (dropDownVisible ? ' is-active' : '')
                }
                color="primary"
                icon={<IconOptions />}
                variant="ghost"
                data-testid="info-card-header-dd-trigger"
              />
              <Dropdown.Menu>
                {canEdit && (
                  <Dropdown.Item
                    data-testid="info-card-header-edit-dd-item"
                    icon={<IconEdit />}
                    onClick={handleEditClick}
                  >
                    {common_t('edit')}
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
            </>
          )}
        </Dropdown>
      </div>

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
    </header>
  );
};
