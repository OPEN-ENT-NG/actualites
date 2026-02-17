import { useMutation } from '@tanstack/react-query';
import { falcService } from '../api';

const useGenerateFalc = () =>
  useMutation({
    mutationFn: (content: string) => falcService.generate(content),
  });

export function useFalc() {
  const mutation = useGenerateFalc();

  return {
    isGenerating: mutation.isPending,
    async generate(originalContent: string): Promise<string> {
      const { content } = await mutation.mutateAsync(originalContent);
      return content;
    },
  };
}
