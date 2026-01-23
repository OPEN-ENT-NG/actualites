import {
  Badge,
  Button,
  Dropdown,
  Flex,
  IconButton,
  IconButtonProps,
  Image,
  useBreakpoint,
} from '@edifice.io/react';
import {
  IconClock,
  IconClockAlert,
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
import { useInfoActionDropdown } from '~/hooks/useInfoActionDropdown';
import { useInfoPublishOrSubmit } from '~/hooks/useInfoPublishOrSubmit';
import { useInfoStatus } from '~/hooks/useInfoStatus';
import { InfoExtendedStatus, InfoStatus } from '~/models/info';
import { InfoCardProps } from './InfoCard';
import { InfoCardHeaderMenu } from './InfoCardHeaderMenu';
import { InfoCardThreadHeader } from './InfoCardThreadHeader';
import { InfoCardHeaderMetadata } from './UserInfo';

export type InfoCardHeaderVariant = 'default' | 'print';

export type InfoCardHeaderProps = Pick<InfoCardProps, 'info'> & {
  extendedStatus?: InfoExtendedStatus;
  variant?: InfoCardHeaderVariant;
};

export const InfoCardHeader = ({
  info,
  extendedStatus,
  variant = 'default',
}: InfoCardHeaderProps) => {
  const isPrint = variant === 'print';
  const [dropDownVisible, setDropDownVisible] = useState(false);
  const { isExpired, isDraft } = useInfoStatus(info);
  const { isOwner, thread, canPublish } = useInfoActionDropdown(info);

  const { publishOrSubmit } = useInfoPublishOrSubmit();

  const { t } = useI18n();
  const navigate = useNavigate();
  const { md, lg } = useBreakpoint();
  const styles = lg
    ? { gridTemplateColumns: '1fr auto 1fr' }
    : { gridTemplateColumns: '1fr' };

  const classes = clsx({
    'text-center': md,
  });

  const badgeContent = () => {
    if (isPrint) return null;

    return (
      <div className="text-end">
        {isDraft && (
          <Badge
            data-testid="info-card-badge-draft"
            className="bg-blue-200 text-blue"
          >
            <Flex align="center" gap="8" wrap="nowrap" className="mx-4">
              {t('actualites.info.status.draft')}
              <IconSave />
            </Flex>
          </Badge>
        )}
        {!isDraft && canPublish && (
          <Button
            variant="outline"
            data-testid={
              isOwner
                ? 'info-card-header-publish-button'
                : 'info-card-header-submit-button'
            }
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
          <Badge
            data-testid="info-card-badge-soon"
            className="bg-purple-200 text-purple-500"
          >
            <Flex align="center" gap="8" wrap="nowrap" className="mx-4">
              {t('actualites.info.status.incoming')}
              <IconClock />
            </Flex>
          </Badge>
        )}
        {isExpired && (
          <Badge
            data-testid="info-card-badge-expired"
            className="bg-red-200 text-red-500"
          >
            <Flex align="center" gap="8" wrap="nowrap" className="mx-4">
              {t('actualites.info.status.expired')}
              <IconClockAlert />
            </Flex>
          </Badge>
        )}
      </div>
    );
  };

  const handleSubmitClick = () => {
    if (thread) {
      if (isOwner) {
        publishOrSubmit({ ...info, thread: thread }, InfoStatus.PUBLISHED);
      } else {
        navigate(`/infos/${info.id}/publish`);
      }
    }
  };

  return (
    <header key={info.id} className="mb-12">
      <div className="d-grid gap-12" style={styles}>
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
        <InfoCardHeaderMetadata info={info} />

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
      {!isPrint && (
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

                <InfoCardHeaderMenu info={info} />
              </>
            )}
          </Dropdown>
        </div>
      )}
    </header>
  );
};
