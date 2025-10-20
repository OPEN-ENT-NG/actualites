import { createCommentService } from './commentService';
import { createInfoService } from './infoService';
import { createThreadService } from './threadService';

export const baseUrl = '/actualites';
export const baseUrlAPI = `${baseUrl}/api/v1`;

export const threadService = createThreadService();
export const infoService = createInfoService();
export const commentService = createCommentService();
