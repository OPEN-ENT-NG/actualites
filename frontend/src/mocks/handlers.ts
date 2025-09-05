import { commentHandlers } from './handlers/comment-handlers';
import { infoHandlers } from './handlers/info-handlers';
import { threadHandlers } from './handlers/thread-handlers';

export const handlers = [
  ...threadHandlers,
  ...infoHandlers,
  ...commentHandlers,
];
