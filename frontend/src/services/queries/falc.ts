import { useMutation } from '@tanstack/react-query';
import {
  DEFAULT_FALC_MIN_LENGTH,
  DEFAULT_FALC_TIMEOUT_MS,
} from '~/models/publicConf';
import { falcService } from '../api';
import { useConfig } from './config';

const useGenerateFalc = () =>
  useMutation({
    mutationFn: (content: string) => falcService.generate(content),
  });

export function useFalc() {
  const mutation = useGenerateFalc();
  const { data: conf } = useConfig();

  const configuration =
    typeof conf?.genai === 'object' &&
    typeof conf.genai.falcMinLength === 'number' &&
    typeof conf.genai.falcTimeoutMs === 'number'
      ? conf.genai
      : {
          falcMinLength: DEFAULT_FALC_MIN_LENGTH,
          falcTimeoutMs: DEFAULT_FALC_TIMEOUT_MS,
        };

  return {
    configuration,
    isGenerating: mutation.isPending,
    async generate(originalContent: string): Promise<string> {
      const { content } = await mutation.mutateAsync(originalContent);
      return content;
    },
  };
}
