import {
  THREAD_CONTRIBUTOR,
  THREAD_MANAGER,
  THREAD_PUBLISHER,
} from '~/config/rights';
import { Thread, ThreadMode } from '~/models/thread';
import { mockUserCatherine, mockUserLogged } from './users';

//---------------------------------------
//--------------- THREADS ---------------
//---------------------------------------

export const mockThreadAsOwner = {
  id: 1,
  title: 'Menus de Stéphane !',
  icon: null,
  mode: 0 as ThreadMode,
  created: '2025-08-07T16:33:54.698',
  modified: '2025-08-07T16:33:54.698',
  structure: {
    id: 'de8743c1-97f0-408c-b5ec-ec735ad65fd8',
    name: 'Lycée Diderot',
  },
  structureId: 'de8743c1-97f0-408c-b5ec-ec735ad65fd8',
  owner: { id: mockUserLogged.id, displayName: mockUserLogged.displayName },
  sharedRights: [THREAD_MANAGER, THREAD_CONTRIBUTOR, THREAD_PUBLISHER],
};

export const mockThreadAsOwnerWithNoStructure = {
  id: 4,
  title: 'Menus de Noël !',
  icon: null,
  mode: 0 as ThreadMode,
  created: '2025-08-07T16:33:54.698',
  modified: '2025-08-07T16:33:54.698',
  owner: { id: mockUserLogged.id, displayName: mockUserLogged.displayName },
  sharedRights: [THREAD_MANAGER, THREAD_CONTRIBUTOR, THREAD_PUBLISHER],
};

export const mockThreadAsCatherine = {
  id: 2,
  title: 'Echange scolaire de Catherine!',
  icon: null,
  mode: 0 as ThreadMode,
  created: '2025-08-07T16:33:54.698',
  modified: '2025-08-07T16:33:54.698',
  structure: {
    id: 'de8743c1-97f0-408c-b5ec-ec735ad65fd8',
    name: 'Lycée Diderot',
  },
  structureId: 'de8743c1-97f0-408c-b5ec-ec735ad65fd8',
  owner: {
    id: mockUserCatherine.id,
    displayName: mockUserCatherine.displayName,
  },
  sharedRights: [],
};

export const mockThreadAsCatherineWithContributeRight = {
  id: 3,
  title: 'Echange scolaire lycée Diderot de Catherine!',
  icon: null,
  mode: 0 as ThreadMode,
  created: '2025-08-07T16:33:54.698',
  modified: '2025-08-07T16:33:54.698',
  structure: {
    id: 'de8743c1-97f0-408c-b5ec-ec735ad65fd8',
    name: 'Lycée Diderot',
  },
  structureId: 'de8743c1-97f0-408c-b5ec-ec735ad65fd8',
  owner: {
    id: mockUserCatherine.id,
    displayName: mockUserCatherine.displayName,
  },
  sharedRights: [THREAD_CONTRIBUTOR],
};

// TODO Clean this mock
export const mockThreads: Array<Thread> = [
  mockThreadAsOwner,
  mockThreadAsOwnerWithNoStructure,
  mockThreadAsCatherine,
  mockThreadAsCatherineWithContributeRight,
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
