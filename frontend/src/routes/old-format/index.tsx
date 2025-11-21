import { useEffect } from 'react';

import { LoadingScreen, useEdificeTheme } from '@edifice.io/react';

import { useTranslation } from 'react-i18next';
import { LoaderFunctionArgs, useLoaderData } from 'react-router-dom';
import { useInfoOriginalFormat } from '~/services/queries';

interface OldFormatProps {
  threadId: number;
  infoId: number;
}

/** Loader to get threadId and infoId from params */
export const loader = async ({
  params,
}: LoaderFunctionArgs): Promise<OldFormatProps> => {
  const threadId = params['threadIdAsString']
    ? Number.parseInt(params['threadIdAsString'])
    : NaN;
  const infoId = params['infoIdAsString']
    ? Number.parseInt(params['infoIdAsString'])
    : NaN;
  if (isNaN(threadId) || isNaN(infoId)) {
    throw new Error('Invalid threadId or infoId');
  }
  return { threadId, infoId };
};

/** Get info content in previous format */
export const Component = () => {
  const { threadId, infoId } = useLoaderData() as OldFormatProps;
  const query = useInfoOriginalFormat(threadId, infoId);
  const { theme } = useEdificeTheme();
  const { t } = useTranslation('actualites'); // Do not replace by useI18n

  useEffect(() => {
    const link = document.getElementById('theme') as HTMLLinkElement;
    if (link) link.href = `${theme?.themeUrl}theme.css`;
  }, [theme?.themeUrl]);

  if (query.isPending) return <LoadingScreen />;

  const style = {
    margin: 'auto',
    padding: '16px',
    minHeight: '100vh',
    backgroundColor: '#fff',
  };

  const content = query.data?.content;

  return (
    <div
      style={style}
      contentEditable={false}
      dangerouslySetInnerHTML={{
        __html: content ?? `<p>${t('actualites.notfound.or.unauthorized')}</p>`,
      }}
    />
  );
};
