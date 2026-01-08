import { useI18n } from '~/hooks/useI18n';

import {
  AppIconSize,
  Flex,
  FormControl,
  OptionsType,
  Switch,
  useBreakpoint,
} from '@edifice.io/react';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { ThreadIcon } from '~/components/ThreadIcon';
import { useThreadsUserRights } from '~/hooks/useThreadsUserRights';
import { Thread } from '~/models/thread';
import { InfoDetailsFormParams } from '~/store/infoFormStore';
import { useInfoDetailsForm } from '../hooks/useInfoDetailsForm';
import { InfoDetailsFormEditor } from './InfoDetailsFormEditor';
import { InfoDetailsFormThread } from './InfoDetailsFormThread';
import { InfoDetailsFormTitle } from './InfoDetailsFormTitle';
import './InfoDetailsForm.css';

export function InfoDetailsForm({
  infoDetails,
}: {
  infoDetails?: InfoDetailsFormParams;
}) {
  const { t } = useI18n();

  const { threadsWithContributeRight: threads } = useThreadsUserRights();
  // TODO use thread-id from query params when form will be editable
  // const search = useLocation().search;
  // const searchThreadId = new URLSearchParams(search).get('thread-id');
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
  }, [infoDetails]);

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
    value: String(thread.id),
    label: thread.title,
    icon: <ThreadIcon thread={thread} iconSize={iconSize} />,
  }));

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
        <InfoDetailsFormThread
          control={control}
          errors={errors}
          items={items}
          thread={thread}
          iconSize={iconSize}
          threadId={infoDetails?.thread_id}
        />
        <InfoDetailsFormTitle
          control={control}
          register={register}
          errors={errors}
        />
      </Flex>
      <FormControl id={'headline'}>
        <Flex align="center" gap="8">
          <Switch
            {...register('headline')}
            label={t('actualites.info.createForm.headlineLabel')}
            data-testid="create-info-headline-checkbox"
            variant="secondary"
          />
        </Flex>
      </FormControl>
      <InfoDetailsFormEditor
        control={control}
        errors={errors}
        content={infoDetails?.content}
        setValue={setValue}
      />
      {/* <Flex>
        <p>
          {t('actualites.info.createForm.contentLabel', {
            publicationDate: new Date().toLocaleDateString(),
            expirationDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString(),
          })}
        </p>
      </Flex> */}
    </Flex>
  );
}
