import { http, HttpResponse } from 'msw';
// @ts-ignore - Backend translation files only use for mock server
import actualitesTranslations from '../../../../backend/src/main/resources/i18n/fr.json';
// @ts-ignore - Backend translation files only use for mock server
// the "actualites" folder have to be next to the "entcore" folder to get the correct path
import portalTranslations from '../../../../../entcore/portal/backend/src/main/resources/i18n/fr.json';

export const i18nHandlers = [
  http.get('/i18n', () => {
    return HttpResponse.json(portalTranslations);
  }),

  http.get('/actualites/i18n', () => {
    return HttpResponse.json(actualitesTranslations);
  }),
];
