import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { falcService } from '../api';
import { GenAiConf } from '../api/falcService';

const useGenerateFalc = () =>
  useMutation({
    mutationFn: (content: string) => falcService.generate(content),
  });

export function useFalc() {
  const mutation = useGenerateFalc();
  const [configuration, setConfiguration] = useState<GenAiConf>();

  // Load FALC configuration
  useEffect(() => {
    (async () => {
      const configuration = await falcService.getConfiguration();
      setConfiguration(configuration);
    })();
  }, []);

  return {
    configuration,
    isGenerating: mutation.isPending,
    async generate(originalContent: string): Promise<string> {
      const { content } = await mutation.mutateAsync(originalContent);
      return content;
    },
  };
}
