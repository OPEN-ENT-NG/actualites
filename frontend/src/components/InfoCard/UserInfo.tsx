import {
  Avatar,
  Divider,
  Flex,
  useBreakpoint,
  useDate,
  useDirectory,
} from '@edifice.io/react';
import { useInfoStatus } from '~/hooks/useInfoStatus';
import { Info } from '~/models/info';

export const InfoCardHeaderMetadata = ({ info }: { info: Info }) => {
  const { formatDate } = useDate();

  const { isDraft } = useInfoStatus(info);
  const { getAvatarURL } = useDirectory();
  const avatarUrl = getAvatarURL(info.owner.id, 'user');
  const { sm, md } = useBreakpoint();

  const iconSize = md ? 'sm' : 'xs';

  const infoDate = isDraft
    ? info.modified
    : info.publicationDate || info.modified;

  const AvatarComponent = () => (
    <Avatar
      alt={info.owner.displayName}
      src={avatarUrl}
      size={iconSize}
      variant="circle"
      loading="lazy"
    />
  );

  const UserInfoContent = () =>
    md ? (
      <Flex align="center" className="fs-6 text-gray-700" wrap="nowrap">
        <div data-testid="info-owner-name">{info.owner.displayName}</div>
        <Divider vertical className="border-gray-700" />
        <div data-testid="info-date">{formatDate(infoDate, 'long')}</div>
      </Flex>
    ) : (
      <Flex direction="column" className="fs-6 text-gray-700" wrap="nowrap">
        <div data-testid="info-owner-name">{info.owner.displayName}</div>
        <div data-testid="info-date">{formatDate(infoDate, 'long')}</div>
      </Flex>
    );

  const UserInfoContentContainer = () => (
    <Flex align="center" gap="8" justify="center" fill wrap="nowrap">
      {<AvatarComponent />}
      {<UserInfoContent />}
    </Flex>
  );

  return sm ? (
    <Divider className="info-divider m-0" style={{ minWidth: 0 }}>
      {<UserInfoContentContainer />}
    </Divider>
  ) : (
    <UserInfoContentContainer />
  );
};
