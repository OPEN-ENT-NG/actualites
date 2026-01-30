import { http, HttpResponse } from 'msw';
import { baseUrlAPI } from '~/services';
import { falcContent, mockInfoLongContentDraft } from '../datas/falc';

/**
 * MSW Handlers
 * Mock HTTP methods for FALC service
 */
export const falcHandlers = [
  http.get(`${baseUrlAPI}/infos/:infoId`, () => {
    return HttpResponse.json(mockInfoLongContentDraft, { status: 200 });
  }),

  http.post<{ content: string }>(`${baseUrlAPI}/falc`, async ({ request }) => {
    const payload = await request.json();
    if (!payload) {
      return HttpResponse.text('Bad Request', { status: 400 });
    }
    return HttpResponse.json(falcContent);
  }),
];
