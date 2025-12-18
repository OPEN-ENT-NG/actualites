import {
  Avatar,
  Badge,
  Divider,
  Dropdown,
  Flex,
  IconButton,
  IconButtonProps,
  Image,
  useBreakpoint,
  useDate,
  useDirectory,
} from '@edifice.io/react';
import {
  IconClock,
  IconClockAlert,
  IconEdit,
  IconOptions,
  IconSave,
} from '@edifice.io/react/icons';
import clsx from 'clsx';
import iconHeadline from '~/assets/icon-headline.svg';
import { useI18n } from '~/hooks/useI18n';
import { useThread } from '~/hooks/useThread';
import { InfoExtendedStatus } from '~/models/info';
import { InfoCardProps } from './InfoCard';
import { InfoCardThreadHeader } from './InfoCardThreadHeader';
import { RefAttributes, useState } from 'react';

export type InfoCardHeaderProps = Pick<InfoCardProps, 'info'> & {
  extendedStatus?: InfoExtendedStatus;
};

export const InfoCardHeader = ({
  info,
  extendedStatus,
}: InfoCardHeaderProps) => {
  const { formatDate } = useDate();
  const thread = useThread(info.threadId);

  const [dropDownVisible, setDropDownVisible] = useState(false);
  const { getAvatarURL } = useDirectory();
  const { t } = useI18n();
  const avatarUrl = getAvatarURL(info.owner.id, 'user');
  const { sm, md, lg } = useBreakpoint();
  const styles = lg
    ? { gridTemplateColumns: '1fr auto 1fr', gap: '12px' }
    : { gridTemplateColumns: '1fr', gap: '12px' };

  const classes = clsx({
    'text-center': md,
  });
  const iconSize = md ? 'sm' : 'xs';

  const isExpired = extendedStatus === InfoExtendedStatus.EXPIRED;

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
        {sm ? (
          <Divider className="info-divider m-0" style={{ minWidth: 0 }}>
            <Flex align="center" gap="8" justify="center" fill wrap="nowrap">
              <Avatar
                alt={info.owner.displayName}
                src={avatarUrl}
                size={iconSize}
                variant="circle"
                loading="lazy"
              />
              {md ? (
                <Flex
                  align="center"
                  className="fs-6 text-gray-700"
                  wrap="nowrap"
                >
                  <div>{info.owner.displayName}</div>
                  <Divider vertical className="border-gray-700" />
                  <div>{formatDate(info.modified, 'long')}</div>
                </Flex>
              ) : (
                <Flex
                  direction="column"
                  className="fs-6 text-gray-700"
                  wrap="nowrap"
                >
                  <div>{info.owner.displayName}</div>
                  <div>{formatDate(info.modified, 'long')}</div>
                </Flex>
              )}
            </Flex>
          </Divider>
        ) : (
          <Flex align="center" gap="8" justify="center" fill>
            <Avatar
              alt={info.owner.displayName}
              src={avatarUrl}
              size={iconSize}
              variant="circle"
              loading="lazy"
            />
            {md ? (
              <Flex align="center" className="fs-6 text-gray-700">
                <div>{info.owner.displayName}</div>
                <Divider vertical className="border-gray-700" />
                <div>{formatDate(info.modified, 'long')}</div>
              </Flex>
            ) : (
              <Flex direction="column" className="fs-6 text-gray-700">
                <div>{info.owner.displayName}</div>
                <div>{formatDate(info.modified, 'long')}</div>
              </Flex>
            )}
          </Flex>
        )}

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
                <Dropdown.Item
                  icon={<IconEdit />}
                  onClick={() => alert('edit')}
                >
                  {t('common.edit')}
                </Dropdown.Item>
                <Dropdown.Item
                  icon={<IconEdit />}
                  onClick={() => alert('copy')}
                >
                  {t('common.copy')}
                </Dropdown.Item>
              </Dropdown.Menu>
            </>
          )}
        </Dropdown>
      </div>
    </header>
  );
};
