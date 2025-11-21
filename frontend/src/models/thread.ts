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
  /** ID of the structure this thread is attached to. */
  structure_id: string | null;
  /** ID of the user who created this thread. */
  owner: string;
  /** Name of the user who created this thread. */
  username: string;
  /** 
    Shared rights for the thread.
    Example: [
            "thread.publish",
            "thread.manager",
            "thread.contrib"
        ]
    */
  sharedRights?: Array<string>;
}
