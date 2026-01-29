export enum ThreadMode {
  SUBMIT = 0,
  DIRECT = 1,
}
export enum ThreadStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  PUBLISHED = 'published',
  TRASH = 'trash',
}
export enum ThreadFilters {
  PUBLIC = 0,
  ALL = 1,
  STATES = 2,
}
export enum ThreadTypes {
  LATEST = 0,
}

export type ThreadOwner = {
  id: string;
  displayName: string;
  deleted?: boolean;
};

export type ThreadId = number;

export interface Thread {
  id: ThreadId;
  title: string;
  /** URL of the icon of this thread.*/
  icon: string | null;
  /** Publish mode. */
  mode: ThreadMode;
  /** Creation date, formatted as 'YYYY-MM-DDTHH:mm:ss' */
  created: string;
  /** Modification date, formatted as 'YYYY-MM-DDTHH:mm:ss' */
  modified: string;
  /**
   * Structure object this thread is attached to.
   */
  structure?: {
    id: string;
    name: string;
  } | null;
  /** ID of the structure this thread is attached to. */
  structureId?: string | null;
  /** User who created this thread. */
  owner: ThreadOwner;
  /** 
    Shared rights for the thread.
    Example: [
            "thread.publish",
            "thread.manager",
            "thread.contrib"
        ]
    */
  sharedRights?: Array<string>;
  /** Visibility of the thread. */
  visible: boolean;
}

export interface ThreadPayload {
  mode: ThreadMode;
  title: string;
  icon?: string;
  structure: {
    id: string;
  };
}

export interface ThreadQueryPayload extends ThreadPayload {
  structure: {
    id: string;
    name: string;
  };
}

export interface ThreadPreference {
  threadId: number;
  visible: boolean;
}

export interface ThreadPreferences {
  threads: ThreadPreference[];
}
