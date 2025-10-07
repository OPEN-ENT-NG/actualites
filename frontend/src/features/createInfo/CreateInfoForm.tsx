import { useI18n } from '~/hooks/useI18n';

import {
  Button,
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
import {
  IconArrowRight,
  IconQuestion,
  IconSave,
} from '@edifice.io/react/icons';
import { Controller, useForm } from 'react-hook-form';
import { ThreadIcon } from '~/components/ThreadIcon';
import { Thread, ThreadId } from '~/models/thread';
import { useCreateDraftInfo, useThreads } from '~/services/queries';
import { CreationStep, useCreationStore } from '~/store/creationStore';
import './CreateInfoForm.css';

export interface InfoParams {
  thread_id?: ThreadId;
  title: string;
  headline: boolean;
  content: string;
}

export function CreateInfoForm() {
  const { t } = useI18n();
  const { data: threads } = useThreads();
  const { md } = useBreakpoint();
  const { setCurrentCreationStep } = useCreationStore();
  const { mutate: createDraftInfo } = useCreateDraftInfo();

  const defaultValues: InfoParams = {
    thread_id: threads?.length === 1 ? threads[0]._id : undefined,
    title: '',
    headline: false,
    content: '',
  };

  const {
    register,
    control,
    setValue,
    reset,
    formState: { isValid, isDirty },
    getValues,
  } = useForm<InfoParams>({
    defaultValues,
    mode: 'all',
  });

  const iconSize = 22;

  if (!threads || threads.length === 0) {
    return null;
  }

  const items: OptionsType[] = threads.map((thread: Thread) => ({
    value: thread._id + '',
    label: thread.title,
    icon: <ThreadIcon thread={thread} iconSize={iconSize} />,
  }));

  const handleEditorChange = ({ editor }: { editor: EditorInstance }) => {
    setValue('content', editor.isEmpty ? '' : editor.getHTML(), {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleSaveDraft = () => {
    createDraftInfo(
      {
        title: getValues('title'),
        content: getValues('content'),
        thread_id: getValues('thread_id'),
      },
      {
        onSuccess: () => {
          console.log('Draft created');
        },
      },
    );
    reset({}, { keepValues: true });
  };
  const handleSubmit = () => {
    if (isValid) {
      console.log(getValues());
      setCurrentCreationStep(CreationStep.INFO_SHARE);
    }
  };

  return (
    <>
      <Flex
        direction={md ? 'row' : 'column'}
        gap="24"
        align={md ? 'center' : 'stretch'}
        className="col-12 mt-24"
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
        <Flex align="center" gap="8" className="mt-24">
          <Switch {...register('headline')} />
          <label>{t('actualites.info.createForm.headlineLabel')}</label>
        </Flex>
      </FormControl>
      <FormControl id={'content'} className="mt-24" isRequired>
        <Label>{t('actualites.info.createForm.contentLabel')}</Label>
        <Controller
          name="content"
          control={control}
          rules={{ required: true }}
          render={() => (
            <Flex wrap="nowrap" className="create-info-form_content">
              <Editor
                content={''}
                mode="edit"
                id="info-content"
                onContentChange={handleEditorChange}
              />
            </Flex>
          )}
        />
      </FormControl>
      <Flex
        direction={md ? 'row' : 'column-reverse'}
        justify="end"
        align={md ? 'center' : 'end'}
        className="pt-24"
        gap="12"
      >
        <Button color="primary" variant="ghost">
          {t('actualites.info.createForm.cancel')}
        </Button>
        <Flex gap="12">
          <Button
            color="primary"
            variant="outline"
            type="submit"
            leftIcon={<IconSave />}
            onClick={handleSaveDraft}
            disabled={!isDirty || getValues('thread_id') === undefined}
          >
            {t('actualites.info.createForm.saveDraft')}
          </Button>
          <Button
            color="primary"
            type="submit"
            rightIcon={<IconArrowRight />}
            onClick={handleSubmit}
            disabled={!isValid}
          >
            {t('actualites.info.createForm.nextStep')}
          </Button>
        </Flex>
      </Flex>
    </>
  );
}
