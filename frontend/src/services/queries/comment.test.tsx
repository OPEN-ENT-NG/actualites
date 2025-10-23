import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react';
import { wrapper } from '~/mocks/setup';
import { commentService } from '../api';
import {
  useComments,
  useCreateComment,
  useDeleteComment,
  useUpdateComment,
} from './comment';

describe('Comment Queries', () => {
  test('useComments hook to get comments about an info', async () => {
    const serviceSpy = vi.spyOn(commentService, 'getComments');

    renderHook(() => useComments(123).data, {
      wrapper,
    });

    await waitFor(() => {
      expect(serviceSpy).toHaveBeenCalled();
    });
  });

  test('useCreateComment hook to create a comment', async () => {
    const { result } = renderHook(() => useCreateComment(), {
      wrapper,
    });

    const serviceSpy = vi.spyOn(commentService, 'create');

    const variables = {
      title: 'Création de commentaire',
      comment: 'New comment',
      info_id: 123,
    };

    act(() => {
      result.current.mutate(variables);
    });

    await waitFor(() => {
      expect(serviceSpy).toHaveBeenCalledWith(variables);
    });
  });

  test('useUpdateComment hook to update a comment', async () => {
    const { result } = renderHook(() => useUpdateComment(), {
      wrapper,
    });

    const serviceSpy = vi.spyOn(commentService, 'update');

    const variables = {
      commentId: 1,
      payload: {
        info_id: 123,
        comment: 'Changement de contenu',
      },
    };

    act(() => {
      result.current.mutate(variables);
    });

    await waitFor(() => {
      expect(serviceSpy).toHaveBeenCalledWith(
        variables.commentId,
        variables.payload,
      );
    });
  });

  test('useDeleteInfo hook to delete a comment', async () => {
    const { result } = renderHook(() => useDeleteComment(), {
      wrapper,
    });

    const serviceSpy = vi.spyOn(commentService, 'delete');

    const variables = { commentId: 321, infoId: 123 };

    act(() => {
      result.current.mutate(variables);
    });

    await waitFor(() => {
      expect(serviceSpy).toHaveBeenCalledWith(
        variables.infoId,
        variables.commentId,
      );
    });
  });
});
