import { useState } from 'react';

export default function useInfoPrint() {
  const [isPrintAlertOpen, setPrintAlertOpen] = useState(false);

  return {
    isPrintAlertOpen,
    handlePrintAlertOpen: () => setPrintAlertOpen(true),
    handlePrintAlertClose: () => setPrintAlertOpen(false),
  };
}
