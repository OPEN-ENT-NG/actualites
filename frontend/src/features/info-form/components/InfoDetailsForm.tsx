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
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ThreadIcon } from '~/components/ThreadIcon';
import { Thread } from '~/models/thread';
import { useThreads } from '~/services/queries';
import { InfoDetailsFormParams } from '~/store/infoFormStore';
import { useInfoDetailsForm } from '../hooks/useInfoDetailsForm';
import './InfoDetailsForm.css';

export function InfoDetailsForm({
  infoDetails,
}: {
  infoDetails?: InfoDetailsFormParams;
}) {
  const { t } = useI18n();
  const { data: threads } = useThreads();
  const { md } = useBreakpoint();

  const { setDetailsForm, setResetDetailsForm, setDetailsFormState } =
    useInfoDetailsForm();

  const iconSize: AppIconSize = '24';

  const defaultValues: InfoDetailsFormParams = {
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
    formState: { isValid, isDirty, errors },
    reset,
    trigger,
  } = useForm<InfoDetailsFormParams>({
    defaultValues: infoDetails || defaultValues,
    mode: 'all',
  });

  useEffect(() => {
    setDetailsForm(infoDetails || defaultValues);
    if (infoDetails) {
      trigger();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setResetDetailsForm((values) => {
      reset(values || {}, {
        [values ? 'keepValues' : 'keepDefaultValues']: true,
      });
    });
    return () => setResetDetailsForm(() => {});
  }, [reset, setResetDetailsForm]);

  useEffect(() => {
    const subscription = watch((values) => {
      setDetailsForm(values as InfoDetailsFormParams);
    });

    return () => subscription.unsubscribe();
  }, [watch, setDetailsForm]);

  useEffect(() => {
    setDetailsFormState({
      isValid,
      isDirty,
    });
  }, [setDetailsFormState, isDirty, isValid]);

  if (!threads || threads.length === 0) {
    return null;
  }

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

  const thread = useMemo(() => {
    if (!infoDetails) return threads[0];
    return (
      threads.find((thread) => thread.id === infoDetails.thread_id) ||
      threads[0]
    );
  }, [infoDetails, threads]);

  return (
    <Flex direction="column" gap="24">
      <Flex
        direction={md ? 'row' : 'column'}
        gap="24"
        align={md ? 'center' : 'stretch'}
        className="col-12"
        wrap="nowrap"
      >
        <FormControl
          id="thread_id"
          className="col-12 col-md-5"
          isRequired
          status={errors.thread_id ? 'invalid' : undefined}
        >
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
                  defaultValue={String(infoDetails?.thread_id)}
                  placeholderOption={t(
                    'actualites.info.createForm.selectThreadPlaceholder',
                  )}
                  data-testid="actualites.info.thread.select"
                />
              )}
            />
          ) : (
            <Flex
              align="center"
              gap="8"
              className="border rounded py-4 px-8"
              style={{ height: '40px' }}
            >
              <ThreadIcon thread={thread} iconSize={iconSize} />
              <span>{thread?.title}</span>
            </Flex>
          )}
        </FormControl>
        <FormControl
          id={'title'}
          className="flex-fill"
          isRequired
          status={errors.title ? 'invalid' : undefined}
        >
          <Label>{t('actualites.info.createForm.titleLabel')}</Label>
          <Input
            type="text"
            size="md"
            placeholder={t('actualites.info.createForm.titlePlaceholder')}
            showCounter
            maxLength={60}
            data-testid="actualites.info.title.input"
            {...register('title', { required: true })}
          />
        </FormControl>
      </Flex>
      <FormControl id={'headline'}>
        <Flex align="center" gap="8">
          <Switch
            {...register('headline')}
            label={t('actualites.info.createForm.headlineLabel')}
            data-testid="actualites.info.headline.switch"
          />
        </Flex>
      </FormControl>
      <FormControl
        id={'content'}
        isRequired
        status={errors.content ? 'invalid' : undefined}
      >
        <Label>{t('actualites.info.createForm.contentLabel')}</Label>
        <Controller
          name="content"
          control={control}
          rules={{ required: true }}
          render={() => (
            <Flex wrap="nowrap" className="info-details-form_content">
              <Editor
                content={infoDetails?.content || ''}
                mode="edit"
                id="info-content"
                onContentChange={handleEditorChange}
                data-testid="actualites.info.content.editor"
              />
            </Flex>
          )}
        />
      </FormControl>
    </Flex>
  );
}
