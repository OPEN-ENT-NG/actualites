import { Thread, ThreadMode } from '~/models/thread';
import { mockUserCatherine, mockUserLogged } from './users';
import { CREATE_DRAFT_RIGHT } from '~/config/rights';

//---------------------------------------
//--------------- THREADS ---------------
//---------------------------------------
const mockGroupId = '58671-1434376996066';
export const mockThreadAsOwner = {
  _id: 1,
  id: 1,
  title: 'Echange scolaire Erasmus lycée Diderot!',
  icon: null,
  mode: 0 as ThreadMode,
  created: '2025-08-07T16:33:54.698',
  modified: '2025-08-07T16:33:54.698',
  structure_id: 'de8743c1-97f0-408c-b5ec-ec735ad65fd8',
  owner: mockUserLogged.id,
  username: mockUserLogged.displayName,
  shared: [],
};

export const mockThreadAsCatherine = {
  _id: 2,
  id: 2,
  title: 'Echange scolaire Erasmus lycée Diderot!',
  icon: null,
  mode: 0 as ThreadMode,
  created: '2025-08-07T16:33:54.698',
  modified: '2025-08-07T16:33:54.698',
  structure_id: 'de8743c1-97f0-408c-b5ec-ec735ad65fd8',
  owner: mockUserCatherine.id,
  username: mockUserCatherine.displayName,
  shared: [],
};

export const mockThreadAsCatherineWithContributeRight = {
  _id: 3,
  id: 3,
  title: 'Echange scolaire Erasmus lycée Diderot!',
  icon: null,
  mode: 0 as ThreadMode,
  created: '2025-08-07T16:33:54.698',
  modified: '2025-08-07T16:33:54.698',
  structure_id: 'de8743c1-97f0-408c-b5ec-ec735ad65fd8',
  owner: mockUserCatherine.id,
  username: mockUserCatherine.displayName,
  shared: [
    {
      groupId: mockGroupId,
      [CREATE_DRAFT_RIGHT]: true,
    },
  ],
};

export const mockThreads: Array<Thread> = [
  mockThreadAsOwner,
  {
    id: 176,
    title: 'Echange scolaire Erasmus lycée Diderot!',
    icon: null,
    mode: 0 as ThreadMode,
    created: '2025-08-07T16:33:54.698',
    modified: '2025-08-07T16:33:54.698',
    structure_id: 'de8743c1-97f0-408c-b5ec-ec735ad65fd8',
    owner: '8f437f63-1115-44c3-a3a3-33531ae80d90',
    username: 'Catherine',
    shared: [
      {
        'net-atos-entng-actualites-controllers-InfoController|shareInfoSubmit': true,
        'userId': '70bf848d-222f-419a-af2b-9096ac9ec9ca',
        'net-atos-entng-actualites-controllers-InfoController|listInfosByThreadId': true,
        'net-atos-entng-actualites-controllers-InfoController|unsubmit': true,
        'net-atos-entng-actualites-controllers-InfoController|shareInfoRemove': true,
        'net-atos-entng-actualites-controllers-InfoController|updateDraft': true,
        'net-atos-entng-actualites-controllers-InfoController|createDraft': true,
        'net-atos-entng-actualites-controllers-InfoController|submit': true,
        'net-atos-entng-actualites-controllers-InfoController|shareResourceInfo': true,
        'net-atos-entng-actualites-controllers-InfoController|shareInfo': true,
        'net-atos-entng-actualites-controllers-ThreadController|getThread': true,
        'net-atos-entng-actualites-controllers-InfoController|createPending': true,
      },
    ],
  },
  {
    id: 229,
    title: 'Menus de la Cantine',
    icon: '/workspace/document/c6f373b2-46f4-47f4-8238-7fb4373f301d',
    mode: 0 as ThreadMode,
    created: '2018-10-16T16:33:21.772',
    modified: '2018-10-16T16:33:21.772',
    structure_id: null,
    owner: '13f1e9f7-7192-4f75-9a6b-c1c7eefe0280',
    username: 'Patrick',
    shared: [
      {
        'net-atos-entng-actualites-controllers-ThreadController|getThread': true,
        'groupId': '58671-1434376996066',
        'net-atos-entng-actualites-controllers-InfoController|shareInfoSubmit': true,
        'net-atos-entng-actualites-controllers-InfoController|updatePending': true,
        'net-atos-entng-actualites-controllers-InfoController|createDraft': true,
        'net-atos-entng-actualites-controllers-InfoController|shareInfoRemove': true,
        'net-atos-entng-actualites-controllers-InfoController|submit': true,
        'net-atos-entng-actualites-controllers-InfoController|publish': true,
        'net-atos-entng-actualites-controllers-InfoController|getInfoTimeline': true,
        'net-atos-entng-actualites-controllers-InfoController|createPublished': true,
        'net-atos-entng-actualites-controllers-InfoController|createPending': true,
        'net-atos-entng-actualites-controllers-InfoController|unpublish': true,
        'net-atos-entng-actualites-controllers-InfoController|listInfosByThreadId': true,
        'net-atos-entng-actualites-controllers-InfoController|unsubmit': true,
        'net-atos-entng-actualites-controllers-InfoController|updateDraft': true,
        'net-atos-entng-actualites-controllers-InfoController|updatePublished': true,
        'net-atos-entng-actualites-controllers-InfoController|shareResourceInfo': true,
        'net-atos-entng-actualites-controllers-InfoController|shareInfo': true,
      },
      {
        'net-atos-entng-actualites-controllers-InfoController|createPending': true,
        'groupId': '64164-1434444295770',
        'net-atos-entng-actualites-controllers-InfoController|listInfosByThreadId': true,
        'net-atos-entng-actualites-controllers-InfoController|unsubmit': true,
        'net-atos-entng-actualites-controllers-InfoController|updateDraft': true,
        'net-atos-entng-actualites-controllers-InfoController|updatePublished': true,
        'net-atos-entng-actualites-controllers-InfoController|shareResourceInfo': true,
        'net-atos-entng-actualites-controllers-InfoController|shareInfo': true,
        'net-atos-entng-actualites-controllers-ThreadController|getThread': true,
        'net-atos-entng-actualites-controllers-InfoController|shareInfoSubmit': true,
        'net-atos-entng-actualites-controllers-InfoController|updatePending': true,
        'net-atos-entng-actualites-controllers-InfoController|createDraft': true,
        'net-atos-entng-actualites-controllers-InfoController|shareInfoRemove': true,
        'net-atos-entng-actualites-controllers-InfoController|submit': true,
        'net-atos-entng-actualites-controllers-InfoController|publish': true,
        'net-atos-entng-actualites-controllers-InfoController|getInfoTimeline': true,
        'net-atos-entng-actualites-controllers-InfoController|createPublished': true,
        'net-atos-entng-actualites-controllers-InfoController|unpublish': true,
      },
    ],
  },
];

export const mockThreadShare = {
  actions: [
    {
      name: [
        'net-atos-entng-actualites-controllers-InfoController|unsubmit',
        'net-atos-entng-actualites-controllers-InfoController|shareInfoSubmit',
        'net-atos-entng-actualites-controllers-InfoController|shareInfoRemove',
        'net-atos-entng-actualites-controllers-InfoController|updateDraft',
        'net-atos-entng-actualites-controllers-InfoController|listInfosByThreadId',
        'net-atos-entng-actualites-controllers-InfoController|createPending',
        'net-atos-entng-actualites-controllers-InfoController|createDraft',
        'net-atos-entng-actualites-controllers-InfoController|shareInfo',
        'net-atos-entng-actualites-controllers-InfoController|shareResourceInfo',
        'net-atos-entng-actualites-controllers-InfoController|submit',
        'net-atos-entng-actualites-controllers-ThreadController|getThread',
      ],
      displayName: 'thread.contrib',
      type: 'RESOURCE',
    },
    {
      name: [
        'net-atos-entng-actualites-controllers-InfoController|getInfoTimeline',
        'net-atos-entng-actualites-controllers-InfoController|createPublished',
        'net-atos-entng-actualites-controllers-InfoController|updatePending',
        'net-atos-entng-actualites-controllers-InfoController|unpublish',
        'net-atos-entng-actualites-controllers-InfoController|updatePublished',
        'net-atos-entng-actualites-controllers-InfoController|publish',
      ],
      displayName: 'thread.publish',
      type: 'RESOURCE',
    },
    {
      name: [
        'net-atos-entng-actualites-controllers-ThreadController|shareResource',
        'net-atos-entng-actualites-controllers-ThreadController|shareThreadRemove',
        'net-atos-entng-actualites-controllers-ThreadController|shareThreadSubmit',
        'net-atos-entng-actualites-controllers-InfoController|delete',
        'net-atos-entng-actualites-controllers-ThreadController|deleteThread',
        'net-atos-entng-actualites-controllers-ThreadController|shareThread',
        'net-atos-entng-actualites-controllers-ThreadController|updateThread',
      ],
      displayName: 'thread.manager',
      type: 'RESOURCE',
    },
  ],
  groups: {
    visibles: [],
    checked: {},
  },
  users: {
    visibles: [
      {
        id: '70bf848d-222f-419a-af2b-9096ac9ec9ca',
        login: 'jack.doe',
        username: 'Jack',
        lastName: 'Doe',
        firstName: 'Jack',
        profile: 'Student',
      },
    ],
    checked: {
      '70bf848d-222f-419a-af2b-9096ac9ec9ca': [
        'net-atos-entng-actualites-controllers-InfoController|shareInfoSubmit',
        'net-atos-entng-actualites-controllers-InfoController|listInfosByThreadId',
        'net-atos-entng-actualites-controllers-InfoController|unsubmit',
        'net-atos-entng-actualites-controllers-InfoController|shareInfoRemove',
        'net-atos-entng-actualites-controllers-InfoController|updateDraft',
        'net-atos-entng-actualites-controllers-InfoController|createDraft',
        'net-atos-entng-actualites-controllers-InfoController|submit',
        'net-atos-entng-actualites-controllers-InfoController|shareResourceInfo',
        'net-atos-entng-actualites-controllers-InfoController|shareInfo',
        'net-atos-entng-actualites-controllers-ThreadController|getThread',
        'net-atos-entng-actualites-controllers-InfoController|createPending',
      ],
    },
  },
};
