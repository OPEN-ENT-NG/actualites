import { http, HttpResponse } from 'msw';

import { baseUrl } from '~/services';

export const actualitesHandlers = [
  http.get(`${baseUrl}/i18n`, () => {
    return HttpResponse.json({}, { status: 200 });
  }),
  http.get('/i18n', () => {
    return HttpResponse.json({}, { status: 200 });
  }),
];
