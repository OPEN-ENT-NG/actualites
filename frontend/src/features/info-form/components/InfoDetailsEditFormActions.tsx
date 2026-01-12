import { useI18n } from '~/hooks/useI18n';

import { Button, Flex, useBreakpoint, useToast } from '@edifice.io/react';
import { IconEdit } from '@edifice.io/react/icons';
import { useNavigate } from 'react-router-dom';
import { useInfoDetailsForm } from '../hooks/useInfoDetailsForm';

export function InfoDetailsEditFormActions() {
  const { t, common_t } = useI18n();
  const toast = useToast();
  const { md } = useBreakpoint();
  const navigate = useNavigate();

  const { detailsFormState, onSaveDetails, isSaving } = useInfoDetailsForm();

  const handleCancelClick = () => {
    navigate(-1);
  };

  const handleSubmitClick = () => {
    onSaveDetails(() => {
      toast.success(t('actualites.info.editForm.update.success'));
      navigate(-1);
    });
  };

  return (
    <Flex
      direction={md ? 'row' : 'column-reverse'}
      justify="end"
      align={md ? 'center' : 'end'}
      gap="12"
      className="mt-8 mb-48"
    >
      <Button
        color="primary"
        variant="ghost"
        className="btn-icon"
        onClick={handleCancelClick}
        data-testid="actualites.info.form.cancelButton"
        disabled={isSaving}
      >
        {common_t('cancel')}
      </Button>

      <Button
        color="primary"
        type="submit"
        leftIcon={<IconEdit />}
        onClick={handleSubmitClick}
        disabled={!detailsFormState?.isValid || isSaving}
        data-testid="actualites.info.form.submitButton"
      >
        {common_t('edit')}
      </Button>
    </Flex>
  );
}
