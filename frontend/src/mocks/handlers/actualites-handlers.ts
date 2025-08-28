import { http, HttpResponse } from 'msw';

export const actualitesHandlers = [
  http.get('/actualites/i18n', () => {
    return HttpResponse.json({}, { status: 200 });
  }),
];
