import { renderHook, waitFor } from '@testing-library/react';
import {
  mockThreadAsCatherine,
  mockThreadAsCatherineWithContributeRight,
  mockThreadAsOwner,
} from '~/mocks/datas/threads';
import { wrapper } from '~/mocks/setup';
import { queryClient } from '~/providers';
import { threadService } from '~/services/api';
import { useThreadsUserRights } from './useThreadsUserRights';

describe('useThreadsUserRights', () => {
  afterEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  test.each([
    {
      description: 'returns false when user cannot contribute on any thread',
      threads: [mockThreadAsCatherine],
      expected: false,
    },
    {
      description: 'returns true when user can manage on at least one thread',
      threads: [mockThreadAsCatherine, mockThreadAsOwner],
      expected: true,
    },
    {
      description:
        'returns true when user can contribute on at least one thread ',
      threads: [mockThreadAsCatherineWithContributeRight],
      expected: true,
    },
  ])('$description', async ({ threads, expected }) => {
    const serviceSpy = vi
      .spyOn(threadService, 'getThreads')
      .mockResolvedValue(threads);
    const { result } = renderHook(() => useThreadsUserRights(), {
      wrapper,
    });
    expect(result.current.isReady).toBe(false);
    await waitFor(() => {
      expect(result.current.canContributeOnOneThread).toBe(expected);
      expect(result.current.isReady).toBe(true);
    });

    expect(serviceSpy).toHaveBeenCalled();
  });
});
