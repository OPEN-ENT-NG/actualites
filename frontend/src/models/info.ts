import { ThreadId } from './thread';

export type InfoId = number;

export type InfoOwner = {
  id: string;
  displayName: string;
  deleted?: boolean;
};

export enum InfoStatus {
  TRASH = 'TRASH', // 0
  DRAFT = 'DRAFT', // 1
  PENDING = 'PENDING', // 2
  PUBLISHED = 'PUBLISHED', // 3
}

export interface Info {
  id: InfoId;
  threadId: ThreadId;
  content: string;
  status: InfoStatus;
  owner: InfoOwner;
  /** Creation date, formatted as 'YYYY-MM-DDTHH:mm:ss' */
  created: string;
  /** Modification date, formatted as 'YYYY-MM-DDTHH:mm:ss' */
  modified: string;
  /** Publication date, formatted as 'YYYY-MM-DDTHH:mm:ss' */
  publicationDate: string | null;
  /** Expiration date, formatted as 'YYYY-MM-DDTHH:mm:ss' */
  expirationDate: string | null;
  numberOfComments: number;
  title: string;
  headline: boolean;
  sharedRights: any[];
}

export enum InfoRevisionEvent {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  SUBMIT = 'SUBMIT',
  CREATE_AND_PENDING = 'CREATE_AND_PENDING',
  CREATE_AND_PUBLISH = 'CREATE_AND_PUBLISH',
  UPDATE = 'UPDATE',
  PUBLISH = 'PUBLISH',
  UNPUBLISH = 'UNPUBLISH',
}

export interface InfoRevision {
  _id: number;
  created: string;
  title: string;
  content: string;
  contentVersion: 0 | 1;
  user_id: string;
  eventname: InfoRevisionEvent;
  username: string;
}

export interface OriginalInfo {
  _id: number;
  title: string;
  content: string;
  contentVersion: 0 | 1;
  status: 0 | 1 | 2 | 3; // see InfoStatus enum
  publication_date: string | null;
  expiration_date: string | null;
  is_headline: boolean;
  thread_id: ThreadId;
  created: string;
  modified: string;
  owner: string;
  username: string;
  thread_title: string;
  thread_icon: string;
  comments: Array<{
    _id: InfoId;
    comment: string;
    owner: string;
    created: string;
    modified: string;
    username: string;
  }> | null;
  shared: [];
}
