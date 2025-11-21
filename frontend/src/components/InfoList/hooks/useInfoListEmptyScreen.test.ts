import { renderHook } from '@testing-library/react';
import { mockUserLogged } from '~/mocks/datas/users';
import { wrapper } from '~/mocks/setup';
import { useInfoListEmptyScreen } from './useInfoListEmptyScreen';
import {
  mockThreadAsCatherine,
  mockThreadAsCatherineWithContributeRight,
  mockThreadAsOwner,
  mockThreads,
} from '~/mocks/datas/threads';

const mocks = vi.hoisted(() => ({
  useUser: vi.fn(),
  useThreads: vi.fn(),
  useThreadsUserRights: vi.fn(),
  useUserRights: vi.fn(),
  useThreadInfoParams: vi.fn(),
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

vi.mock('~/services/queries', () => ({
  useThreads: mocks.useThreads,
}));

vi.mock('~/hooks/useThreadsUserRights', () => ({
  useThreadsUserRights: mocks.useThreadsUserRights,
}));

vi.mock('~/hooks/useThreadInfoParams', () => ({
  useThreadInfoParams: mocks.useThreadInfoParams,
}));

vi.mock('~/hooks/useUserRights', () => ({
  useUserRights: mocks.useUserRights,
}));

describe('useInfoListEmptyScreen', () => {
  beforeEach(() => {
    mocks.useUser.mockReturnValue({ user: mockUserLogged });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return default when no rights and not ready', () => {
    mocks.useThreadInfoParams.mockReturnValue({ threadId: undefined });
    mocks.useThreads.mockReturnValue({ data: undefined, isSuccess: false });
    mocks.useThreadsUserRights.mockReturnValue({
      canContributeOnOneThread: undefined,
      isReady: false,
    });
    mocks.useUserRights.mockReturnValue({ canCreateThread: false });

    const { result } = renderHook(() => useInfoListEmptyScreen(), { wrapper });

    expect(result.current).toEqual({ type: 'default', isReady: false });
  });

  test.each([
    //filter on all threads (path: root/)
    {
      description:
        'should return create-thread when have no threads and can create thread',
      currentThreadId: undefined,
      threads: [],
      canContributeOnOneThread: false,
      threadsWithContributeRight: [],
      expected: 'create-thread',
    },
    {
      description:
        'should return create-info when have threads and can contribute on at least one thread',
      currentThreadId: undefined,
      threads: mockThreads,
      canContributeOnOneThread: true,
      threadsWithContributeRight: [
        mockThreadAsOwner,
        mockThreadAsCatherineWithContributeRight,
      ],
      expected: 'create-info',
    },

    //filter on a specific thread (path: root/[threadId]/)
    {
      description:
        'should return create-info when have threads and can contribute on current thread',
      currentThreadId: mockThreadAsOwner.id,
      threads: mockThreads,
      canContributeOnOneThread: true,
      threadsWithContributeRight: [mockThreadAsOwner],
      expected: 'create-info',
    },
    {
      description:
        'should return default when have threads and cannot contribute on current thread',
      currentThreadId: mockThreadAsCatherine.id,
      threads: mockThreads,
      canContributeOnOneThread: true,
      threadsWithContributeRight: [
        mockThreadAsOwner,
        mockThreadAsCatherineWithContributeRight,
      ],
      expected: 'default',
    },
  ])(
    '$description',
    async ({
      currentThreadId,
      threads,
      canContributeOnOneThread,
      threadsWithContributeRight,
      expected,
    }) => {
      mocks.useThreadInfoParams.mockReturnValue({ threadId: currentThreadId });
      mocks.useThreads.mockReturnValue({ data: threads, isSuccess: true });
      mocks.useThreadsUserRights.mockReturnValue({
        canContributeOnOneThread,
        isReady: true,
        threadsWithContributeRight,
      });
      mocks.useUserRights.mockReturnValue({ canCreateThread: true });

      const { result } = renderHook(() => useInfoListEmptyScreen(), {
        wrapper,
      });

      expect(result.current).toEqual({ type: expected, isReady: true });
    },
  );
});
