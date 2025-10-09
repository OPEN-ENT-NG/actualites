import { renderHook, waitFor } from '@testing-library/react';
import {
  mockThreadAsCatherine,
  mockThreadAsCatherineWithContributeRight,
  mockThreadAsOwner,
} from '~/mocks/datas/threads';
import { mockUserLogged } from '~/mocks/datas/users';
import { wrapper } from '~/mocks/setup';
import { queryClient } from '~/providers';
import { threadService } from '~/services/api';
import { useThreadsUserRights } from './useThreadsUserRights';

const mocks = vi.hoisted(() => ({
  useUser: vi.fn(),
}));

vi.mock('@edifice.io/react', async () => {
  const actual =
    await vi.importActual<typeof import('@edifice.io/react')>(
      '@edifice.io/react',
    );
  return {
    ...actual,
    useUser: mocks.useUser,
  };
});

describe('useThreadsUserRights', () => {
  beforeEach(() => {
    mocks.useUser.mockReturnValue({ user: mockUserLogged });
  });

  afterEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  test.each([
    {
      description:
        'should return canContributeOnOneThread as true when user is owner of a thread',
      threads: [mockThreadAsOwner],
      expected: true,
    },
    {
      description:
        'should return canContributeOnOneThread as false when an other user is owner of a thread',
      threads: [mockThreadAsCatherine],
      expected: false,
    },
    {
      description:
        'should return canContributeOnOneThread as true when not owner but have contribute right on a thread',
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

    await waitFor(() => {
      expect(result.current.canContributeOnOneThread).toBe(expected);
    });

    expect(serviceSpy).toHaveBeenCalled();
  });
});
