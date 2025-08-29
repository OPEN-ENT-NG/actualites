import { http, HttpResponse } from 'msw';
import { baseUrl } from '~/services';
import { mockComments } from '..';

/**
 * MSW Handlers
 * Mock HTTP methods for comment service
 */
export const commentHandlers = [
  //// Get all comments about an info
  http.get(`${baseUrl}/infos/:infoId/comments`, () => {
    return HttpResponse.json(mockComments, { status: 200 });
  }),
  //// Create a comment
  http.put<{ threadId: string }>(
    `${baseUrl}/info/:infoId/comment`,
    async ({ request }) => {
      const payload = await request.json();
      if (!payload) {
        return HttpResponse.text('Bad Request', { status: 400 });
      }
      return HttpResponse.json(
        {
          id: 321,
        },
        { status: 200 },
      );
    },
  ),
  //// Update a comment.
  http.put<{ threadId: string; infoId: string; action: string }>(
    `${baseUrl}/api/v1/infos/:infoId/comments/:commentId`,
    async ({ request }) => {
      const payload = await request.json();
      if (!payload) {
        return HttpResponse.text('Bad Request', { status: 400 });
      }

      return HttpResponse.json(
        {
          rows: 1,
        },
        { status: 200 },
      );
    },
  ),
  //// Delete a comment
  http.delete<{ infoId: string; commentId: string }>(
    `${baseUrl}/info/:infoId/comment/:commentId`,
    async () =>
      HttpResponse.json(
        {
          rows: 1,
        },
        { status: 200 },
      ),
  ),
];
