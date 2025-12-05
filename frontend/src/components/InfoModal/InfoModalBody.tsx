import {
  Avatar,
  Badge,
  Divider,
  Flex,
  Image,
  Modal,
  SeparatedInfo,
  useBreakpoint,
  useDate,
  useDirectory,
} from '@edifice.io/react';
import { Editor } from '@edifice.io/react/editor';
import { IconClockAlert, IconSave } from '@edifice.io/react/icons';
import clsx from 'clsx';
import iconHeadline from '~/assets/icon-headline.svg';
import { useI18n } from '~/hooks/useI18n';
import { useInfoStatus } from '~/hooks/useInfoStatus';
import { Info, InfoDetails } from '~/models/info';
import { CommentList } from '../comment-list/CommentList';
import { InfoCardThreadHeader } from '../InfoCard/InfoCardThreadHeader';

export type InfoModalBodyProps = {
  info: InfoDetails & Info;
};

export const InfoModalBody = ({ info }: InfoModalBodyProps) => {
  const { formatDate } = useDate();
  const { getAvatarURL } = useDirectory();
  const { t } = useI18n();
  const avatarUrl = getAvatarURL(info.owner.id, 'user');
  const { sm, md } = useBreakpoint();
  const { isExpired } = useInfoStatus(info);

  const { thread } = info;

  const classes = clsx({
    'text-center': md,
  });
  const iconSize = md ? 'sm' : 'xs';
  const styleBadge = md
    ? { textAlign: 'right' as const, minWidth: '150px' }
    : { minWidth: '150px' };

  return (
    <Modal.Body>
      <InfoCardThreadHeader thread={thread} />
      <h3 className={classes}>{info?.title}</h3>
      <div style={styleBadge}>
        {info.status === 'DRAFT' && (
          <Badge className="bg-blue-200 text-blue">
            <Flex align="center" gap="8" wrap="nowrap" className="mx-4">
              {t('actualites.info.status.draft')}
              <IconSave />
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

      <Flex className="flex-fill mt-12" align="center" wrap="nowrap" gap="16">
        {info.headline && !isExpired && (
          <Image
            src={iconHeadline}
            alt={t('actualites.info.alt.headline')}
            width={24}
            height={24}
          />
        )}
        {sm ? (
          <Divider color="var(--edifice-info-card-divider-color)">
            <Avatar
              alt={info.owner.displayName}
              src={avatarUrl}
              size={iconSize}
              variant="circle"
              loading="lazy"
            />
            {md ? (
              <SeparatedInfo className="fs-6 text-gray-700">
                <div>{info.owner.displayName}</div>
                <div>{formatDate(info.modified, 'long')}</div>
              </SeparatedInfo>
            ) : (
              <Flex direction="column" className="fs-6 text-gray-700">
                <div>{info.owner.displayName}</div>
                <div>{formatDate(info.modified, 'long')}</div>
              </Flex>
            )}
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
              <SeparatedInfo className="fs-6 text-gray-700">
                <div>{info.owner.displayName}</div>
                <div>{formatDate(info.modified, 'long')}</div>
              </SeparatedInfo>
            ) : (
              <Flex direction="column" className="fs-6 text-gray-700">
                <div>{info.owner.displayName}</div>
                <div>{formatDate(info.modified, 'long')}</div>
              </Flex>
            )}
          </Flex>
        )}

        {info.headline && !isExpired && (
          <Image
            src={iconHeadline}
            style={{ rotate: '180deg' }}
            alt={t('actualites.info.alt.headline')}
            width={24}
            height={24}
          />
        )}
      </Flex>
      {/*<InfoCardPreviousContent info={info} />*/}
      <Editor content={info.content} mode="read" variant="ghost" />
      <CommentList info={info} />
    </Modal.Body>
  );
};
