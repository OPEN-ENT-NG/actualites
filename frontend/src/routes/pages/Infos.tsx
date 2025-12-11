import { Button, Grid } from '@edifice.io/react';
import { QueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { matchPath, useLoaderData } from 'react-router-dom';
import { InfoList } from '~/components';
import { PortalModal } from '~/components/PortalModal';
import { InfoModalBody } from '~/features/info-modal/InfoModalBody';
import { ThreadList } from '~/features/thread-list/ThreadList';
import { useI18n } from '~/hooks/useI18n';
import { useScrollToElement } from '~/hooks/useScrollToElement';
import { InfoDetails } from '~/models/info';
import { baseUrl } from '~/services';
import { infoQueryOptions } from '~/services/queries';

export const loader = (queryClient: QueryClient) => async () => {
  const isPathToInfo = matchPath(`${baseUrl}/infos/:infoId`, location.pathname);

  if (isPathToInfo) {
    const infoId = Number(isPathToInfo.params.infoId);
    try {
      // Check if we have access to this info.
      const details = await queryClient.ensureQueryData(
        infoQueryOptions.getInfoById(infoId),
      );
      return { info: details };
    } catch {
      // Info is no more available.
    }
  }
  return { info: undefined };
};

export function Infos() {
  const { t, common_t } = useI18n();
  const { info } = useLoaderData() as {
    info?: InfoDetails;
  };

  const [isModalOpen, setModalOpen] = useState(true);

  // Check URL for any hash (HTML element ID) to scroll into view
  let { hash, removeHash, deferScrollIntoView } = useScrollToElement();
  if (hash) {
    deferScrollIntoView(hash);
  }

  const handleModalClose = () => {
    removeHash();
    setModalOpen(false);
  };

  return (
    <>
      <Grid className="gap-0">
        <ThreadList />
        <Grid.Col sm="12" lg="6" xl="9">
          <InfoList />
        </Grid.Col>
      </Grid>

      <PortalModal
        id="modal-info"
        onModalClose={handleModalClose}
        isOpen={isModalOpen}
        size={info ? 'lg' : 'sm'}
        header={info ? <></> : t('actualites.info.unavailable.title')}
        footer={<Button onClick={handleModalClose}>{common_t('close')}</Button>}
      >
        {info ? (
          <InfoModalBody info={{ threadId: info.thread.id, ...info }} />
        ) : (
          t('actualites.info.unavailable.body')
        )}
      </PortalModal>
    </>
  );
}
