import { mockInfoPublished } from '~/mocks/datas/infos';
import { renderWithRouter } from '~/mocks/renderWithRouter';
import { fireEvent, screen } from '~/mocks/setup';
import { InfoCard } from './InfoCard';

describe('InfoCardHeader', () => {
  it('should not display unpublish action', () => {
    renderWithRouter('/', <InfoCard info={mockInfoPublished} />);

    const trigger = screen.getByTestId('info-card-header-dd-trigger');
    fireEvent.click(trigger);

    const unpublish = screen.queryByText('actualites.info.actions.unpublish');
    expect(unpublish).toBeNull();
  });
});
