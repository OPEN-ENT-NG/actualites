import { EmptyScreen, Flex } from '@edifice.io/react';
// import { useTranslation } from 'react-i18next';

import illuEmptyCreate from '@images/emptyscreen/illu-blog.svg';
import illuEmpty from '@images/emptyscreen/illu-timelinegenerator.svg';
// import illuEmptyDraft from '@images/emptyscreen/illu-search.svg';
import { useI18n } from '~/hooks/useI18n';

import { useInfoListEmptyScreen } from '../hooks/useInfoListEmptyScreen';

export function InfoListEmpty() {
  const { t } = useI18n();
  const emptyScreenType = useInfoListEmptyScreen();
  return (
    <Flex direction="column" align="center" justify="center">
      {emptyScreenType === 'create-thread' && (
        <EmptyScreen
          imageSrc={illuEmptyCreate}
          imageAlt={t('actualites.info-list.empty.create-thread.title')}
          title={t('actualites.info-list.empty.create-thread.title')}
          text={t('actualites.info-list.empty.create-thread.text')}
        />
      )}
      {emptyScreenType === 'create-info' && (
        <EmptyScreen
          imageSrc={illuEmptyCreate}
          imageAlt={t('actualites.info-list.empty.create-info.title')}
          title={t('actualites.info-list.empty.create-info.title')}
          text={t('actualites.info-list.empty.create-info.text')}
        />
      )}
      {emptyScreenType === 'default' && (
        <EmptyScreen
          imageSrc={illuEmpty}
          imageAlt={t('actualites.info-list.empty.default.title')}
          title={t('actualites.info-list.empty.default.title')}
          text={t('actualites.info-list.empty.default.text')}
        />
      )}
    </Flex>
  );
}
