import { Button, Flex, useEdificeClient, useToast } from '@edifice.io/react';
import { EditorRef } from '@edifice.io/react/editor';
import {
  IconAlertTriangle,
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
import { Expandable } from './Expandable';
import { MarkdownRenderer } from './MarkdownRenderer';
import './TextSimplifier.css';

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
    }, [editorRef, generate, error]);

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

    return (
      <Flex direction="column" className="text-simplifier">
        <div className="text-simplifier-children">
          {children /* Display the Editor and any other component */}
        </div>

        <div className="text-simplifier-border">
          <div className="text-simplifier-background">
            {simplifiedContent && (
              <Button
                data-testid="textsimplifier-display-suggestion-toggle"
                className="text-gray-800"
                color="secondary"
                variant="ghost"
                size="sm"
                rightIcon={isVisible ? <IconRafterUp /> : <IconRafterDown />}
                onClick={handleVisibilityClick}
              >
                {isVisible
                  ? t('actualites.textsimplifier.button.hide')
                  : t('actualites.textsimplifier.button.show')}
              </Button>
            )}

            <Expandable collapse={!isVisible} transitionDurationMs={300}>
              <Flex
                direction="column"
                className="border rounded-3 bg-white mb-8"
              >
                <div className="px-24 py-16">
                  <MarkdownRenderer simplifiedContent={simplifiedContent} />
                </div>
                <Flex
                  direction="row"
                  justify="between"
                  className="border-top px-24"
                >
                  <div></div>
                  <Button
                    data-testid="textsimplifier-copy-suggestion-button"
                    className="text-gray-800"
                    color="secondary"
                    variant="ghost"
                    size="sm"
                    leftIcon={<IconCopy />}
                    onClick={handleCopyClick}
                  >
                    {t('actualites.textsimplifier.button.copy')}
                  </Button>
                </Flex>
              </Flex>
            </Expandable>

            <Flex justify="between" align="center" gap="10">
              <i>
                {simplifiedContent && contentChanged && (
                  <IconAlertTriangle
                    style={{
                      width: '2.4rem',
                      display: 'inline-block',
                      paddingRight: '.8rem',
                    }}
                  />
                )}
                {t(
                  simplifiedContent
                    ? contentChanged
                      ? 'actualites.textsimplifier.label.warn'
                      : 'actualites.textsimplifier.label.modify'
                    : 'actualites.textsimplifier.label.write',
                )}
              </i>

              <Flex justify="between" gap="12">
                <Button
                  data-testid="textsimplifier-knowmore-button"
                  size="sm"
                  variant="ghost"
                  color="tertiary"
                >
                  {t('actualites.textsimplifier.button.knowmore')}
                </Button>
                <AiButton
                  data-testid="textsimplifier-generate-button"
                  disabled={isGenerating || !contentChanged}
                  isLoading={isGenerating}
                  onClick={handleGenerateClick}
                >
                  {!isGenerating &&
                    t('actualites.textsimplifier.button.generate')}
                </AiButton>
              </Flex>
            </Flex>
          </div>
        </div>
      </Flex>
    );
  },
);

export default TextSimplifier;
