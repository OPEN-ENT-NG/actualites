import { useI18n } from '~/hooks/useI18n';

import {
  AppIconSize,
  Flex,
  FormControl,
  Switch,
  useBreakpoint,
} from '@edifice.io/react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { InfoDetailsFormParams } from '~/store/infoFormStore';
import { useInfoDetailsForm } from '../hooks/useInfoDetailsForm';
import './InfoDetailsForm.css';
import { InfoDetailsFormDates } from './InfoDetailsFormDates';
import { InfoDetailsFormEditor } from './InfoDetailsFormEditor';
import { InfoDetailsFormThread } from './InfoDetailsFormThread';
import { InfoDetailsFormTitle } from './InfoDetailsFormTitle';

export const INFO_DETAILS_DEFAULT_VALUES: InfoDetailsFormParams = {
  thread_id: undefined,
  title: '',
  headline: false,
  content: '',
  publicationDate: new Date(),
  expirationDate: new Date(
    new Date().setFullYear(new Date().getFullYear() + 1),
  ),
};

export function InfoDetailsForm({
  infoDetails,
}: {
  infoDetails?: InfoDetailsFormParams;
}) {
  const { t } = useI18n();

  const { md } = useBreakpoint();

  const { setDetailsForm, setResetDetailsForm, setDetailsFormState } =
    useInfoDetailsForm();

  const iconSize: AppIconSize = '24';

  const {
    control,
    register,
    setValue,
    getValues,
    watch,
    formState: { isValid, isDirty, errors },
    reset,
    trigger,
  } = useForm<InfoDetailsFormParams>({
    defaultValues: infoDetails || INFO_DETAILS_DEFAULT_VALUES,
    mode: 'all',
  });

  useEffect(() => {
    setDetailsForm(infoDetails || INFO_DETAILS_DEFAULT_VALUES);
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
      <InfoDetailsFormDates getValues={getValues} setValue={setValue} />
    </Flex>
  );
}
