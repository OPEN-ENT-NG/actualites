import { renderHook } from '@testing-library/react';
import { mockUserLogged } from '~/mocks/datas/users';
import { wrapper } from '~/mocks/setup';
import { useInfoListEmptyScreen } from './useInfoListEmptyScreen';

const mocks = vi.hoisted(() => ({
  useUser: vi.fn(),
  useThreads: vi.fn(),
  useThreadsUserRights: vi.fn(),
  useUserRights: vi.fn(),
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

  it('should return create-thread when no threads and can create thread', () => {
    mocks.useThreads.mockReturnValue({ data: [], isSuccess: true });
    mocks.useThreadsUserRights.mockReturnValue({
      canContributeOnOneThread: false,
      isReady: true,
    });
    mocks.useUserRights.mockReturnValue({ canCreateThread: true });

    const { result } = renderHook(() => useInfoListEmptyScreen(), { wrapper });

    expect(result.current).toEqual({ type: 'create-thread', isReady: true });
  });

  it('should prioritize create-info over create-thread when can contribute', () => {
    mocks.useThreads.mockReturnValue({ data: [], isSuccess: true });
    mocks.useThreadsUserRights.mockReturnValue({
      canContributeOnOneThread: true,
      isReady: true,
    });
    mocks.useUserRights.mockReturnValue({ canCreateThread: true });

    const { result } = renderHook(() => useInfoListEmptyScreen(), { wrapper });

    expect(result.current).toEqual({ type: 'create-info', isReady: true });
  });

  it('should return default when no rights and not ready', () => {
    mocks.useThreads.mockReturnValue({ data: undefined, isSuccess: false });
    mocks.useThreadsUserRights.mockReturnValue({
      canContributeOnOneThread: undefined,
      isReady: false,
    });
    mocks.useUserRights.mockReturnValue({ canCreateThread: false });

    const { result } = renderHook(() => useInfoListEmptyScreen(), { wrapper });

    expect(result.current).toEqual({ type: 'default', isReady: false });
  });
});
