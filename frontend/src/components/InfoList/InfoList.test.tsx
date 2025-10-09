import { render, screen } from '~/mocks/setup';
import { InfoList } from './InfoList';

describe('InfoList', () => {
  it('should render', async () => {
    render(<InfoList />);

    const header = await screen.findAllByRole('article');
    expect(header).toHaveLength(3);

    screen.debug();
  });
});
