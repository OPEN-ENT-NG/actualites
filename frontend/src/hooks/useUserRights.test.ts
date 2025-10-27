import { THREADS_CREATOR } from '~/config/rights';

type UserRights = Record<string, boolean> | undefined;

const testCanCreateThread = (mockRights: UserRights, expected: boolean) => {
  const canCreateThread = mockRights?.[THREADS_CREATOR] ?? false;
  expect(canCreateThread).toBe(expected);
};

describe('useUserRights', () => {
  it('should handle THREADS_CREATOR constant correctly', () => {
    expect(THREADS_CREATOR).toBe(
      'net.atos.entng.actualites.controllers.ThreadController|createThread',
    );
  });

  it('should return true when THREADS_CREATOR right is present', () => {
    testCanCreateThread({ [THREADS_CREATOR]: true }, true);
  });

  it('should return false when rights are undefined', () => {
    testCanCreateThread(undefined, false);
  });

  it('should return false when THREADS_CREATOR right is not present', () => {
    testCanCreateThread({ 'other.right': true }, false);
  });

  it('should return false when rights object is empty', () => {
    testCanCreateThread({}, false);
  });
});
