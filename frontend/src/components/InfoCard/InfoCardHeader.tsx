import {
  Badge,
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
  IconEdit,
  IconOptions,
  IconSave,
  IconSubmitToValidate,
} from '@edifice.io/react/icons';
import clsx from 'clsx';
import { RefAttributes, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import iconHeadline from '~/assets/icon-headline.svg';
import { useI18n } from '~/hooks/useI18n';
import { useInfoPublishOrSubmit } from '~/hooks/useInfoPublishOrSubmit';
import { useInfoStatus } from '~/hooks/useInfoStatus';
import { useThread } from '~/hooks/useThread';
import { getThreadUserRights } from '~/hooks/utils/threads';
import { InfoExtendedStatus, InfoStatus } from '~/models/info';
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

  const { handlePublish } = useInfoPublishOrSubmit();
  const { user } = useUser();

  const threadRights = getThreadUserRights(thread, user?.userId || '');

  const { t, common_t } = useI18n();
  const navigate = useNavigate();
  const { md, lg } = useBreakpoint();
  const styles = lg
    ? { gridTemplateColumns: '1fr auto 1fr', gap: '12px' }
    : { gridTemplateColumns: '1fr', gap: '12px' };

  const classes = clsx({
    'text-center': md,
  });

  const handleEditClick = () => {
    navigate(`/threads/${info.threadId}/infos/${info.id}/edit`);
  };

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

  const handleSubmit = () => {
    if (!thread) {
      return;
    }
    handlePublish({ ...info, thread: thread }, threadRights.canPublish);
  };

  const canEdit =
    (info.status === InfoStatus.DRAFT && info.owner.id === user?.userId) ||
    (info.status === InfoStatus.PENDING &&
      (info.owner.id === user?.userId ||
        threadRights.canPublish ||
        threadRights.canManage)) ||
    (info.status === InfoStatus.PUBLISHED &&
      (threadRights.canPublish || threadRights.canManage));

  return (
    <header key={info.id} className="mb-12">
      <div className="d-grid" style={styles}>
        <Flex align="center" justify="between">
          <InfoCardThreadHeader thread={thread} />
          {!lg && badgeContent()}
        </Flex>
        <h3 className={classes}>{info?.title}</h3>
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
      <div className="info-card-dropdown position-absolute top-0 end-0 z-3">
        <Dropdown placement="bottom-end" overflow onToggle={setDropDownVisible}>
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
              />
              <Dropdown.Menu>
                {canEdit && (
                  <Dropdown.Item icon={<IconEdit />} onClick={handleEditClick}>
                    {common_t('edit')}
                  </Dropdown.Item>
                )}
                <Dropdown.Item
                  icon={<IconEdit />}
                  onClick={() => alert('copy')}
                >
                  {t('common.copy')}
                </Dropdown.Item>
                {info.status === InfoStatus.DRAFT &&
                  threadRights.canContribute &&
                  !threadRights.canPublish && (
                    <Dropdown.Item
                      icon={<IconSubmitToValidate />}
                      onClick={handleSubmit}
                    >
                      {t('actualites.info.actions.submitToValidation')}
                    </Dropdown.Item>
                  )}
              </Dropdown.Menu>
            </>
          )}
        </Dropdown>
      </div>
    </header>
  );
};
