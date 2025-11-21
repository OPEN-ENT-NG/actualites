import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react';
import { wrapper } from '~/mocks/setup';
import { InfoStatus } from '~/models/info';
import { infoService } from '../api';
import {
  useCreateDraftInfo,
  useDeleteInfo,
  useInfos,
  useInfoShares,
  usePublishInfo,
  useSubmitInfo,
  useUnsubmitInfo,
  useUpdateInfo,
} from './info';

describe('Info Queries', () => {
  test('useInfos hook to get a page of infos', async () => {
    const serviceSpy = vi.spyOn(infoService, 'getInfos');

    renderHook(() => useInfos(0).data, {
      wrapper,
    });

    await waitFor(() => {
      expect(serviceSpy).toHaveBeenCalled();
    });
  });

  test('useCreateDraftInfo hook to create an info', async () => {
    const { result } = renderHook(() => useCreateDraftInfo(), {
      wrapper,
    });

    const serviceSpy = vi.spyOn(infoService, 'createDraft');

    const variables = {
      title: 'Création de fil',
      content: '<div>New draft</div>',
      thread_id: 1,
    };

    act(() => {
      result.current.mutate(variables);
    });

    await waitFor(() => {
      expect(serviceSpy).toHaveBeenCalledWith(variables);
    });
  });

  test('useUpdateInfo hook to update an info', async () => {
    const { result } = renderHook(() => useUpdateInfo(), {
      wrapper,
    });

    const serviceSpy = vi.spyOn(infoService, 'update');

    const variables = {
      infoId: 123,
      infoStatus: InfoStatus.PUBLISHED,
      payload: {
        thread_id: 1,
        title: 'Changement de titre',
        content: 'Changement de contenu',
        is_headline: true,
      },
    };

    act(() => {
      result.current.mutate(variables);
    });

    await waitFor(() => {
      expect(serviceSpy).toHaveBeenCalledWith(
        variables.infoId,
        variables.infoStatus,
        variables.payload,
      );
    });
  });

  test('useDeleteInfo hook to delete an info', async () => {
    const { result } = renderHook(() => useDeleteInfo(), {
      wrapper,
    });

    const serviceSpy = vi.spyOn(infoService, 'delete');

    const variables = { threadId: 1, infoId: 123 };

    act(() => {
      result.current.mutate(variables);
    });

    await waitFor(() => {
      expect(serviceSpy).toHaveBeenCalledWith(
        variables.threadId,
        variables.infoId,
      );
    });
  });

  test('useInfoShares hook to get info shares', async () => {
    const serviceSpy = vi.spyOn(infoService, 'getShares');

    const variables = { threadId: 1, infoId: 123 };

    renderHook(() => useInfoShares(variables.threadId, variables.infoId).data, {
      wrapper,
    });

    await waitFor(() => {
      expect(serviceSpy).toHaveBeenCalledWith(
        variables.threadId,
        variables.infoId,
      );
    });
  });

  test('useSubmitInfo hook to submit an info', async () => {
    const { result } = renderHook(() => useSubmitInfo(), {
      wrapper,
    });

    const serviceSpy = vi.spyOn(infoService, 'submit');

    const variables = {
      threadId: 1,
      infoId: 123,
      payload: {
        title: 'Changement de titre',
      },
    };

    act(() => {
      result.current.mutate(variables);
    });

    await waitFor(() => {
      expect(serviceSpy).toHaveBeenCalledWith(
        variables.threadId,
        variables.infoId,
        variables.payload,
      );
    });
  });

  test('useUnsubmitInfo hook to unsubmit an info', async () => {
    const { result } = renderHook(() => useUnsubmitInfo(), {
      wrapper,
    });

    const serviceSpy = vi.spyOn(infoService, 'unsubmit');

    const variables = {
      threadId: 1,
      infoId: 123,
    };

    act(() => {
      result.current.mutate(variables);
    });

    await waitFor(() => {
      expect(serviceSpy).toHaveBeenCalledWith(
        variables.threadId,
        variables.infoId,
      );
    });
  });

  test('usePublishInfo hook to submit an info', async () => {
    const { result } = renderHook(() => usePublishInfo(), {
      wrapper,
    });

    const serviceSpy = vi.spyOn(infoService, 'publish');

    const variables = {
      threadId: 1,
      infoId: 123,
      payload: {
        title: 'Changement de titre',
        owner: 'owner',
        username: 'username',
      },
    };

    act(() => {
      result.current.mutate(variables);
    });

    await waitFor(() => {
      expect(serviceSpy).toHaveBeenCalledWith(
        variables.threadId,
        variables.infoId,
        variables.payload,
      );
    });
  });
});
