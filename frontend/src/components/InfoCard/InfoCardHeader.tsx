import {
  Avatar,
  Divider,
  Flex,
  Image,
  SeparatedInfo,
  useBreakpoint,
  useDate,
  useDirectory,
} from '@edifice.io/react';
import iconHeadline from '~/assets/icon-headline.svg';
import { useThread } from '~/features/threads/useThread';
import { InfoCardProps } from './InfoCard';
import { InfoCardThreadHeader } from './InfoCardThreadHeader';

export const InfoCardHeader = ({ info }: Pick<InfoCardProps, 'info'>) => {
  const { formatDate } = useDate();
  const thread = useThread(info.threadId);
  const { getAvatarURL } = useDirectory();
  const avatarUrl = getAvatarURL(info.owner.id, 'user');

  const { md } = useBreakpoint();
  const styles = md
    ? { gridTemplateColumns: '1fr auto 1fr', gap: '12px' }
    : { gridTemplateColumns: '1fr', gap: '12px' };

  const classes = md ? 'text-center' : '';
  const iconSize = md ? 'sm' : 'xs';

  const dividerColor = info.headline
    ? 'var(--edifice-yellow)'
    : 'var(--edifice-info-card-state-color)';

  return (
    <header key={info.id} className="mb-12">
      <div className="d-grid" style={styles}>
        <InfoCardThreadHeader thread={thread} />
        <h3 className={`text-truncate text-truncate-2 ${classes}`}>
          {info?.title}
        </h3>
        <div style={{ textAlign: 'right', minWidth: '150px' }}>
          {/* Ajouter le badge nouveau */}
        </div>
      </div>

      <Flex className="flex-fill mt-12" align="center" wrap="nowrap" gap="16">
        {info.headline && (
          <Image
            src={iconHeadline}
            alt="Headline Icon"
            width={24}
            height={24}
          />
        )}
        <Divider color={dividerColor}>
          <Avatar
            alt={info.owner.displayName}
            src={avatarUrl}
            size={iconSize}
            variant="circle"
            loading="lazy"
          />
          <SeparatedInfo className="fs-6">
            <div>{info.owner.displayName}</div>
            <div>{formatDate(info.modified, 'long')}</div>
          </SeparatedInfo>
        </Divider>
        {info.headline && (
          <Image
            src={iconHeadline}
            style={{ rotate: '180deg' }}
            alt="Headline Icon"
            width={24}
            height={24}
          />
        )}
      </Flex>
    </header>
  );
};
