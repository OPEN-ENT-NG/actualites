import { commentHandlers } from './handlers/comment-handlers';
import { falcHandlers } from './handlers/falc-handlers';
import { i18nHandlers } from './handlers/i18n-handlers';
import { infoHandlers } from './handlers/info-handlers';
import { threadHandlers } from './handlers/thread-handlers';

export const handlers = [
  ...i18nHandlers,
  ...threadHandlers,
  ...infoHandlers,
  ...commentHandlers,
  ...falcHandlers,
];
