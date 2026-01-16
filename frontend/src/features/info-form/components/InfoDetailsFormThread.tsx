import {
  AppIconSize,
  Flex,
  FormControl,
  Label,
  OptionsType,
  Select,
} from '@edifice.io/react';
import { IconQuestion } from '@edifice.io/react/icons';
import { useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { ThreadIcon } from '~/components/ThreadIcon';
import { useI18n } from '~/hooks/useI18n';
import { useThreadsUserRights } from '~/hooks/useThreadsUserRights';
import { Thread } from '~/models/thread';
import { InfoDetailsFormParams } from '~/store/infoFormStore';

const ICON_SIZE: AppIconSize = '24';

export function InfoDetailsFormThread() {
  const { t } = useI18n();
  const { threadsWithContributeRight: threads } = useThreadsUserRights();
  const {
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext<InfoDetailsFormParams>();

  const selectedThread = useMemo(() => {
    let selectedId = getValues('thread_id');
    if (threads?.length === 1) {
      const currentThreadId = threads[0].id;
      setValue('thread_id', currentThreadId);
      selectedId = currentThreadId;
    }
    if (selectedId) {
      return threads?.find((thread) => thread.id === selectedId);
    } else if (threads && threads.length === 1) {
      return threads[0];
    }
    return undefined;
  }, [threads]);

  if (!threads || threads.length === 0) {
    return null;
  }

  const items: OptionsType[] = threads.map((thread: Thread) => ({
    value: String(thread.id),
    label: thread.title,
    icon: <ThreadIcon thread={thread} iconSize={ICON_SIZE} />,
  }));

  return (
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
              onValueChange={(value) => field.onChange(Number(value))}
              icon={<IconQuestion />}
              defaultValue={String(selectedThread?.id)}
              placeholderOption={t(
                'actualites.info.createForm.selectThreadPlaceholder',
              )}
              data-testid="create-info-thread-select"
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
          <ThreadIcon thread={selectedThread} iconSize={ICON_SIZE} />
          <span>{selectedThread?.title}</span>
        </Flex>
      )}
    </FormControl>
  );
}
