import { Thread } from '~/models/thread';

//---------------------------------------
//--------------- THREADS ---------------
//---------------------------------------
export const mockThreads: Array<Thread> = [
  {
    _id: 1,
    title: 'Pour la rentrée',
    icon: null,
    mode: 0,
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
    _id: 2,
    title: 'Menus de la Cantine',
    icon: '/workspace/document/c6f373b2-46f4-47f4-8238-7fb4373f301d',
    mode: 0,
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

//---------------------------------------
//---------------- INFOS ----------------
//---------------------------------------
export const mockInfos = [
  {
    id: 466,
    threadId: 229,
    content:
      '<div class="ng-scope" style="text-align: center;">Je passe à React !</div>',
    contentVersion: 1,
    status: 'PUBLISHED',
    owner: {
      id: '8f437f63-1115-44c3-a3a3-33531ae80d90',
      displayName: 'Catherine',
      deleted: false,
    },
    created: '2025-08-07T16:40:58.693',
    modified: '2025-08-07T16:40:58.693',
    publicationDate: '2025-08-07T00:00:00.000',
    expirationDate: '2025-08-28T00:00:00.000',
    numberOfComments: 0,
    title: 'Bientôt',
    headline: true,
    sharedRights: [],
  },
  {
    id: 575,
    threadId: 176,
    content: '<div>coucou</div>',
    contentVersion: 1,
    status: 'PUBLISHED',
    owner: {
      id: '9154558e-1c94-4fc6-8347-1c493e422ad6',
      displayName: 'Luc',
      deleted: false,
    },
    created: '2025-08-22T15:43:08.152',
    modified: '2025-08-22T15:43:08.152',
    publicationDate: null,
    expirationDate: null,
    numberOfComments: 0,
    title: 'coucou',
    headline: false,
    sharedRights: [],
  },
];

export const mockOriginalInfo = {
  _id: 575,
  title: 'coucou',
  content: '<div>coucou</div>',
  status: 3,
  publication_date: null,
  expiration_date: null,
  is_headline: false,
  thread_id: 176,
  created: '2025-08-22T15:43:08.152',
  modified: '2025-08-22T15:43:08.152',
  owner: '9154558e-1c94-4fc6-8347-1c493e422ad6',
  username: 'Luc',
  thread_title: 'Le périscolaire',
  thread_icon: '/workspace/document/c6f373b2-46f4-47f4-8238-7fb4373f301d',
  comments: null,
  shared: [],
};

export const mockInfoShare = {
  actions: [
    {
      name: [
        'net-atos-entng-actualites-controllers-CommentController|deleteComment',
        'net-atos-entng-actualites-controllers-CommentController|updateComment',
        'net-atos-entng-actualites-controllers-CommentController|comment',
      ],
      displayName: 'info.comment',
      type: 'RESOURCE',
    },
    {
      name: [
        'net-atos-entng-actualites-controllers-InfoController|getSingleInfo',
        'net-atos-entng-actualites-controllers-InfoController|getInfo',
        'net-atos-entng-actualites-controllers-InfoController|getInfoComments',
        'net-atos-entng-actualites-controllers-InfoController|getInfoShared',
      ],
      displayName: 'info.read',
      type: 'RESOURCE',
    },
  ],
  groups: {
    visibles: [
      {
        id: '1347-1429810574274',
        name: 'Enseignants du groupe 1COM1.',
        groupDisplayName: null,
        structureName: 'LYCEE PAUL',
      },
    ],
    checked: {
      '1347-1429810574274': [
        'net-atos-entng-actualites-controllers-CommentController|deleteComment',
        'net-atos-entng-actualites-controllers-InfoController|getInfo',
        'net-atos-entng-actualites-controllers-InfoController|getSingleInfo',
        'net-atos-entng-actualites-controllers-InfoController|getInfoComments',
        'net-atos-entng-actualites-controllers-CommentController|updateComment',
        'net-atos-entng-actualites-controllers-InfoController|getInfoShared',
        'net-atos-entng-actualites-controllers-CommentController|comment',
      ],
    },
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
    checked: {},
  },
};

export const mockInfoRevisions = [
  {
    _id: 551,
    created: '2024-07-31T12:11:49.696',
    title: 'Bonne rentrée 2025 à tous !',
    content: '<div>Cher.e.s tou.te.s, Cordialement,</div>',
    contentVersion: 1,
    user_id: '13f1e9f7-7192-4f75-9a6b-c1c7eefe0280',
    eventname: 'UPDATE',
    username: 'Patrick',
  },
  {
    _id: 549,
    created: '2024-07-30T17:34:05.159',
    title: 'Bonne rentrée 2025 à tous !',
    content:
      '<div>Chères familles, chers enseignants, chers élèves... Cordialement,</div>\n',
    contentVersion: 0,
    user_id: '13f1e9f7-7192-4f75-9a6b-c1c7eefe0280',
    eventname: 'CREATE_AND_PUBLISH',
    username: 'Patrick',
  },
];

//---------------------------------------
//--------------- COMMENTS --------------
//---------------------------------------
export const mockComments = [
  {
    _id: 1,
    comment: 'Trop bien !',
    owner: '28f06d0d-e6f6-41b9-91db-4c1c813d355f',
    created: '2025-08-26T11:47:34.115',
    modified: '2025-08-26T11:47:34.115',
    username: 'Michael',
    info_id: 123,
  },
];
