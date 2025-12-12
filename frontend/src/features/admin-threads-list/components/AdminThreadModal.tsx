import { useEffect, useId, useMemo, useState } from 'react';

import {
  Alert,
  Button,
  Flex,
  FormControl,
  Heading,
  ImagePicker,
  Input,
  Label,
  MediaLibrary,
  Modal,
  OptionsType,
  Select,
  useEdificeClient,
  useMediaLibrary,
} from '@edifice.io/react';
import { IconFilter } from '@edifice.io/react/icons';
import { createPortal } from 'react-dom';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useI18n } from '~/hooks/useI18n';
import { Thread, ThreadMode, ThreadQueryPayload } from '~/models/thread';
import { useCreateThread, useUpdateThread } from '~/services/queries';

export interface FormInputs {
  title: string;
  structureId?: string;
}

interface AdminThreadModalProps {
  /** Controls modal visibility */
  isOpen: boolean;
  /** The thread to edit (if any) */
  thread?: Thread;

  /** Callback when operation succeeds, with operation result as parameter */
  onSuccess: () => void;

  /** Callback when operation is cancelled */
  onCancel: () => void;
}

const DEFAULT_INPUT_MAX_LENGTH = 80;

export const AdminThreadModal = ({
  isOpen,
  onCancel,
  onSuccess,
  thread,
}: AdminThreadModalProps) => {
  const { t } = useI18n();
  const { appCode, user, currentApp } = useEdificeClient();
  const formId = useId();

  const { mutate: createThread } = useCreateThread();
  const { mutate: updateThread } = useUpdateThread();
  const [icon, setIcon] = useState<string>(thread?.icon || '');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const {
    ref: mediaLibraryRef,
    libraryMedia,
    ...mediaLibraryHandlers
  } = useMediaLibrary();

  const structureList = useMemo<OptionsType[]>(() => {
    return (
      user?.structures.map((structureId, index) => ({
        label: user?.structureNames[index],
        value: structureId,
      })) || []
    );
  }, [user]);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { isValid },
  } = useForm<FormInputs>({
    mode: 'onChange',
    defaultValues: {
      title: '',
      structureId: undefined,
    },
  });

  useEffect(() => {
    if (thread) {
      setValue('title', thread.title);
      setValue(
        'structureId',
        thread.structureId ||
          (structureList.length === 1 ? structureList[0].value : undefined),
      );
      setIcon(thread.icon || '');
    }
  }, [thread, setValue, structureList]);

  const onSubmit: SubmitHandler<FormInputs> = async function (
    formData: FormInputs,
  ) {
    if (isValid === false || !formData.structureId) return;

    const data: ThreadQueryPayload = {
      mode: ThreadMode.SUBMIT,
      title: formData.title,
      structure: {
        id: formData.structureId,
        name:
          structureList.find((s) => s.value === formData.structureId)?.label ||
          '',
      },
      icon,
    };
    setIsSubmitting(true);
    if (!thread?.id) {
      createThread(data, {
        onSuccess: () => {
          reset();
          onSuccess();
          setIsSubmitting(false);
        },
      });
    } else {
      updateThread(
        { threadId: thread.id, payload: data },
        {
          onSuccess: () => {
            reset();
            onSuccess();
            setIsSubmitting(false);
          },
        },
      );
    }
  };

  const handleUploadImage = (image: string | Blob | File) => {
    if (typeof image === 'string') {
      setIcon(image);
      return;
    }
  };

  const handleDeleteImage = () => {
    setIcon('');
  };

  const handleCloseModal = () => {
    reset();
    setIcon('');
    onCancel();
  };

  return createPortal(
    <Modal
      id={`admin-new-thread-modal`}
      size="lg"
      isOpen={isOpen}
      onModalClose={handleCloseModal}
    >
      <Modal.Header onModalClose={handleCloseModal}>
        {t(`actualites.adminThreads.modal.modalTitle`)}
      </Modal.Header>

      <Modal.Body>
        <Heading headingStyle="h4" level="h3" className="mb-16">
          {t('actualites.adminThreads.modal.details')}
        </Heading>

        <form id={formId} onSubmit={handleSubmit(onSubmit)}>
          <div className="d-block d-md-flex gap-16 mb-24">
            <div>
              <ImagePicker
                app={currentApp}
                src={icon || ''}
                addButtonLabel={t(
                  'actualites.adminThreads.modal.imagepicker.add',
                )}
                deleteButtonLabel={t(
                  'actualites.adminThreads.modal.imagepicker.delete',
                )}
                onUploadImage={handleUploadImage}
                onDeleteImage={handleDeleteImage}
                className="align-self-center mt-8"
                libraryMedia={libraryMedia}
                mediaLibraryRef={mediaLibraryRef}
              />
            </div>
            <div className="col">
              <FormControl id="title" className="mb-16" isRequired>
                <Label>{t(`actualites.adminThreads.modal.title`)}</Label>
                <Input
                  type="text"
                  defaultValue={thread?.title || ''}
                  {...register('title', {
                    required: true,
                    maxLength: DEFAULT_INPUT_MAX_LENGTH,
                    pattern: {
                      value: /[^ ]/,
                      message: t(
                        'actualites.adminThreads.modal.titleValidation',
                      ),
                    },
                  })}
                  placeholder={t(
                    'actualites.adminThreads.modal.titlePlaceholder',
                  )}
                  size="md"
                  aria-required={true}
                  maxLength={DEFAULT_INPUT_MAX_LENGTH}
                  showCounter
                />
              </FormControl>
            </div>
          </div>
          <Flex direction="column" gap="8" className="mb-24">
            <Heading headingStyle="h4" level="h3" className="mb-16">
              {t('actualites.adminThreads.modal.infoStructure.title')}
            </Heading>
            <Alert type="info">
              {t('actualites.adminThreads.modal.infoStructure.alert')}
            </Alert>
            {structureList.length > 1 && (
              <Controller
                name="structureId"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select
                    options={structureList}
                    onValueChange={field.onChange}
                    placeholderOption={t(
                      'actualites.adminThreads.modal.infoStructure.placeholder',
                    )}
                    data-testid="actualites.adminThreads.modal.selectStructure"
                    icon={<IconFilter />}
                    defaultValue={thread?.structureId || ''}
                  />
                )}
              />
            )}
          </Flex>
        </form>
      </Modal.Body>

      <Modal.Footer>
        <Button
          color="tertiary"
          onClick={handleCloseModal}
          type="button"
          variant="ghost"
          disabled={isSubmitting}
        >
          {t('actualites.adminThreads.modal.cancel')}
        </Button>
        <Button
          form={formId}
          type="submit"
          color="primary"
          isLoading={isSubmitting}
          variant="filled"
          disabled={!isValid || isSubmitting}
        >
          {thread
            ? t('actualites.adminThreads.modal.save')
            : t('actualites.adminThreads.modal.create')}
        </Button>
      </Modal.Footer>
      <MediaLibrary
        appCode={appCode}
        ref={mediaLibraryRef}
        multiple={false}
        visibility="protected"
        {...mediaLibraryHandlers}
      />
    </Modal>,
    (document.getElementById('portal') as HTMLElement) || document.body,
  );
};

export default AdminThreadModal;
