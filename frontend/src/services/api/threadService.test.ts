import { describe, expect, test } from 'vitest';
import { mockThreads, mockThreadShare } from '~/mocks';
import { threadService } from '.';
import { ThreadMode } from '../../models/thread';

describe('Thread GET Methods', () => {
  test('makes a GET request to get threads', async () => {
    const response = await threadService.getThreads();

    expect(response).toBeDefined();
    expect(response).toStrictEqual(mockThreads);
  });

  test('makes a GET request to get the shares of a thread', async () => {
    const response = await threadService.getShare(1);

    expect(response).toBeDefined();
    expect(response).toStrictEqual(mockThreadShare);
  });
});

describe('Thread Mutation Methods', () => {
  test('makes a POST request to create a new thread', async () => {
    const response = await threadService.create({
      mode: ThreadMode.SUBMIT,
      title: 'Un nouveau fil',
    });

    expect(response).toBeDefined();
  });

  test('makes a PUT request to rename a thread', async () => {
    const response = await threadService.update(1, {
      mode: ThreadMode.DIRECT,
      title: 'Test de renommage',
    });

    expect(response).toStrictEqual({
      rows: 1,
    });
  });

  test('makes a DELETE request to delete a thread and its infos', async () => {
    const response = await threadService.delete(1);

    expect(response).toStrictEqual({
      rows: 1,
    });
  });
});
