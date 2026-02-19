import { ERROR_CODE, ErrorCode } from '@edifice.io/client';
import {
  Alert,
  Button,
  Flex,
  useEdificeClient,
  useToast,
  useToggle,
} from '@edifice.io/react';
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
  RefObject,
  useCallback,
  useImperativeHandle,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useFalc } from '~/services/queries';
import { Expandable } from '../Expandable';
import { AiButton } from './AiButton';
import SvgIconAiFill from './IconAiFill';
import { KnowMoreModal } from './KnowMoreModal';
import { MarkdownRenderer } from './MarkdownRenderer';
import './TextSimplifier.css';

export interface TextSimplifierRef {
  resetSuggestions: () => void;
  handleContentChange: () => void;
}
export interface TextSimplifierProps {
  children: ReactNode;
  editorRef: RefObject<EditorRef>;
}

const TextSimplifierLayout = ({
  body,
  footer,
}: {
  body: ReactNode;
  footer: ReactNode;
}) => {
  return (
    <Flex direction="column" className="text-simplifier">
      <div className="text-simplifier-children">{body}</div>

      <div className="text-simplifier-border">
        <div className="text-simplifier-background">{footer}</div>
      </div>
    </Flex>
  );
};

export const TextSimplifier = forwardRef(
  (
    { children, editorRef }: TextSimplifierProps,
    ref: Ref<TextSimplifierRef>,
  ) => {
    const { appCode } = useEdificeClient();
    const { t } = useTranslation(appCode);
    const { error } = useToast();

    const [hideSuggestion, toggleSuggestion] = useToggle(true);
    const [showKnowMore, toggleKnowMore] = useToggle(false);

    const [errorCode, setErrorCode] = useState<ErrorCode>();
    const [contentChanged, setContentChanged] = useState(false);
    const [simplifiedContent, setSimplifiedContent] = useState<
      string | undefined
    >();

    const { generate, isGenerating } = useFalc();

    const handleGenerateClick = useCallback(async () => {
      // reset any previous error
      setErrorCode(undefined);

      // Simplify editor's content
      const originalContent = editorRef.current?.getContent('plain') as string;
      try {
        const result = await generate(originalContent);
        setSimplifiedContent(result);
        setContentChanged(false);
        if (result) {
          toggleSuggestion(true);
        }
      } catch (e: unknown) {
        setErrorCode(e as ErrorCode);
      }
    }, [editorRef, generate, error]);

    const handleCopyClick = useCallback(() => {
      if (simplifiedContent) navigator.clipboard.writeText(simplifiedContent);
    }, [simplifiedContent]);

    //----- TextSimplifier API
    useImperativeHandle(ref, () => ({
      handleContentChange: () => {
        const content = editorRef.current?.getContent('plain') as string;
        setContentChanged(
          typeof content !== 'undefined' && content.length > 200,
        );
      },
      resetSuggestions: () => {
        toggleSuggestion(false);
        setSimplifiedContent(undefined);
      },
    }));

    if (errorCode === ERROR_CODE.TIME_OUT) {
      return (
        <TextSimplifierLayout
          body={children /* Display the Editor and any other component */}
          footer={
            <>
              <Alert type="danger" className="my-8">
                <b>{t('actualites.textsimplifier.error.timeOut.title')}</b>
                <p>{t('actualites.textsimplifier.error.timeOut.body')}</p>
              </Alert>
              <Flex direction="row-reverse" gap="12">
                <Button
                  color="secondary"
                  disabled={true}
                  rightIcon={<SvgIconAiFill />}
                  className="rounded-pill my-4"
                >
                  {t('actualites.textsimplifier.error.timeOut.button')}
                </Button>
              </Flex>
            </>
          }
        />
      );
    }
    if (errorCode === ERROR_CODE.NOT_INITIALIZED) {
      return (
        <TextSimplifierLayout
          body={children /* Display the Editor and any other component */}
          footer={
            <>
              <Alert type="danger" className="my-8">
                <b>{t('actualites.textsimplifier.error.notAvailable.title')}</b>
                <p>{t('actualites.textsimplifier.error.notAvailable.body')}</p>
              </Alert>
              <Flex direction="row-reverse" gap="12">
                <AiButton
                  data-testid="textsimplifier-regenerate-button"
                  disabled={isGenerating || !contentChanged}
                  isLoading={isGenerating}
                  onClick={handleGenerateClick}
                >
                  {!isGenerating &&
                    t('actualites.textsimplifier.error.notAvailable.button')}
                </AiButton>
              </Flex>
            </>
          }
        />
      );
    }

    return (
      <TextSimplifierLayout
        body={children /* Display the Editor and any other component */}
        footer={
          <>
            {simplifiedContent && (
              <Button
                data-testid="textsimplifier-display-suggestion-toggle"
                className="text-gray-800"
                color="secondary"
                variant="ghost"
                size="sm"
                rightIcon={
                  hideSuggestion ? <IconRafterDown /> : <IconRafterUp />
                }
                onClick={toggleSuggestion}
              >
                {hideSuggestion
                  ? t('actualites.textsimplifier.button.show')
                  : t('actualites.textsimplifier.button.hide')}
              </Button>
            )}

            <Expandable collapse={hideSuggestion} transitionDurationMs={300}>
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

            <Flex wrap="wrap" justify="between" align="center" gap="10">
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

              <Flex justify="between" gap="12" className="ms-auto">
                <Button
                  data-testid="textsimplifier-knowmore-button"
                  size="sm"
                  variant="ghost"
                  color="tertiary"
                  onClick={toggleKnowMore}
                >
                  {t('actualites.textsimplifier.button.knowmore')}
                </Button>
                <KnowMoreModal isOpen={showKnowMore} onClose={toggleKnowMore} />

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
          </>
        }
      />
    );
  },
);

export default TextSimplifier;
