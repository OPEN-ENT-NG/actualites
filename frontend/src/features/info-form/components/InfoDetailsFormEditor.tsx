import { FormControl, Label } from '@edifice.io/react';
import { Editor, EditorInstance, EditorRef } from '@edifice.io/react/editor';
import { lazy, Suspense, useEffect, useRef } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { TextSimplifierRef } from '~/components/TextSimplifier';
import { useI18n } from '~/hooks/useI18n';
import { InfoDetailsFormParams } from '~/store/infoFormStore';
import { isContentValid } from '../utils/utils';
import './InfoDetailsForm.css';

const TextSimplifier = lazy(() => import('../../../components/TextSimplifier'));

interface InfoDetailsFormEditorProps {
  content?: string;
}

export function InfoDetailsFormEditor({ content }: InfoDetailsFormEditorProps) {
  const { t } = useI18n();
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<InfoDetailsFormParams>();

  const canUseFalc = true;
  const editorRef = useRef<EditorRef>(null);
  const textSimplifierRef = useRef<TextSimplifierRef>(null);

  // Reset suggestions when a different content is set.
  useEffect(() => {
    textSimplifierRef.current?.handleContentChange();
    textSimplifierRef.current?.resetSuggestions();
  }, [content]);

  const handleEditorChange = ({ editor }: { editor: EditorInstance }) => {
    textSimplifierRef.current?.handleContentChange();
    setValue('content', editor.isEmpty ? '' : editor.getHTML(), {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const renderEditor = () => (
    <Editor
      ref={editorRef}
      content={content || ''}
      mode="edit"
      focus={false}
      id="info-content"
      onContentChange={handleEditorChange}
      data-testid="actualites.info.content.editor"
    />
  );

  return (
    <FormControl
      id={'content'}
      isRequired
      status={errors.content ? 'invalid' : undefined}
    >
      <Label>{t('actualites.info.createForm.contentLabel')}</Label>
      <Controller
        name="content"
        control={control}
        rules={{ required: true, validate: (value) => isContentValid(value) }}
        render={() =>
          canUseFalc ? (
            <Suspense>
              <div className="info-details-form_content">
                <TextSimplifier
                  ref={textSimplifierRef}
                  editorRef={editorRef.current}
                >
                  {renderEditor()}
                </TextSimplifier>
              </div>
            </Suspense>
          ) : (
            renderEditor()
          )
        }
      />
    </FormControl>
  );
}
