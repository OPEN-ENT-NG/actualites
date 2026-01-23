import { FormControl, Input, Label } from '@edifice.io/react';
import { Controller, useFormContext } from 'react-hook-form';
import { useI18n } from '~/hooks/useI18n';
import { InfoDetailsFormParams } from '~/store/infoFormStore';

export function InfoDetailsFormTitle() {
  const { t } = useI18n();
  const {
    control,
    register,
    formState: { errors },
    getValues,
  } = useFormContext<InfoDetailsFormParams>();
  const defaultTitle = getValues('title');
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
            defaultValue={defaultTitle}
            {...register('title', { required: true })}
          />
        )}
      />
    </FormControl>
  );
}
