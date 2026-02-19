import { useScript } from '~/hooks/useScript';
import './TextSimplifier.css';

export const MarkdownRenderer = ({
  simplifiedContent,
}: {
  simplifiedContent: string | undefined;
}) => {
  useScript('https://cdn.jsdelivr.net/npm/zero-md@3?register');

  return (
    <zero-md>
      <script type="text/markdown">{simplifiedContent}</script>
      <template>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/github-markdown-css@5/github-markdown.min.css"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@highlightjs/cdn-assets@11/styles/github.min.css"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0/dist/katex.min.css"
        />
      </template>
    </zero-md>
  );
};
