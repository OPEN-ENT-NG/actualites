import { renderWithRouter } from '~/mocks/renderWithRouter';
import { InfoListEmpty } from './InfoListEmpty';
import { screen } from '~/mocks/setup';

describe('InfoList Empty Screen', () => {
  it('should display empty screen with pending title when status=pending', async () => {
    renderWithRouter('/?status=pending', <InfoListEmpty type="pending" />);
    const pendingTitle = await screen.findByText(
      'actualites.infoList.empty.pending.title',
    );
    expect(pendingTitle).toBeInTheDocument();
  });
  it('should display empty screen with draft description when status=draft', async () => {
    renderWithRouter('/?status=draft', <InfoListEmpty type="draft" />);
    const draftDescription = await screen.findByText(
      'actualites.infoList.empty.draft.description',
    );
    expect(draftDescription).toBeInTheDocument();
  });
});
