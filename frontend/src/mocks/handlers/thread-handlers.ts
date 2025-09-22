import { http, HttpResponse } from 'msw';
import { ThreadMode } from '~/models/thread';
import { baseUrl } from '~/services';
import { mockThreads, mockThreadShare } from '../datas/threads';

/**
 * MSW Handlers
 * Mock HTTP methods for thread service
 */
export const threadHandlers = [
  //// Get all threads
  http.get(`${baseUrl}/threads`, () => {
    return HttpResponse.json(mockThreads, { status: 200 });
  }),
  //// Create a thread
  http.post<
    object,
    {
      mode: ThreadMode;
      title: string;
    }
  >(`${baseUrl}/thread`, async () =>
    HttpResponse.json(
      {
        id: 3,
      },
      { status: 200 },
    ),
  ),
  //// Update a thread
  http.put<
    { threadId: string },
    {
      mode: ThreadMode;
      title: string;
    }
  >(`${baseUrl}/thread/:threadId`, async ({ request }) => {
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
  }),
  //// Delete a thread
  http.delete<{ threadId: string }>(`${baseUrl}/thread/:threadId`, async () =>
    HttpResponse.json(
      {
        rows: 1,
      },
      { status: 200 },
    ),
  ),
  //// Get thread's share
  http.get<
    { threadId: string },
    {
      mode: ThreadMode;
      title: string;
    }
  >(`${baseUrl}/thread/share/json/:threadId`, async () =>
    HttpResponse.json(mockThreadShare, { status: 200 }),
  ),
];
