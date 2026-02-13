import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { falcService } from '../api';

const useGenerateFalc = () =>
  useMutation({
    mutationFn: (content: string) => falcService.generate(content),
  });

export function useFalc() {
  const mutation = useGenerateFalc();
  const { t: common_t } = useTranslation();

  return {
    isGenerating: mutation.isPending,
    async generate(originalContent: string) {
      return new Promise<string>((resolve, reject) => {
        mutation.mutate(originalContent, {
          onSuccess: ({ content }: { content: string }) => resolve(content),
          onError: (error) => reject(common_t(error.message)),
        });
      });
    },
  };
}
