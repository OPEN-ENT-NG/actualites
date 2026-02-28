import { useDate } from '@edifice.io/react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { MockedProviders } from '~/mocks/mockedProvider';
import {
  getMaxExpirationDate,
  useInfoDetailsFormDatesModal,
} from './useInfoDetailsFormDatesModal';

let dateIsSame: ReturnType<typeof useDate>['dateIsSame'];

function renderDatesModal(props: {
  publicationDate: Date;
  expirationDate: Date;
  onUpdate?: (publicationDate: Date, expirationDate: Date) => void;
}) {
  return renderHook(
    () =>
      useInfoDetailsFormDatesModal({
        ...props,
        onUpdate: props.onUpdate ?? vi.fn(),
      }),
    { wrapper: MockedProviders },
  );
}

type HookResult = ReturnType<typeof renderDatesModal>['result'];

async function changePublicationDateAndWait(
  result: HookResult,
  newPublicationDate: Date,
) {
  act(() => {
    result.current.handlePublicationDateChange(newPublicationDate);
  });
  await waitFor(() => {
    expect(result.current.selectedPublicationDate).toEqual(newPublicationDate);
  });
}

function expectExpirationSameDay(result: HookResult, expected: Date) {
  expect(
    dateIsSame(result.current.selectedExpirationDate, expected, 'day'),
  ).toBe(true);
}

describe('useInfoDetailsFormDatesModal', () => {
  const onUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    const { result } = renderHook(() => useDate(), {
      wrapper: MockedProviders,
    });
    dateIsSame = result.current.dateIsSame;
  });

  describe('when expiration date is the default (max for publication)', () => {
    it.each([
      {
        name: 'adapts expiration when publication moves to an earlier date',
        initialPublication: new Date(2025, 5, 15),
        newPublication: new Date(2025, 2, 1),
      },
      {
        name: 'sets expiration to new max when publication moves after default expiration',
        initialPublication: new Date(2025, 5, 15),
        newPublication: new Date(2026, 6, 1),
      },
    ])('should $name', async ({ initialPublication, newPublication }) => {
      const defaultExpiration = getMaxExpirationDate(initialPublication);
      const expectedExpiration = getMaxExpirationDate(newPublication);

      const { result } = renderDatesModal({
        publicationDate: initialPublication,
        expirationDate: defaultExpiration,
        onUpdate,
      });

      expect(result.current.selectedExpirationDate).toEqual(defaultExpiration);

      await changePublicationDateAndWait(result, newPublication);

      expectExpirationSameDay(result, expectedExpiration);
    });
  });

  describe('when expiration date has been manually modified (different from default)', () => {
    it('should NOT auto-update expirationDate when publicationDate changes', async () => {
      const initialPublication = new Date(2025, 5, 15);
      const newPublication = new Date(2025, 2, 1);
      const customExpiration = new Date(2026, 0, 1);

      const { result } = renderDatesModal({
        publicationDate: initialPublication,
        expirationDate: customExpiration,
        onUpdate,
      });

      expect(result.current.selectedExpirationDate).toEqual(customExpiration);

      await changePublicationDateAndWait(result, newPublication);

      expectExpirationSameDay(result, customExpiration);
      expect(
        dateIsSame(
          result.current.selectedExpirationDate,
          getMaxExpirationDate(newPublication),
          'day',
        ),
      ).toBe(false);
    });

    it('should set expiration to min when new publication is after expiration', async () => {
      const initialPublication = new Date(2025, 5, 15);
      const newPublication = new Date(2025, 7, 1);
      const customExpiration = new Date(2025, 6, 1);
      const expectedMinExpiration = new Date(2025, 7, 2);

      const { result } = renderDatesModal({
        publicationDate: initialPublication,
        expirationDate: customExpiration,
        onUpdate,
      });

      expect(result.current.selectedExpirationDate).toEqual(customExpiration);

      await changePublicationDateAndWait(result, newPublication);

      expectExpirationSameDay(result, expectedMinExpiration);
    });
  });
});
