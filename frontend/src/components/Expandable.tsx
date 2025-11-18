import { ReactNode, TransitionEvent, useRef } from 'react';
import { useExpandable } from '~/hooks/useExpandable';
import './Expandable.css';

export type ExpandableContent = ReactNode | (() => ReactNode);

/**
 * Props for Expandable component that can be collapsed or expanded and may display a preview.
 * - `collapse` represents the desired collapsed state.
 * - `onCollapseApplied` signals the end of the expand/collapse animation.
 * - `hasPreview` indicates whether a preview view is available which may alter rendering.
 * - `onTogglePreview` should be provided to handle rendering previews or full content.
 * - `children` contains the content (preview or full) to render inside the expandable area.
 */
export type ExpandableProps = {
  collapse: boolean;
  onCollapseApplied?: () => void;
  hasPreview?: boolean;
  onTogglePreview?: () => void;
  children: ReactNode;
};

/**
 * Expandable component that animates showing/hiding its children by transitioning the
 * root element's CSS `grid-template-rows`. The component delegates class name and
 * transition-completion logic to the `useExpandable` hook and only considers the
 * transition finished when the `grid-template-rows` property on the root element
 * has completed transitioning.
 *
 * The component:
 * - Accepts an `ExpandableProps` object. `children` is rendered inside an inner wrapper
 *   element; all other props are forwarded to the `useExpandable` hook.
 * - Maintains an internal ref to the root `<div/>` and only invokes the hook-provided
 *   `onTransitionEnd` callback when the transition event's `target` equals the root
 *   element and `propertyName === 'grid-template-rows'`. This prevents spurious
 *   transitionend events from inner elements from being treated as completion.
 * - Applies the `className` returned by `useExpandable` to the root element.
 *
 * Accessibility:
 * - This component does not implicitly manage ARIA attributes. If you need to expose
 *   expansion state for assistive technologies, provide the appropriate attributes
 *   (for example, `aria-expanded`) from the parent or via props handled by your
 *   `useExpandable` implementation.
 *
 * Caveats:
 * - The implementation relies on CSS transitions for `grid-template-rows`. Ensure
 *   styles applied to the `className` returned by `useExpandable` include the desired
 *   transition rules.
 *
 * @remarks
 * For details of the hook used internally, see `useExpandable`.
 *
 * @param props - The props for the component.
 *
 * @returns A JSX element: a root div (with the hook-provided `className` and a transitionend
 *          handler) that contains an inner div wrapping the provided children.
 *
 * @example
 * <Expandable collapse={false}>
 *   <p>Expanded content</p>
 * </Expandable>
 */
export const Expandable = ({ children, ...props }: ExpandableProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const { className, onTransitionEnd } = useExpandable(props);

  const handleTransitionEnd = (e: TransitionEvent) => {
    if (e.target === ref.current && e.propertyName === 'grid-template-rows') {
      onTransitionEnd();
    }
  };

  return (
    <div ref={ref} className={className} onTransitionEnd={handleTransitionEnd}>
      <div>{children}</div>
    </div>
  );
};
