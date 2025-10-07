import {
  ButtonSkeleton,
  Flex,
  FormControl,
  Switch,
  TextSkeleton,
  useBreakpoint,
} from '@edifice.io/react';
import { EditorSkeleton } from '@edifice.io/react/editor';
import { ThreadId } from '~/models/thread';
import './CreateInfoForm.css';

export interface InfoParams {
  threadId?: ThreadId;
  title: string;
  headline: boolean;
  content: string;
}

export function CreateInfoFormSkeleton() {
  const { md } = useBreakpoint();

  return (
    <>
      <Flex
        direction={md ? 'row' : 'column'}
        gap="24"
        align={md ? 'center' : 'stretch'}
        className="col-12 mt-24"
        wrap="nowrap"
      >
        <FormControl id="threadId" className="col-12 col-md-5" isRequired>
          <TextSkeleton className="col-5" />
          <TextSkeleton size="lg" className="w-100" />
        </FormControl>
        <FormControl id={'title'} className="flex-fill" isRequired>
          <TextSkeleton className="col-5" />
          <TextSkeleton size="lg" className="w-100" />
        </FormControl>
      </Flex>
      <FormControl id={'headline'}>
        <Flex align="center" gap="8" className="mt-24">
          <Switch disabled />
          <TextSkeleton className="col-4" />
        </Flex>
      </FormControl>
      <FormControl id={'content'} className="mt-24" isRequired>
        <TextSkeleton className="col-4" />
        <EditorSkeleton mode="edit" />
      </FormControl>
      <Flex
        direction={md ? 'row' : 'column-reverse'}
        justify="end"
        align={md ? 'center' : 'end'}
        className="pt-24"
        gap="12"
      >
        <ButtonSkeleton className="col-1" />
        <Flex gap="12" className="col-4 me-12">
          <ButtonSkeleton className="col-6" />
          <ButtonSkeleton className="col-6" />
        </Flex>
      </Flex>
    </>
  );
}
