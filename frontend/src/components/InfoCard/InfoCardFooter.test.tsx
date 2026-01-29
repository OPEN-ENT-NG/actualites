import { mockInfoPublished } from '~/mocks/datas/infos';
import { renderWithRouter } from '~/mocks/renderWithRouter';
import { fireEvent, screen, waitFor } from '~/mocks/setup';
import { infoService } from '~/services/api';
import { InfoCard } from './InfoCard';

describe('InfoCardFooter', () => {
  it('should display audience views counter', () => {
    renderWithRouter('/', <InfoCard info={mockInfoPublished} />);

    const trigger = screen.getByTestId('info-view-views-counter-button');
    expect(trigger).toHaveTextContent('0');
  });

  it('should trigger an audience view', async () => {
    const serviceSpy = vi.spyOn(infoService, 'incrementViews');

    renderWithRouter('/', <InfoCard info={mockInfoPublished} />);

    const trigger = screen.getByTestId('info-view-more-button');
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(serviceSpy).toHaveBeenCalled();
    });
  });
});
