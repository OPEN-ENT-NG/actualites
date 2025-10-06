import { Flex } from '@edifice.io/react';
// import { useTranslation } from 'react-i18next';

// import illuCreateThread from '@images/emptyscreen/info-list-create-thread.svg';

import { useRights } from '~/hooks/useRights';

export function InfoListEmpty() {
  // const { appCode } = useEdificeClient();
  // const { t } = useTranslation(appCode);
  const rights = useRights();

  return (
    <Flex direction="column" align="center" justify="center">
      {rights.canCreateThread && (
        <div>no data</div>
        // <EmptyScreen
        //   imageSrc={illuCreateThread}
        //   imageAlt={t('actualites.info-list.empty.create-thread.title')}
        //   title={t('actualites.info-list.empty.create-thread.title')}
        //   text={t('actualites.info-list.empty.create-thread.text')}
        // />
      )}
    </Flex>
  );
}
