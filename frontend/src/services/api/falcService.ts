import { ERROR_CODE, odeServices } from '@edifice.io/client';
import { baseUrlAPI } from '.';

export const createFalcService = () => {
  return {
    async generate(content: string) {
      const http = odeServices.http();

      try {
        const result = await http.post<{ content: string }>(
          `${baseUrlAPI}/falc`,
          {
            content,
          },
        );
        return result;
      } catch {
        if (http.isResponseError()) {
          const { status, statusText } = http.latestResponse;
          console.log(`FALC service error text: ${statusText}`);

          if (status === 408 || status === 504) {
            return Promise.reject(ERROR_CODE.TIME_OUT);
          }
        }
        return Promise.reject(ERROR_CODE.NOT_INITIALIZED);
      }
    },
  };
};
