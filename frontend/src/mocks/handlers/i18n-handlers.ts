import { http, HttpResponse } from 'msw';
// Import translations from backend
import actualitesTranslations from '../../../../backend/src/main/resources/i18n/fr.json';
import portalTranslations from '../../../../../entcore/portal/backend/src/main/resources/i18n/fr.json';

/**
 * MSW Handlers for i18n endpoints
 * Mock i18n translations for local development
 */
export const i18nHandlers = [
  // Mock for common i18n endpoint
  http.get('/i18n', () => {
    // Return common translations (empty for now, add common translations if needed)
    return HttpResponse.json(portalTranslations);
  }),

  // Mock for actualites i18n endpoint
  http.get('/actualites/i18n', () => {
    return HttpResponse.json(actualitesTranslations);
  }),
];
