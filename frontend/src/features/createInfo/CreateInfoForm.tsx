import { useI18n } from '~/hooks/useI18n';

import { AppIconSize, Button, Flex, useBreakpoint } from '@edifice.io/react';
import { Editor, EditorInstance } from '@edifice.io/react/editor';
import {
  IconArrowRight,
  IconQuestion,
  IconSave,
} from '@edifice.io/react/icons';
import { Form, Input, Select, Switch } from 'antd';
import { DefaultOptionType } from 'antd/es/select';
import { useEffect, useState } from 'react';
import { ThreadIcon } from '~/components/ThreadIcon';
import { useThreads } from '~/services/queries';
import './CreateInfoForm.css';

export function CreateInfoForm() {
  const { t } = useI18n();
  const { data: threads } = useThreads();
  const { md } = useBreakpoint();
  const [submittable, setSubmittable] = useState<boolean>(false);

  const [form] = Form.useForm();
  // Watch all values
  const values = Form.useWatch([], form);

  // Watch form changes to enable/disable submit button
  useEffect(() => {
    form
      .validateFields({ validateOnly: true })
      .then(() => setSubmittable(true))
      .catch(() => setSubmittable(false));
  }, [form, values]);

  const iconSize: AppIconSize = '24';

  const items: DefaultOptionType[] = threads ? [threads[0]] : [];
  // threads?.map((thread: Thread) => ({
  //   value: thread._id,
  //   label: thread.title,
  // })) || [];

  if (!threads || threads.length === 0) {
    // skeleton loading
    return null;
  }

  const customizeRequiredMark = (
    label: React.ReactNode,
    { required }: { required: boolean },
  ) => (
    <>
      {label}
      {required && <span className="text-red-500 ps-4">*</span>}
    </>
  );

  const handleEditorChange = ({ editor }: { editor: EditorInstance }) => {
    form.setFieldValue(
      'content',
      editor.isEmpty ? undefined : editor.getHTML(),
    );
    form.validateFields(['content']);
  };

  return (
    <>
      <Form
        form={form}
        onFinish={(values) => {
          console.log('Form values:', values);
        }}
        name="create-info-form"
        layout="vertical"
        requiredMark={customizeRequiredMark}
        className="d-flex flex-column mt-24"
        initialValues={{
          headline: false,
          threadId: undefined,
          title: '',
          content: '',
        }} // if only one thread, select it by default
      >
        <Flex
          fill
          direction={md ? 'row' : 'column'}
          gap={md ? '24' : ''}
          align={md ? 'center' : 'stretch'}
          className="col-12"
          wrap="nowrap"
        >
          <Form.Item
            label={t('actualites.info.createForm.selectThreadLabel')}
            rules={[
              {
                required: true,
                message: t('actualites.info.createForm.required'),
              },
            ]}
            name={'threadId'}
            className="col-12 col-md-5"
          >
            {items?.length > 1 ? (
              <Select
                placeholder={
                  <Flex align="center" gap="8" className="text-gray-800">
                    <IconQuestion width={iconSize} height={iconSize} />
                    {t('actualites.info.createForm.selectThreadPlaceholder')}
                  </Flex>
                }
                options={items}
                labelRender={(props) => (
                  <Flex align="center" gap="8">
                    <ThreadIcon
                      thread={threads.find((t) => t.id === props.value)}
                      iconSize={iconSize}
                    />
                    <div>{props.label}</div>
                  </Flex>
                )}
                optionRender={(props) => (
                  <Flex align="center" gap="8">
                    <ThreadIcon
                      thread={threads.find((t) => t.id === props.value)}
                      iconSize={iconSize}
                    />
                    <div>{props.label}</div>
                  </Flex>
                )}
              />
            ) : (
              <Flex align="center" gap="8" className="border rounded py-4 px-8">
                <ThreadIcon thread={threads[0]} iconSize={iconSize} />
                <span>{threads[0]?.title}</span>
              </Flex>
            )}
          </Form.Item>
          <Form.Item
            name={'title'}
            label={t('actualites.info.createForm.titleLabel')}
            className="flex-fill"
            rules={[
              {
                required: true,
                message: t('actualites.info.createForm.required'),
              },
            ]}
          >
            <Input
              type="text"
              placeholder={t('actualites.info.createForm.titlePlaceholder')}
              showCount
              maxLength={60}
            />
          </Form.Item>
        </Flex>
        <Form.Item name={'headline'}>
          <Flex align="center" gap="8">
            <Switch className="ant-switch-outlined" />
            <label>{t('actualites.info.createForm.headlineLabel')}</label>
          </Flex>
        </Form.Item>
        <Form.Item
          label={t('actualites.info.createForm.contentLabel')}
          name={'content'}
          rules={[
            {
              required: true,
              message: t('actualites.info.createForm.required'),
            },
          ]}
        >
          <Flex>
            <Editor
              content={''}
              mode="edit"
              id="info-content"
              onContentChange={handleEditorChange}
            />
          </Flex>
        </Form.Item>
        <Flex
          direction={md ? 'row' : 'column'}
          justify="end"
          className="pt-16"
          gap="12"
        >
          <Button color="primary" variant="ghost" leftIcon={<IconSave />}>
            {t('actualites.info.createForm.cancel')}
          </Button>
          <Button color="primary" variant="outline" leftIcon={<IconSave />}>
            {t('actualites.info.createForm.saveDraft')}
          </Button>
          <Button
            color="primary"
            rightIcon={<IconArrowRight />}
            disabled={!submittable}
          >
            {t('actualites.info.createForm.nextStep')}
          </Button>
        </Flex>
      </Form>
    </>
  );
}
