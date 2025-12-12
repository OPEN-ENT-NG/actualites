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

interface AdminNewThreadModalProps {
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

export const AdminNewThreadModal = ({
  isOpen,
  onCancel,
  onSuccess,
  thread,
}: AdminNewThreadModalProps) => {
  const { t } = useI18n();
  const { appCode, user, currentApp } = useEdificeClient();
  const formId = useId();

  const { mutate: createThread } = useCreateThread();
  const { mutate: updateThread } = useUpdateThread();
  const [icon, setIcon] = useState<string>(thread?.icon || '');
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
    formState: { isSubmitting, isValid },
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
    try {
      const data: ThreadQueryPayload = {
        mode: ThreadMode.SUBMIT,
        title: formData.title,
        structure: {
          id: formData.structureId ?? undefined,
          name:
            formData.structureId
              ? structureList.find((s) => s.value === formData.structureId)?.label
              : undefined,
        },
        icon,
      };
      if (!thread?.id) {
        createThread(data, {
          onSuccess: () => {
            reset();
            onSuccess();
          },
        });
      } else {
        updateThread(
          { threadId: thread.id, payload: data },
          {
            onSuccess: () => {
              reset();
              onSuccess();
            },
          },
        );
      }
    } catch (e) {
      console.error(e);
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
        {t(`actualites.adminThreads.newThread.modalTitle`)}
      </Modal.Header>

      <Modal.Body>
        <Heading headingStyle="h4" level="h3" className="mb-16">
          {t('actualites.adminThreads.newThread.details')}
        </Heading>

        <form id={formId} onSubmit={handleSubmit(onSubmit)}>
          <div className="d-block d-md-flex gap-16 mb-24">
            <div>
              <ImagePicker
                app={currentApp}
                src={icon || ''}
                addButtonLabel={t('explorer.imagepicker.button.add')}
                deleteButtonLabel={t('explorer.imagepicker.button.delete')}
                onUploadImage={handleUploadImage}
                onDeleteImage={handleDeleteImage}
                className="align-self-center mt-8"
                libraryMedia={libraryMedia}
                mediaLibraryRef={mediaLibraryRef}
              />
            </div>
            <div className="col">
              <FormControl id="title" className="mb-16" isRequired>
                <Label>{t(`actualites.adminThreads.newThread.title`)}</Label>
                <Input
                  type="text"
                  defaultValue={thread?.title || ''}
                  {...register('title', {
                    required: true,
                    maxLength: DEFAULT_INPUT_MAX_LENGTH,
                    pattern: {
                      value: /[^ ]/,
                      message: t(
                        'actualites.adminThreads.newThread.titleValidation',
                      ),
                    },
                  })}
                  placeholder={t(
                    'explorer.resource.editModal.title.placeholder',
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
              {t('actualites.adminThreads.newThread.infoStructure.title')}
            </Heading>
            <Alert type="info">
              {t('actualites.adminThreads.newThread.infoStructure.alert')}
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
                      'actualites.adminThreads.newThread.infoStructure.placeholder',
                    )}
                    data-testid="actualites.adminThreads.newThread.selectStructure"
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
        >
          {t('explorer.cancel')}
        </Button>
        <Button
          form={formId}
          type="submit"
          color="primary"
          isLoading={isSubmitting}
          variant="filled"
          disabled={!isValid || isSubmitting}
        >
          {thread ? t('explorer.create') : t('save')}
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

export default AdminNewThreadModal;
