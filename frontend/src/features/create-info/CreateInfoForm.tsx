import { useI18n } from '~/hooks/useI18n';

import {
  AppIconSize,
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
import { useThreads } from '~/services/queries';
import './CreateInfoForm.css';

export interface InfoParams {
  threadId?: ThreadId;
  title: string;
  headline: boolean;
  content: string;
}

export function CreateInfoForm() {
  const { t } = useI18n();
  const { data: threads } = useThreads();
  const { md } = useBreakpoint();

  const defaultValues: InfoParams = {
    threadId: threads?.length === 1 ? threads[0]._id : undefined,
    title: '',
    headline: false,
    content: '',
  };

  const {
    register,
    control,
    setValue,
    trigger,
    formState: { isValid },
    getValues,
  } = useForm<InfoParams>({
    defaultValues,
    mode: 'all',
  });

  const iconSize: AppIconSize = '24';

  if (!threads || threads.length === 0) {
    // skeleton loading
    return null;
  }

  const items: OptionsType[] = threads.map((thread: Thread) => ({
    value: thread._id + '',
    label: thread.title,
    icon: <ThreadIcon thread={thread} iconSize={iconSize} />,
  }));

  const handleEditorChange = ({ editor }: { editor: EditorInstance }) => {
    setValue('content', editor.isEmpty ? '' : editor.getHTML());
    trigger('content');
  };

  const handleSubmit = () => {
    if (isValid) {
      console.log(getValues());
    }
  };

  return (
    <Flex direction="column" gap="24" className="mt-24">
      <Flex
        fill
        direction={md ? 'row' : 'column'}
        gap="24"
        align={md ? 'center' : 'stretch'}
        className="col-12"
        wrap="nowrap"
      >
        <FormControl id="threadId" className="col-12 col-md-5" isRequired>
          <Label>{t('actualites.info.createForm.selectThreadLabel')}</Label>
          {items.length > 1 ? (
            <Controller
              name="threadId"
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
      <Flex
        direction={md ? 'row' : 'column-reverse'}
        justify="end"
        align={md ? 'center' : 'end'}
        gap="12"
        wrap="reverse"
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
    </Flex>
  );
}
