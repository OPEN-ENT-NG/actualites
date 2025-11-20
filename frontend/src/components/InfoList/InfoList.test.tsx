import { renderWithRouter } from '~/mocks/renderWithRouter';
import { screen } from '~/mocks/setup';
import { InfoList } from './InfoList';

vi.mock('./hooks/useInfoListEmptyScreen', () => ({
  useInfoListEmptyScreen: vi.fn(() => ({
    type: 'default',
    isReady: true,
  })),
}));

const mockIntersectionObserver = vi.fn().mockReturnValue({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
});

describe('InfoList', () => {
  beforeAll(() => {
    window.IntersectionObserver = mockIntersectionObserver;
  });

  it('should render placeholder when loading', async () => {
    renderWithRouter('/', <InfoList />);

    const infos = await screen.findAllByRole('article');
    expect(infos).toHaveLength(3);
  });
});

// describe('Load filtered infos', () => {
//   it('should load filtered infos', async () => {
//     render(<InfoList />);

//     const infos = await screen.findAllByRole('article');
//     expect(infos).toHaveLength(3);
//   });
// });
