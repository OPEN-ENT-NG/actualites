import { render, screen } from '~/mocks/setup';
import { InfoList } from './InfoList';

vi.mock('./hooks/useInfoListEmptyScreen', () => ({
  useInfoListEmptyScreen: vi.fn(() => ({
    type: 'default',
    isReady: true,
  })),
}));

describe('InfoList', () => {
  it('should render', async () => {
    render(<InfoList />);

    const header = await screen.findAllByRole('article');
    expect(header).toHaveLength(3);

    screen.debug();
  });
});
