import {
  Avatar,
  useBreakpoint,
  useDate,
  useDirectory,
} from '@edifice.io/react';
import { useThread } from '~/features/threads/useThread';
import { Divider } from '../Divider';
import { SeparatedInfo } from '../SeparatedInfo';
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

  return (
    <header className="mb-12">
      <div className="d-grid" style={styles}>
        <InfoCardThreadHeader thread={thread} textGray="700" />
        <h3 className={`text-truncate text-truncate-2 ${classes}`}>
          {info?.title}
        </h3>
        <div style={{ textAlign: 'right', minWidth: '150px' }}>
          {/* Ajouter le badge nouveau */}
        </div>
      </div>

      <Divider color="red">
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
    </header>
  );
};
