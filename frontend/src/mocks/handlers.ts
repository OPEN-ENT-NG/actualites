import { actualitesHandlers } from './handlers/actualites-handlers';
import { commentHandlers } from './handlers/comment-handlers';
import { infoHandlers } from './handlers/info-handlers';
import { threadHandlers } from './handlers/thread-handlers';

export const handlers = [
  ...actualitesHandlers,
  ...threadHandlers,
  ...infoHandlers,
  ...commentHandlers,
];
