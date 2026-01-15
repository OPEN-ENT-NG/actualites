import { Flex, FormControl, Label } from '@edifice.io/react';
import { Editor, EditorInstance } from '@edifice.io/react/editor';
import {
  Control,
  Controller,
  FieldErrors,
  UseFormSetValue,
} from 'react-hook-form';
import { useI18n } from '~/hooks/useI18n';
import { InfoDetailsFormParams } from '~/store/infoFormStore';
import { isContentValid } from '../utils/utils';
import './InfoDetailsForm.css';

interface InfoDetailsFormEditorProps {
  control: Control<InfoDetailsFormParams>;
  errors: FieldErrors<InfoDetailsFormParams>;
  content?: string;
  setValue: UseFormSetValue<InfoDetailsFormParams>;
}

export function InfoDetailsFormEditor({
  control,
  errors,
  content,
  setValue,
}: InfoDetailsFormEditorProps) {
  const { t } = useI18n();

  const handleEditorChange = ({ editor }: { editor: EditorInstance }) => {
    setValue('content', editor.isEmpty ? '' : editor.getHTML(), {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

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
        render={() => (
          <Flex wrap="nowrap" className="info-details-form_content">
            <Editor
              content={content || ''}
              mode="edit"
              id="info-content"
              onContentChange={handleEditorChange}
              data-testid="actualites.info.content.editor"
            />
          </Flex>
        )}
      />
    </FormControl>
  );
}
