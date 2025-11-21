import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';
import { defaultHandlers } from './handlers/default-handlers';
import { applyDelayMiddleware } from './middleware';

export const worker = setupWorker(
  ...applyDelayMiddleware(handlers),
  ...defaultHandlers,
);
