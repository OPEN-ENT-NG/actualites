import { Flex, Image, useBreakpoint } from '@edifice.io/react';
import clsx from 'clsx';
import iconHeadline from '~/assets/icon-headline.svg';
import { useI18n } from '~/hooks/useI18n';
import { InfoCardProps } from './InfoCard';
import { InfoCardHeaderMetadata } from './UserInfo';
import { InfoCardThreadHeader } from './InfoCardThreadHeader';
import { Thread } from '~/models/thread';

export type InfoCardHeaderPrintProps = Pick<InfoCardProps, 'info'> & {
  thread?: Thread;
};

export const InfoCardHeaderPrint = ({
  info,
  thread,
}: InfoCardHeaderPrintProps) => {
  const { t } = useI18n();
  const { md, lg } = useBreakpoint();
  const styles = lg
    ? { gridTemplateColumns: '1fr auto 1fr', gap: '12px' }
    : { gridTemplateColumns: '1fr', gap: '12px' };

  const classes = clsx({
    'text-center': md,
  });

  return (
    <header key={info.id} className="mb-12">
      <div className="d-grid" style={styles}>
        <Flex align="center" justify="between">
          <InfoCardThreadHeader thread={thread} />
        </Flex>
        <h3 data-testid="info-name" className={classes}>
          {info?.title}
        </h3>
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
    </header>
  );
};
