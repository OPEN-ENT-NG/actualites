import { odeServices } from '@edifice.io/client';
import { baseUrl } from '.';

export const createFalcService = () => {
  return {
    async generate(content: string) {
      const http = odeServices.http();

      try {
        const result = await http.post<{ content: string }>(`${baseUrl}/falc`, {
          content,
        });
        return result;
      } catch {
        if (http.isResponseError()) {
          const { status, headers, statusText } = http.latestResponse;

          // Map error objects
          if ('application/json' == headers?.['content-type']) {
            try {
              const message = JSON.parse(statusText);
              if (typeof message?.error == 'string') {
                return Promise.reject(new Error(message.error));
              }
            } catch {
              // Proceed with status codes
            }
          }

          // Map usual error codes
          switch (status) {
            case 403:
            case 408:
            case 500:
            case 504:
              return Promise.reject(new Error(`e${status}`));
            case 401:
            case 404:
              return Promise.reject(new Error(`e${status}.page`));
          }
        }
        return Promise.reject(new Error('Echec inconnu'));
      }
    },
  };
};
