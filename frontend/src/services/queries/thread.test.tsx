import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react';
import { describe, expect, test, vi } from 'vitest';
import { wrapper } from '~/mocks/setup';
import { ThreadMode } from '~/models/thread';
import { threadService } from '../api';
import {
  useCreateThread,
  useDeleteThread,
  useThreadShares,
  useThreads,
  useUpdateThread,
} from './thread';

describe('Thread Queries', () => {
  test('useThreads hook to get all threads', async () => {
    const serviceSpy = vi.spyOn(threadService, 'getThreads');

    renderHook(() => useThreads().data, {
      wrapper,
    });

    await waitFor(() => {
      expect(serviceSpy).toHaveBeenCalled();
    });
  });

  test('useCreateThread hook to create a thread', async () => {
    const { result } = renderHook(() => useCreateThread(), {
      wrapper,
    });

    const serviceSpy = vi.spyOn(threadService, 'create');

    const variables = {
      mode: ThreadMode.DIRECT,
      title: 'Création de fil',
    };

    act(() => {
      result.current.mutate(variables);
    });

    await waitFor(() => {
      expect(serviceSpy).toHaveBeenCalledWith(variables);
    });
  });

  test('useUpdateThread hook to update a thread', async () => {
    const { result } = renderHook(() => useUpdateThread(), {
      wrapper,
    });

    const serviceSpy = vi.spyOn(threadService, 'update');

    const variables = {
      threadId: 1,
      payload: {
        mode: ThreadMode.SUBMIT,
        title: 'Changement de titre',
      },
    };

    act(() => {
      result.current.mutate(variables);
    });

    await waitFor(() => {
      expect(serviceSpy).toHaveBeenCalledWith(
        variables.threadId,
        variables.payload,
      );
    });
  });

  test('useDeleteThread hook to delete a thread', async () => {
    const { result } = renderHook(() => useDeleteThread(), {
      wrapper,
    });

    const serviceSpy = vi.spyOn(threadService, 'delete');

    const variables = { id: 1 };

    act(() => {
      result.current.mutate(variables.id);
    });

    await waitFor(() => {
      expect(serviceSpy).toHaveBeenCalledWith(variables.id);
    });
  });

  test('useThreadShares hook to get thread share', async () => {
    const serviceSpy = vi.spyOn(threadService, 'getShares');

    renderHook(() => useThreadShares(1).data, {
      wrapper,
    });

    await waitFor(() => {
      expect(serviceSpy).toHaveBeenCalled();
    });
  });
});
