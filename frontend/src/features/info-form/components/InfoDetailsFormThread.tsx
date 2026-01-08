import {
  AppIconSize,
  Flex,
  FormControl,
  Label,
  OptionsType,
  Select,
} from '@edifice.io/react';
import { IconQuestion } from '@edifice.io/react/icons';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { ThreadIcon } from '~/components/ThreadIcon';
import { useI18n } from '~/hooks/useI18n';
import { Thread } from '~/models/thread';
import { InfoDetailsFormParams } from '~/store/infoFormStore';

interface InfoDetailsFormThreadProps {
  control: Control<InfoDetailsFormParams>;
  errors: FieldErrors<InfoDetailsFormParams>;
  items: OptionsType[];
  thread?: Thread;
  iconSize: AppIconSize;
  threadId?: number;
}

export function InfoDetailsFormThread({
  control,
  errors,
  items,
  thread,
  iconSize,
  threadId,
}: InfoDetailsFormThreadProps) {
  const { t } = useI18n();

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
              defaultValue={String(threadId)}
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
          <ThreadIcon thread={thread} iconSize={iconSize} />
          <span>{thread?.title}</span>
        </Flex>
      )}
    </FormControl>
  );
}
