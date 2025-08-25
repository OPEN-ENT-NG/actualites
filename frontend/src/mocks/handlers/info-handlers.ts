import { http, HttpResponse } from 'msw';
import { baseUrl } from '~/services';
import { mockInfoRevisions, mockInfos, mockInfoShare } from '..';

/**
 * MSW Handlers
 * Mock HTTP methods for info service
 */
export const infoHandlers = [
  //// Get all infos
  http.get(`${baseUrl}/list`, () => {
    return HttpResponse.json(mockInfos, { status: 200 });
  }),
  //// Create a draft info
  http.post<{ threadId: string }>(
    `${baseUrl}/thread/:threadId/info`,
    async ({ request }) => {
      const payload = await request.json();
      if (!payload) {
        return HttpResponse.text('Bad Request', { status: 400 });
      }
      return HttpResponse.json(
        {
          id: 1,
        },
        { status: 200 },
      );
    },
  ),
  //// Update an info or its status.
  http.put<{ threadId: string; infoId: string; action: string }>(
    `${baseUrl}/thread/:threadId/info/:infoId/:action`,
    async ({ params }) => {
      const { action } = params;
      const availableActions = [
        'draft',
        'pending',
        'published',
        'submit',
        'unsubmit',
        'publish',
      ];
      if (availableActions.findIndex((a) => a === action) === -1) {
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
  //// Delete an info
  http.delete<{ threadId: string; infoId: string }>(
    `${baseUrl}/thread/:threadId/info/:infoId`,
    async () =>
      HttpResponse.json(
        {
          rows: 1,
        },
        { status: 200 },
      ),
  ),
  //// Get info's share
  http.get<{ threadId: string; infoId: string }>(
    `${baseUrl}/thread/:threadId/info/share/json/:infoId`,
    async () => HttpResponse.json(mockInfoShare, { status: 200 }),
  ),
  //// Get info's revisions
  http.get<{ infoId: string }>(`${baseUrl}/info/:infoId/timeline`, async () =>
    HttpResponse.json(mockInfoRevisions, { status: 200 }),
  ),
];
