import {
  mockInfoExpired,
  mockInfoIncoming,
  mockInfoPublished,
  mockInfoPublishedDraft,
  mockInfoPublishedHeadline,
} from '~/mocks/datas/infos';
import { renderWithRouter } from '~/mocks/renderWithRouter';
import { screen } from '~/mocks/setup';
import { InfoCard } from './InfoCard';

const mocks = vi.hoisted(() => ({
  useBreakpoint: vi.fn(),
}));

vi.mock('@edifice.io/react', async () => {
  const actual =
    await vi.importActual<typeof import('@edifice.io/react')>(
      '@edifice.io/react',
    );
  return {
    ...actual,
    useBreakpoint: mocks.useBreakpoint,
  };
});

function getHeadlineImg(card: HTMLElement) {
  const imgHeadline = [];
  for (let i = 0; i < card.getElementsByTagName('img').length; i++) {
    if (
      card.getElementsByTagName('img')[i].alt === 'actualites.info.alt.headline'
    ) {
      imgHeadline.push(card.getElementsByTagName('img')[i]);
    }
  }
  return imgHeadline;
}

describe('InfoCard', () => {
  it('should render headline info', () => {
    mocks.useBreakpoint.mockReturnValue({ md: false });
    renderWithRouter('/', <InfoCard info={mockInfoPublished} />);

    const card = screen.getByRole('article');
    expect(card.getElementsByTagName('h3')[0].textContent).toBe(
      'Voici une actualité publiée',
    );
  });

  it('should display headline message', () => {
    mocks.useBreakpoint.mockReturnValue({ md: false });
    renderWithRouter('/', <InfoCard info={mockInfoPublishedHeadline} />);

    const card = screen.getByRole('article');
    expect(card.parentElement).toHaveClass('info-card-headline');
    const imgHeadline = getHeadlineImg(card);
    expect(imgHeadline).toHaveLength(2);
  });

  it('should display draft message', () => {
    mocks.useBreakpoint.mockReturnValue({ md: false });
    renderWithRouter('/', <InfoCard info={mockInfoPublishedDraft} />);

    const card = screen.getByRole('article');
    expect(card.parentElement).toHaveClass('info-card-draft');

    const badge = card.getElementsByClassName('badge bg-blue-200 text-blue')[0];
    expect(badge).toBeInTheDocument();
    expect(badge.textContent).toBe('actualites.info.status.draft');

    const imgHeadline = getHeadlineImg(card);
    expect(imgHeadline).toHaveLength(0);
  });

  it('should display incoming message', () => {
    mocks.useBreakpoint.mockReturnValue({ md: false });
    renderWithRouter('/', <InfoCard info={mockInfoIncoming} />);

    const card = screen.getByRole('article');
    expect(card.parentElement).toHaveClass('info-card-incoming');

    const badge = card.getElementsByClassName(
      'badge bg-purple-200 text-purple-500',
    )[0];
    expect(badge).toBeInTheDocument();
    expect(badge.textContent).toBe('actualites.info.status.incoming');

    const imgHeadline = getHeadlineImg(card);
    expect(imgHeadline).toHaveLength(0);
  });

  it('should display expired message', () => {
    mocks.useBreakpoint.mockReturnValue({ md: false });
    renderWithRouter('/', <InfoCard info={mockInfoExpired} />);

    const card = screen.getByRole('article');
    expect(card.parentElement).toHaveClass('info-card-expired');

    const badge = card.getElementsByClassName(
      'badge bg-red-200 text-red-500',
    )[0];
    expect(badge).toBeInTheDocument();
    expect(badge.textContent).toBe('actualites.info.status.expired');

    const imgHeadline = getHeadlineImg(card);
    expect(imgHeadline).toHaveLength(0);
  });
});
