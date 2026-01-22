import { useI18n } from '~/hooks/useI18n';

import { Flex, FormControl, Switch, useBreakpoint } from '@edifice.io/react';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
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
  publicationDate: undefined,
  expirationDate: undefined,
};

export const INFO_DATES_RESET_VALUES: {
  publicationDate: Date;
  expirationDate: Date;
} = {
  publicationDate: new Date(),
  expirationDate: (() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    date.setHours(6, 0, 0, 0);
    return date;
  })(),
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

  const form = useForm<InfoDetailsFormParams>({
    defaultValues: infoDetails || INFO_DETAILS_DEFAULT_VALUES,
    mode: 'all',
  });
  const {
    register,
    watch,
    formState: { isValid, isDirty },
    reset,
    trigger,
  } = form;

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
    <FormProvider {...form}>
      <Flex direction="column" gap="24">
        <Flex
          direction={md ? 'row' : 'column'}
          gap="24"
          align={md ? 'center' : 'stretch'}
          className="col-12"
          wrap="nowrap"
        >
          <InfoDetailsFormThread />
          <InfoDetailsFormTitle />
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
        <InfoDetailsFormEditor content={infoDetails?.content} />
        <InfoDetailsFormDates />
      </Flex>
    </FormProvider>
  );
}
