import { commentHandlers } from './handlers/comment-handlers';
import { falcHandlers } from './handlers/falc-handlers';
import { infoHandlers } from './handlers/info-handlers';
import { threadHandlers } from './handlers/thread-handlers';

export const handlers = [
  ...threadHandlers,
  ...infoHandlers,
  ...commentHandlers,
  ...falcHandlers,
];
