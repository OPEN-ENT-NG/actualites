import { Button, Flex, useEdificeClient, useToast } from '@edifice.io/react';
import { EditorRef } from '@edifice.io/react/editor';
import {
  IconCopy,
  IconRafterDown,
  IconRafterUp,
} from '@edifice.io/react/icons';
import {
  forwardRef,
  ReactNode,
  Ref,
  useCallback,
  useImperativeHandle,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useFalc } from '~/services/queries';
import { AiButton } from './AiButton';
import './TextSimplifier.css';

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
export interface TextSimplifierRef {
  resetSuggestions: () => void;
  handleContentChange: () => void;
}
export interface TextSimplifierProps {
  children: ReactNode;
  editorRef: EditorRef | null;
}

export const TextSimplifier = forwardRef(
  (
    { children, editorRef }: TextSimplifierProps,
    ref: Ref<TextSimplifierRef>,
  ) => {
    const { appCode } = useEdificeClient();
    const { t } = useTranslation(appCode);
    const { error } = useToast();

    const [isVisible, setIsVisible] = useState(false);
    const [contentChanged, setContentChanged] = useState(false);
    const [simplifiedContent, setSimplifiedContent] = useState<
      string | undefined
    >();

    const { generate, isGenerating } = useFalc();

    const handleGenerateClick = useCallback(async () => {
      const originalContent = editorRef?.getContent('plain') as string;
      try {
        const result = await generate(originalContent);
        setSimplifiedContent(result);
        setContentChanged(false);
        if (result) {
          setIsVisible(true);
        }
      } catch (e) {
        error(<span>{e as string}</span>);
      }
    }, [editorRef]);

    const handleCopyClick = useCallback(() => {
      if (simplifiedContent) navigator.clipboard.writeText(simplifiedContent);
    }, [simplifiedContent]);

    //----- TextSimplifier API
    useImperativeHandle(ref, () => ({
      handleContentChange: () => {
        const content = editorRef?.getContent('plain') as string;
        setContentChanged(
          typeof content !== 'undefined' && content.length > 200,
        );
      },
      resetSuggestions: () => {
        setIsVisible(false);
        setSimplifiedContent(undefined);
      },
    }));

    const handleVisibilityClick = () => {
      setIsVisible((previous) => !previous);
    };

    const contentClassName = `text-simplifier-content content-${
      isVisible ? 'visible' : 'hidden'
    }`;

    return (
      <Flex direction="column" className="text-simplifier">
        {children /* Display the Editor and any other component */}

        <div className="text-simplifier-border">
          <div className="text-simplifier-background">
            {simplifiedContent && (
              <Button
                type="button"
                className="text-gray-800"
                color="secondary"
                variant="ghost"
                size="sm"
                rightIcon={isVisible ? <IconRafterUp /> : <IconRafterDown />}
                onClick={handleVisibilityClick}
              >
                {isVisible
                  ? t('pocediteur.textsimplifier.button.hide')
                  : t('pocediteur.textsimplifier.button.show')}
              </Button>
            )}

            <div className={contentClassName}>
              <Flex
                direction="column"
                className="border rounded-3 bg-white mb-8"
              >
                <div className="px-24 py-16">
                  {/* 
                Pour le POC, on utilisera un webcomponent https://zerodevx.github.io/zero-md/ 
                afin de faire le rendu du résultat en markdown.
                Plus tard, on pourra utiliser TipTap 
                - soit avec un résultat HTML
                - soit avec un résultat en markdown (via l'extension 'beta' https://tiptap.dev/docs/editor/markdown)
                */}
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
                </div>
                <Flex
                  direction="row"
                  justify="between"
                  className="border-top px-24"
                >
                  <div></div>
                  <Button
                    type="button"
                    className="text-gray-800"
                    color="secondary"
                    variant="ghost"
                    size="sm"
                    leftIcon={<IconCopy />}
                    onClick={handleCopyClick}
                  >
                    {t('pocediteur.textsimplifier.button.copy')}
                  </Button>
                </Flex>
              </Flex>
            </div>

            <Flex justify="between" align="center" gap="10">
              <i>
                {t(
                  simplifiedContent
                    ? contentChanged
                      ? 'pocediteur.textsimplifier.label.warn'
                      : 'pocediteur.textsimplifier.label.modify'
                    : 'pocediteur.textsimplifier.label.write',
                )}
              </i>

              <AiButton
                disabled={isGenerating || !contentChanged}
                isLoading={isGenerating}
                onClick={handleGenerateClick}
              >
                {!isGenerating &&
                  t('pocediteur.textsimplifier.button.generate')}
              </AiButton>
            </Flex>
          </div>
        </div>
      </Flex>
    );
  },
);
