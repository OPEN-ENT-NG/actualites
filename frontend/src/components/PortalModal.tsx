import { Modal, ModalElement, ModalProps } from '@edifice.io/react';
import { ReactNode, Ref, forwardRef } from 'react';
import { createPortal } from 'react-dom';

export interface PortalModalProps extends ModalProps {
  header: ReactNode;
  footer: ReactNode;
}

export const PortalModal = forwardRef(
  (
    { header, footer, children, ...otherProps }: PortalModalProps,
    ref: Ref<ModalElement>,
  ) => {
    const portal =
      (document.getElementById('portal') as HTMLElement) || document;

    return createPortal(
      <Modal ref={ref} {...otherProps}>
        {header && (
          <Modal.Header onModalClose={otherProps.onModalClose}>
            {header}
          </Modal.Header>
        )}
        <Modal.Body>{children}</Modal.Body>
        {footer && <Modal.Footer>{footer}</Modal.Footer>}
      </Modal>,
      portal,
    );
  },
);
