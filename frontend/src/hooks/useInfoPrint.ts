import { useState } from 'react';
import { Info } from '~/models/info';

export default function useInfoPrint() {
  const [isPrintAlertOpen, setPrintAlertOpen] = useState(false);

  const print = (info: Info, withComments: boolean) => {
    window.open(
      `/infos/${info.id}/print${withComments ? '?withComments=true' : ''}`,
      '_blank',
    );
  };

  return {
    print,
    isPrintAlertOpen,
    handlePrintAlertOpen: () => setPrintAlertOpen(true),
    handlePrintAlertClose: () => setPrintAlertOpen(false),
  };
}
