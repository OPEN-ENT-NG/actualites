import { useI18n } from '~/hooks/useI18n';

import {
  AppIconSize,
  Flex,
  FormControl,
  Input,
  Label,
  OptionsType,
  Select,
  Switch,
  useBreakpoint,
} from '@edifice.io/react';
import { Editor, EditorInstance } from '@edifice.io/react/editor';
import { IconQuestion } from '@edifice.io/react/icons';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ThreadIcon } from '~/components/ThreadIcon';
import { Thread } from '~/models/thread';
import { useThreads } from '~/services/queries';
import {
  CreationInfoFormParams,
  useCreationStore,
} from '~/store/creationStore';
import './CreateInfoForm.css';

export function CreateInfoForm() {
  const { t } = useI18n();
  const { data: threads } = useThreads();
  const { md } = useBreakpoint();

  const { setInfoForm, setResetForm } = useCreationStore();

  const iconSize: AppIconSize = '24';

  if (!threads || threads.length === 0) {
    return null;
  }
  const defaultValues: CreationInfoFormParams = {
    thread_id: threads?.length === 1 ? threads[0].id : undefined,
    title: '',
    headline: false,
    content: '',
  };

  const {
    control,
    register,
    setValue,
    watch,
    formState: { isValid, isDirty },
    reset,
    getValues,
  } = useForm<CreationInfoFormParams>({
    defaultValues,
    mode: 'all',
  });

  useEffect(() => {
    setResetForm(() => () => reset({}, { keepDefaultValues: true }));
    return () => setResetForm(() => {});
  }, [reset, setResetForm]);

  useEffect(() => {
    const subscription = watch((values) => {
      setInfoForm({
        values: values as CreationInfoFormParams,
        isValid,
        isDirty,
      });
    });

    return () => subscription.unsubscribe();
  }, [watch, isValid, isDirty, setInfoForm]);

  useEffect(() => {
    setInfoForm({
      values: getValues(),
      isValid,
      isDirty,
    });
  }, [setInfoForm, isDirty, isValid]);

  const items: OptionsType[] = threads.map((thread: Thread) => ({
    value: thread.id + '',
    label: thread.title,
    icon: <ThreadIcon thread={thread} iconSize={iconSize} />,
  }));

  const handleEditorChange = ({ editor }: { editor: EditorInstance }) => {
    setValue('content', editor.isEmpty ? '' : editor.getHTML(), {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  return (
    <Flex direction="column" gap="24">
      <Flex
        direction={md ? 'row' : 'column'}
        gap="24"
        align={md ? 'center' : 'stretch'}
        className="col-12"
        wrap="nowrap"
      >
        <FormControl id="thread_id" className="col-12 col-md-5" isRequired>
          <Label>{t('actualites.info.createForm.selectThreadLabel')}</Label>
          {items.length > 1 ? (
            <Controller
              name="thread_id"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select
                  options={items}
                  block={true}
                  size="md"
                  onValueChange={field.onChange}
                  icon={<IconQuestion />}
                  placeholderOption={t(
                    'actualites.info.createForm.selectThreadPlaceholder',
                  )}
                />
              )}
            />
          ) : (
            <Flex align="center" gap="8" className="border rounded py-4 px-8">
              <ThreadIcon thread={threads[0]} iconSize={iconSize} />
              <span>{threads[0]?.title}</span>
            </Flex>
          )}
        </FormControl>
        <FormControl id={'title'} className="flex-fill" isRequired>
          <Label>{t('actualites.info.createForm.titleLabel')}</Label>
          <Input
            type="text"
            size="md"
            placeholder={t('actualites.info.createForm.titlePlaceholder')}
            showCounter
            maxLength={60}
            {...register('title', { required: true })}
          />
        </FormControl>
      </Flex>
      <FormControl id={'headline'}>
        <Flex align="center" gap="8">
          <Switch
            {...register('headline')}
            label={t('actualites.info.createForm.headlineLabel')}
          />
        </Flex>
      </FormControl>
      <FormControl id={'content'} isRequired>
        <Label>{t('actualites.info.createForm.contentLabel')}</Label>
        <Controller
          name="content"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <Flex wrap="nowrap" className="create-info-form_content">
              <Editor
                content={field.value}
                mode="edit"
                id="info-content"
                onContentChange={handleEditorChange}
              />
            </Flex>
          )}
        />
      </FormControl>
    </Flex>
  );
}
