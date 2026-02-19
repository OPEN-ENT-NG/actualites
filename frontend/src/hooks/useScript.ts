import { useEffect } from 'react';

/* Declare integrated webcomponent typings */
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'zero-md': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

export const useScript = (src: string) => {
  useEffect(() => {
    const script = document.createElement('script');

    script.type = 'module';
    script.src = src;
    script.async = true;

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);
};
