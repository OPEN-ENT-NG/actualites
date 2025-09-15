import { describe, expect, test } from 'vitest';
import {
  mockInfoRevisions,
  mockInfos,
  mockInfoShare,
  mockOriginalInfo,
} from '~/mocks/datas/comments';
import { InfoStatus } from '~/models/info';
import { infoService } from '.';

describe('Info GET Methods', () => {
  test('makes a GET request to get infos', async () => {
    const response = await infoService.getInfos({ page: 0, pageSize: 20 });

    expect(response).toBeDefined();
    expect(response).toStrictEqual(mockInfos);
  });

  test('makes a GET request to get the shares of an info', async () => {
    const response = await infoService.getShares(229, 466);

    expect(response).toBeDefined();
    expect(response).toStrictEqual(mockInfoShare);
  });

  test('makes a GET request to get the revisions of an info', async () => {
    const response = await infoService.getRevisions(466);

    expect(response).toBeDefined();
    expect(response).toStrictEqual(mockInfoRevisions);
  });

  test('makes a GET request to get original info', async () => {
    const response = await infoService.getOriginalFormat(229, 466);

    expect(response).toBeDefined();
    expect(response).toStrictEqual(mockOriginalInfo);
  });
});

describe('Info Mutation Methods', () => {
  test('makes a POST request to create a new Draft Info', async () => {
    const response = await infoService.createDraft({
      content: 'Yoplaboum',
      title: 'Un nouveau fil',
      thread_id: 229,
    });

    expect(response).toBeDefined();
  });

  test('makes a PUT request to update a Info', async () => {
    const response = await infoService.update(229, 466, InfoStatus.PUBLISHED, {
      title: 'Test de renommage',
      content: '',
      is_headline: false,
    });

    expect(response).toStrictEqual({
      rows: 1,
    });
  });

  test('makes a DELETE request to delete a Info and its infos', async () => {
    const response = await infoService.delete(229, 466);

    expect(response).toStrictEqual({
      rows: 1,
    });
  });

  test('makes a PUT request to submit a draft Info', async () => {
    const response = await infoService.submit(229, 1, {
      title: 'Did you know ?',
    });

    expect(response).toStrictEqual({
      rows: 1,
    });
  });

  test('makes a PUT request to unsubmit a draft Info', async () => {
    const response = await infoService.unsubmit(229, 1);

    expect(response).toStrictEqual({
      rows: 1,
    });
  });

  test('makes a PUT request to publish a draft Info', async () => {
    const response = await infoService.publish(229, 1, {
      title: 'Validé',
      owner: 'ABCDEF-1235',
      username: 'John',
    });

    expect(response).toStrictEqual({
      rows: 1,
    });
  });
});
