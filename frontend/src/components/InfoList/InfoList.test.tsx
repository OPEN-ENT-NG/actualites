import {
  mockInfosDraft,
  mockInfosPublished,
  mockInfosStats,
} from '~/mocks/datas/infos';
import { mockThreadAsOwner, mockThreads } from '~/mocks/datas/threads';
import { renderWithRouter } from '~/mocks/renderWithRouter';
import { fireEvent, screen } from '~/mocks/setup';
import { InfoList } from './InfoList';
import { InfoStatus } from '~/models/info';

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

describe('InfoList Segmented counts', () => {
  it('should display the total count of published infos of all threads', async () => {
    renderWithRouter('/', <InfoList />);
    const publishedCount = await screen.findByText(
      'actualites.info-list.segmented.published' + ' 6',
    );
    expect(publishedCount).toBeInTheDocument();
  });

  it('should display the total count of published and draft infos of a thread', async () => {
    renderWithRouter(`/threads/${mockThreadAsOwner.id}`, <InfoList />, {
      routePath: '/threads/:threadIdAsString',
    });
    const threadInfosStats = mockInfosStats.threads.find(
      (thread) => thread.id === mockThreadAsOwner.id,
    );
    const expectedPublishedCount =
      threadInfosStats?.status[InfoStatus.PUBLISHED] ?? 0; // 2

    const publishedCount = await screen.findByText(
      'actualites.info-list.segmented.published' + ' ' + expectedPublishedCount,
    );
    expect(publishedCount).toBeInTheDocument();

    const expectedDraftCount = threadInfosStats?.status[InfoStatus.DRAFT] ?? 0; // 1
    const draftCount = await screen.findByText(
      'actualites.info-list.segmented.draft' + ' ' + expectedDraftCount,
    );
    expect(draftCount).toBeInTheDocument();
  });
});

describe('InfoList Segmented rendering', () => {
  it('should display segmented when user has contribute right on thread', async () => {
    const threadWithContributeRight = mockThreads[0];
    renderWithRouter(`/threads/${threadWithContributeRight.id}`, <InfoList />, {
      routePath: '/threads/:threadIdAsString',
    });
    const segmented = await screen.findByTestId('info-list-segmented');
    expect(segmented).toBeInTheDocument();
  });

  it('should not display segmented when user has no contribute right on thread', async () => {
    const threadWithoutContributeRight = mockThreads[1];
    renderWithRouter(
      `/threads/${threadWithoutContributeRight.id}`,
      <InfoList />,
      { routePath: '/threads/:threadIdAsString' },
    );

    await screen.findAllByTestId('info-card'); // Wait for infos to be loaded

    const segmented = screen.queryByTestId('info-list-segmented');
    expect(segmented).not.toBeInTheDocument();
  });
});

describe('InfoList Segmented Switch', () => {
  it('should load filtered by draft when clicked on draft segmented button', async () => {
    renderWithRouter('/', <InfoList />);

    const draftLabel = await screen.findByText(
      'actualites.info-list.segmented.draft' + ' 3',
    );
    await fireEvent.click(draftLabel);

    const infos = await screen.findAllByTestId('info-card');
    expect(infos).toHaveLength(mockInfosDraft.length);
  });
});
