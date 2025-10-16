import { http, HttpResponse } from 'msw';
import actualitesTranslations from '../../../../backend/src/main/resources/i18n/fr.json';
import portalTranslations from '../../../../../entcore/portal/backend/src/main/resources/i18n/fr.json';

export const i18nHandlers = [
  http.get('/i18n', () => {
    return HttpResponse.json(portalTranslations);
  }),

  http.get('/actualites/i18n', () => {
    return HttpResponse.json(actualitesTranslations);
  }),
];
