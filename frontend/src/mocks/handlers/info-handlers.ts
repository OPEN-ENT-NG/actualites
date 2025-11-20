import { http, HttpResponse } from 'msw';
import { baseUrl, baseUrlAPI } from '~/services';
import { InfoExtendedStatus, InfoStatus } from '../../models/info';
import {
  mockInfoRevisions,
  mockInfosDraft,
  mockInfosExpired,
  mockInfoShare,
  mockInfosIncoming,
  mockInfosPublished,
  mockOriginalInfo,
} from '../datas/infos';

/**
 * MSW Handlers
 * Mock HTTP methods for info service
 */
export const infoHandlers = [
  // Get all infos
  http.get(`${baseUrlAPI}/infos`, ({ request }) => {
    const url = new URL(request.url);
    if (url.searchParams.get('state') === InfoExtendedStatus.EXPIRED) {
      return HttpResponse.json(mockInfosExpired, { status: 200 });
    }
    if (url.searchParams.get('state') === InfoExtendedStatus.INCOMING) {
      return HttpResponse.json(mockInfosIncoming, { status: 200 });
    }
    if (url.searchParams.get('status') === InfoStatus.DRAFT) {
      return HttpResponse.json(mockInfosDraft, { status: 200 });
    }
    return HttpResponse.json(mockInfosPublished, { status: 200 });
    // return HttpResponse.json([], { status: 200 }); // empty array to test empty screen
  }),

  // Create a draft info
  http.post<{ threadId: string }>(
    `${baseUrlAPI}/infos`,
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
  // Update an info or its status.
  http.put<{ threadId: string; infoId: string; action: string }>(
    `${baseUrlAPI}/infos/:infoId`,
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
  // Update an info or its status.
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
  // Delete an info
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
  // Get info's share
  http.get<{ threadId: string; infoId: string }>(
    `${baseUrl}/thread/:threadId/info/share/json/:infoId`,
    async () => HttpResponse.json(mockInfoShare, { status: 200 }),
  ),
  // Get info's revisions
  http.get<{ infoId: string }>(`${baseUrl}/info/:infoId/timeline`, async () =>
    HttpResponse.json(mockInfoRevisions, { status: 200 }),
  ),
  // Get original info
  http.get<{ threadId: string; infoId: string }>(
    `${baseUrl}/thread/:threadId/info/:infoId`,
    async ({ request }) => {
      const url = new URL(request.url);
      if (!url.searchParams.get('originalFormat')) {
        return new HttpResponse('Bad Request', { status: 400 });
      }
      return HttpResponse.json(mockOriginalInfo, { status: 200 });
    },
  ),
];
