import { http, HttpResponse } from 'msw';
import { ThreadMode } from '~/models/thread';
import { baseUrlAPI } from '~/services';
import { mockThreads, mockThreadShare } from '../datas/threads';

/**
 * MSW Handlers
 * Mock HTTP methods for thread service
 */
export const threadHandlers = [
  // Get all threads
  http.get(`${baseUrlAPI}/threads`, () => {
    return HttpResponse.json(mockThreads, { status: 200 });
    // return HttpResponse.json([], { status: 200 });
  }),
  // Create a thread
  http.post<
    object,
    {
      mode: ThreadMode;
      title: string;
    }
  >(`${baseUrlAPI}/threads`, async () =>
    HttpResponse.json(
      {
        id: 3,
      },
      { status: 200 },
    ),
  ),
  // Update a thread
  http.put<
    { threadId: string },
    {
      mode: ThreadMode;
      title: string;
    }
  >(`${baseUrlAPI}/threads/:threadId`, async ({ request }) => {
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
  // Delete a thread
  http.delete<{ threadId: string }>(
    `${baseUrlAPI}/threads/:threadId`,
    async () =>
      HttpResponse.json(
        {
          rows: 1,
        },
        { status: 200 },
      ),
  ),
  // Get thread's share
  http.get<
    { threadId: string },
    {
      mode: ThreadMode;
      title: string;
    }
  >(`${baseUrlAPI}/threads/share/json/:threadId`, async () =>
    HttpResponse.json(mockThreadShare, { status: 200 }),
  ),
];
