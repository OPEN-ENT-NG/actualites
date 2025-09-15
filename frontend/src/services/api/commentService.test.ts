import { describe, expect, test } from 'vitest';
import { mockComments } from '~/mocks/datas/comments';
import { commentService } from '.';

describe('Comment GET Methods', () => {
  test('makes a GET request to get comments', async () => {
    const response = await commentService.getComments(123);

    expect(response).toBeDefined();
    expect(response).toStrictEqual(mockComments);
  });
});

describe('Comment Mutation Methods', () => {
  test('makes a PUT request to create a new Comment', async () => {
    const response = await commentService.create({
      comment: ':shoutout:',
      title: 'Un nouveau fil',
      info_id: 123,
    });

    expect(response).toBeDefined();
  });

  test('makes a PUT request to update a Comment', async () => {
    const response = await commentService.update(321, {
      comment: 'Oups !',
      info_id: 123,
    });

    expect(response).toStrictEqual({
      rows: 1,
    });
  });

  test('makes a DELETE request to delete a Comment', async () => {
    const response = await commentService.delete(123, 321);

    expect(response).toStrictEqual({
      rows: 1,
    });
  });
});
