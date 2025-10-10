import {
  Flex,
  FormControl,
  Switch,
  TextSkeleton,
  useBreakpoint,
} from '@edifice.io/react';
import { EditorSkeleton } from '@edifice.io/react/editor';
import { ThreadId } from '~/models/thread';
import './InfoDetailsForm.css';

export interface InfoParams {
  threadId?: ThreadId;
  title: string;
  headline: boolean;
  content: string;
}

export function InfoFormSkeleton() {
  const { md } = useBreakpoint();

  return (
    <Flex direction="column" gap="24">
      <Flex
        direction={md ? 'row' : 'column'}
        gap="24"
        align={md ? 'center' : 'stretch'}
        className="col-12"
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
        <Flex align="center" gap="8">
          <Switch disabled />
          <TextSkeleton className="col-4" />
        </Flex>
      </FormControl>
      <FormControl id={'content'} isRequired>
        <TextSkeleton className="col-4" />
        <EditorSkeleton mode="edit" />
      </FormControl>
    </Flex>
  );
}
