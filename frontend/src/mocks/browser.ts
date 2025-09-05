import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';
import { defaultHandlers } from './handlers/default-handlers';

export const worker = setupWorker(...handlers, ...defaultHandlers);
