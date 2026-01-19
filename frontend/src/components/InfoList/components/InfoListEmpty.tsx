import { EmptyScreen, Flex } from '@edifice.io/react';
// import { useTranslation } from 'react-i18next';

import illuEmptyCreate from '@images/emptyscreen/illu-blog.svg';
import illuSearch from '@images/emptyscreen/illu-search.svg';
import illuEmpty from '@images/emptyscreen/illu-timelinegenerator.svg';
// import illuEmptyDraft from '@images/emptyscreen/illu-search.svg';
import { useI18n } from '~/hooks/useI18n';

import { EmptyScreenType } from '../hooks/useInfoListEmptyScreen';

export function InfoListEmpty({ type }: { type: EmptyScreenType }) {
  const { t } = useI18n();
  return (
    <Flex direction="column" align="center" justify="center">
      {type === 'create-thread' && (
        <EmptyScreen
          imageSrc={illuEmptyCreate}
          imageAlt={t('actualites.infoList.empty.createThread.title')}
          title={t('actualites.infoList.empty.createThread.title')}
          text={t('actualites.infoList.empty.createThread.description')}
        />
      )}
      {type === 'create-info' && (
        <EmptyScreen
          imageSrc={illuEmptyCreate}
          imageAlt={t('actualites.infoList.empty.createInfo.title')}
          title={t('actualites.infoList.empty.createInfo.title')}
          text={t('actualites.infoList.empty.createInfo.description')}
        />
      )}
      {type === 'pending' && (
        <EmptyScreen
          imageSrc={illuSearch}
          imageAlt={t('actualites.infoList.empty.pending.title')}
          title={t('actualites.infoList.empty.pending.title')}
          text={t('actualites.infoList.empty.pending.description')}
        />
      )}
      {type === 'draft' && (
        <EmptyScreen
          imageSrc={illuSearch}
          imageAlt={t('actualites.infoList.empty.draft.title')}
          title={t('actualites.infoList.empty.draft.title')}
          text={t('actualites.infoList.empty.draft.description')}
        />
      )}
      {type === 'default' && (
        <EmptyScreen
          imageSrc={illuEmpty}
          imageAlt={t('actualites.infoList.empty.default.title')}
          title={t('actualites.infoList.empty.default.title')}
          text={t('actualites.infoList.empty.default.description')}
        />
      )}
    </Flex>
  );
}
