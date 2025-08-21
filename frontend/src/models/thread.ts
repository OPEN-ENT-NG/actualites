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

export interface Thread {
  _id: number;
  title: string;
  /** URL of the icon of this trhead.*/
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
     * Old shared rights, such as
       [{
            "groupId": "58671-1434376996066",
            "net-atos-entng-actualites-controllers-ThreadController|getThread": true,
            "net-atos-entng-actualites-controllers-InfoController|shareInfoSubmit": true
        }]
     */
  shared?: Array<any>;
}

export type ThreadId = Thread['_id'];

export interface ThreadShares {
  actions: Array<{
    name: Array<string>;
    displayName: string;
    type: 'RESOURCE';
  }>;
  groups: {
    visibles: Array<{
      id: string;
      name: string;
      groupDisplayName: null | string;
      structureName: string;
    }>;
    checked: { [right: string]: Array<string> };
  };
  users: {
    visibles: Array<{
      id: string;
      login: string;
      username: string;
      lastName: string;
      firstName: string;
      profile: string;
    }>;
    checked: { [right: string]: Array<string> };
  };
}
