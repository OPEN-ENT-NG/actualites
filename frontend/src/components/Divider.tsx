import { Flex } from '@edifice.io/react';
import { ReactNode, useEffect, useRef } from 'react';
import './Divider.css';

export function Divider({
  children,
  color = 'var(--edifice-dark-bg-subtle)',
}: {
  children: ReactNode[];
  color: string;
}) {
  const divider = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (divider.current) {
      const hrs = divider.current.querySelectorAll('hr');
      hrs.forEach((hr) => (hr.style.borderColor = color));
    }
  }, [divider.current]);

  return (
    <div
      ref={divider}
      className="d-flex align-items-center justify-content-around gap-16 flex-wrap"
    >
      <hr className="divider m-12 ms-0 flex-fill" />
      <Flex gap="12" align="center" justify="around">
        {...children}
      </Flex>
      <hr className="divider m-12 me-0 flex-fill" />
    </div>
  );
}
