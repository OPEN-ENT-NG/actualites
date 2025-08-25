import { createInfoService } from './infoService';
import { createThreadService } from './threadService';

export const baseUrl = '/actualites';

export const threadService = createThreadService();
export const infoService = createInfoService();
