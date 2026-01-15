import { FormControl, Input, Label } from '@edifice.io/react';
import {
  Control,
  Controller,
  FieldErrors,
  UseFormRegister,
} from 'react-hook-form';
import { useI18n } from '~/hooks/useI18n';
import { InfoDetailsFormParams } from '~/store/infoFormStore';

interface InfoDetailsFormTitleProps {
  control: Control<InfoDetailsFormParams>;
  register: UseFormRegister<InfoDetailsFormParams>;
  errors: FieldErrors<InfoDetailsFormParams>;
}

export function InfoDetailsFormTitle({
  control,
  register,
  errors,
}: InfoDetailsFormTitleProps) {
  const { t } = useI18n();

  return (
    <FormControl
      id={'title'}
      className="flex-fill"
      isRequired
      status={errors.title ? 'invalid' : undefined}
    >
      <Label>{t('actualites.info.createForm.titleLabel')}</Label>
      <Controller
        name="title"
        control={control}
        rules={{
          required: true,
          validate: (value) => value.trim().length > 0,
        }}
        render={() => (
          <Input
            type="text"
            size="md"
            placeholder={t('actualites.info.createForm.titlePlaceholder')}
            showCounter
            maxLength={60}
            data-testid="create-info-title-input"
            {...register('title', { required: true })}
          />
        )}
      />
    </FormControl>
  );
}
