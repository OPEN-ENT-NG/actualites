import { describe, expect, it } from 'vitest';
import { mockInfos } from '~/mocks';
import { render, screen } from '~/mocks/setup';
import { InfoCard } from './InfoCard';

describe('InfoCard', () => {
  it('should render', () => {
    render(<InfoCard info={mockInfos[0]} />);

    const title = screen.getByText('Bientôt', { selector: 'h1' });
    expect(title).toBeInTheDocument();

    screen.debug();
  });
});
