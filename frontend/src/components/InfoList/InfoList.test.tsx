import { mockInfosDraft, mockInfosPublished } from '~/mocks/datas/infos';
import { renderWithRouter } from '~/mocks/renderWithRouter';
import { fireEvent, screen } from '~/mocks/setup';
import { InfoList } from './InfoList';

vi.mock('./hooks/useInfoListEmptyScreen', () => ({
  useInfoListEmptyScreen: vi.fn(() => ({
    type: 'default',
    isReady: true,
  })),
}));

describe('InfoList rendering', () => {
  it('should render skeletons when loading', async () => {
    renderWithRouter('/', <InfoList />);

    const skeletons = await screen.findAllByTestId('info-card-skeleton');
    expect(skeletons).toHaveLength(3);
  });

  it('should load published infos by default', async () => {
    renderWithRouter('/', <InfoList />);

    const infos = await screen.findAllByTestId('info-card');
    expect(infos).toHaveLength(mockInfosPublished.length);
  });

  it('should load filtered draft infos', async () => {
    renderWithRouter('/?status=draft', <InfoList />);

    const infos = await screen.findAllByTestId('info-card');
    expect(infos).toHaveLength(mockInfosDraft.length);
  });
});

describe('InfoList Segmented Switch', () => {
  it('should load filtered by draft when clicked on draft segmented button', async () => {
    renderWithRouter('/', <InfoList />);

    const draftLabel = await screen.findByText(
      'actualites.info-list.segmented.draft',
    );
    await fireEvent.click(draftLabel);

    const infos = await screen.findAllByTestId('info-card');
    expect(infos).toHaveLength(mockInfosDraft.length);
  });
});
