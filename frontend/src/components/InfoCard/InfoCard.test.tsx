import { describe, expect, it, vi } from 'vitest';
import { mockInfos } from '~/mocks';
import { render, screen } from '~/mocks/setup';
import { InfoCard } from './InfoCard';

/**
 * Mock window.matchMedia used in useBreakpoint hook
 */
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

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

describe('InfoCard', () => {
  it('should render', () => {
    mocks.useBreakpoint.mockReturnValue({ md: false });
    render(<InfoCard info={mockInfos[0]} />);

    const card = screen.getByRole('article');
    expect(card.getElementsByTagName('h3')[0].textContent).toBe('Bientôt');

    screen.debug();
  });
});
