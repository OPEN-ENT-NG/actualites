import { HttpResponse, http } from 'msw';

/**
 * Overrides `/assets/theme-conf.js` from `default-handlers.ts` (DO NOT
 * MODIFY) to inject `uiOverrides` — lets local dev (`pnpm dev:mock`)
 * exercise the `edifice-in-product` HelpZone rollout flag on `Layout`
 * (`@edifice.io/react`'s `Layout.tsx`, gated via `useUiOverride`).
 *
 * Only wired into the browser worker (`browser.ts`), not `server.ts`, so it
 * doesn't affect the vitest suite — this is a manual testing aid.
 *
 * `uiOverrides` is added to the `child: 'cg771d'` entry only, since that's
 * the one `/theme`'s `themeName: 'cg771d'` (default-handlers.ts) actually
 * resolves to (`overriding.find(e => e.child === theme.themeName)`).
 */
export const uiOverridesHandlers = [
  http.get('/assets/theme-conf.js', () => {
    const theme = {
      overriding: [
        {
          parent: 'theme-open-ent',
          child: 'cg77',
          skins: ['default', 'dyslexic'],
          help: '/help-2d',
          bootstrapVersion: 'ode-bootstrap-neo',
          edumedia: {
            uri: 'https://www.edumedia-sciences.com',
            pattern: 'uai-token-hash-[[uai]]',
            ignoreSubjects: ['n-92', 'n-93'],
          },
          npmTheme: 'neoconnect',
        },
        {
          parent: 'panda',
          child: 'cg771d',
          skins: [
            'circus',
            'desert',
            'neutre',
            'ocean',
            'panda-food',
            'sparkly',
            'default',
            'monthly',
          ],
          help: '/help-1d',
          bootstrapVersion: 'ode-bootstrap-one',
          edumedia: {
            uri: 'https://junior.edumedia-sciences.com',
            pattern: 'uai-token-hash-[[uai]]',
          },
          npmTheme: 'oneconnect',
          uiOverrides: {
            'edifice-in-product': false,
          },
        },
      ],
    };

    return HttpResponse.json(theme);
  }),
];
