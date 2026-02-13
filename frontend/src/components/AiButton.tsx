import { Button, ButtonProps, ButtonRef } from '@edifice.io/react';
import clsx from 'clsx';
import { forwardRef, Ref } from 'react';
import './AiButton.css';
import SvgIconAiFill from './IconAiFill';

type PickedProps =
  | 'type'
  | 'leftIcon'
  | 'rightIcon'
  | 'children'
  | 'className'
  | 'isLoading'
  | 'loadingIcon'
  | 'loadingPosition'
  | 'disabled';

export interface AiButtonProps extends Pick<ButtonProps, PickedProps> {
  /**
   * OnClick Handler
   */
  onClick?: () => void;
}

export const AiButton = forwardRef(
  (
    {
      rightIcon = <SvgIconAiFill />,
      loadingIcon = <SvgIconAiFill />,
      className,
      ...restProps
    }: AiButtonProps,
    ref?: Ref<ButtonRef>,
  ) => {
    const classes = clsx('btn-ai', '', className);

    return (
      <Button
        ref={ref}
        color="primary"
        className={classes}
        rightIcon={rightIcon}
        {...restProps}
      />
    );
  },
);
