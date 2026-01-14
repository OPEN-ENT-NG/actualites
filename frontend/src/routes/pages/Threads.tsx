import { Button, Grid } from '@edifice.io/react';
import { QueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useLoaderData } from 'react-router-dom';
import { InfoList } from '~/components';
import { PortalModal } from '~/components/PortalModal';
import { InfoModalBody } from '~/features/info-modal/InfoModalBody';
import { ThreadList } from '~/features/thread-list/ThreadList';
import { useHashScrolling } from '~/hooks/useHashScrolling';
import { useI18n } from '~/hooks/useI18n';
import { InfoDetails } from '~/models/info';
import { infoQueryOptions } from '~/services/queries';

export const loader = (queryClient: QueryClient) => async () => {
  // Parse URL to extract query parameter 'info'
  const urlParams = new URLSearchParams(location.search);
  const infoIdParam = urlParams.get('info');

  if (infoIdParam) {
    const infoId = Number(infoIdParam);
    if (!isNaN(infoId)) {
      try {
        // Check if we have access to this info.
        const details = await queryClient.ensureQueryData(
          infoQueryOptions.getInfoById(infoId),
        );
        return { info: details };
      } catch {
        // Info is no more available.
        return { info: false };
      }
    }
  }
  return { info: undefined };
};

export function Threads() {
  const { t, common_t } = useI18n();
  const { info } = useLoaderData() as {
    info: InfoDetails | false | undefined;
  };
  const { removeHash } = useHashScrolling();

  const [isModalOpen, setModalOpen] = useState(true);

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

      {
        /* Display details of the info=:infoId query param, if defined */
        info !== undefined && (
          <PortalModal
            id="modal-info"
            onModalClose={handleModalClose}
            isOpen={isModalOpen}
            size={info ? 'lg' : 'sm'}
            header={info ? <></> : t('actualites.info.unavailable.title')}
            footer={
              <Button onClick={handleModalClose}>{common_t('close')}</Button>
            }
          >
            {info ? (
              <InfoModalBody info={{ threadId: info.thread.id, ...info }} />
            ) : (
              t('actualites.info.unavailable.body')
            )}
          </PortalModal>
        )
      }
    </>
  );
}
