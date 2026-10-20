import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Plugin } from 'vite';

type ServeLocalI18nRoute = {
  routePath: string;
  filePath: string;
};

type ServeLocalI18nPluginOptions = {
  routes: ServeLocalI18nRoute[];
  rootDir?: string;
};

/**
 * Dev server only: serve local i18n files (instead of MSW), so tests never use them.
 * A missing file (ex: "entcore" not cloned next to "actualites") answers an empty bundle.
 */
export const serveLocalI18nPlugin = ({
  routes,
  rootDir,
}: ServeLocalI18nPluginOptions): Plugin => {
  return {
    name: 'serve-local-i18n',
    configureServer(server) {
      const baseDir = rootDir ?? server.config.root ?? process.cwd();
      const resolvedRoutes = routes.map(({ routePath, filePath }) => ({
        routePath,
        filePath: resolve(baseDir, filePath),
      }));

      server.middlewares.use((req, res, next) => {
        const pathname = req.url?.split('?')[0];
        const matchingRoute = resolvedRoutes.find(
          ({ routePath }) => pathname === routePath,
        );

        if (!matchingRoute) {
          next();
          return;
        }

        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        if (existsSync(matchingRoute.filePath)) {
          res.end(readFileSync(matchingRoute.filePath, 'utf-8'));
        } else {
          server.config.logger.warn(
            `[serve-local-i18n] ${matchingRoute.filePath} not found, serving empty translations for ${matchingRoute.routePath}`,
          );
          res.end('{}');
        }
      });
    },
  };
};
