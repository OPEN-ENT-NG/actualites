import { Info, InfoStatus, ThreadInfoStats } from '~/models/info';
import { getFutureDate } from './helper';
import { ThreadId } from '~/models/thread';
import { mockThreads } from './threads';

//---------------------------------------
//---------------- INFOS ----------------
//---------------------------------------

export const mockInfoPublishedHeadline: Info = {
  id: 466,
  threadId: 2,
  content:
    '<p><strong><span>​Le voici ! Le jardin partagé du périscolaire ! Des groupes d&apos;enfants provenant de 11 écoles de la ville participent à créer et entretenir à tour de rôle un jardin où se mêlent fruits, légumes, fleurs et aromates. </span></strong></p><p><span>​</span></p><p><span>​Comment planter des graines ou des jeunes pousses ? Que lui faut-il pour grandir ? Comment va évoluer mon potager ? Autant de questions que se posent les enfants et qui rejoignent leur enseignement en classe sur le cycle de vie des plantes. Par exemple, </span><a target="_blank" rel="noopener noreferrer nofollow" href="/timelinegenerator#/view/c8fe320a-85a7-4c02-9951-d7ea443b5af8"><strong><span>voici la Frise Chronologique</span></strong></a><span> </span><span style="font-size: 14px">réalisée</span> par Mr Loison à l&apos;école Arthur Rimbaud.</p><p><span>​</span></p><img class="custom-image" src="https://media.istockphoto.com/id/1322277517/fr/photo/herbe-sauvage-dans-les-montagnes-au-coucher-du-soleil.jpg?s=612x612&w=0&k=20&c=tQ19uZQLlIFy8J6QWMyOL6lPt3pdSHBSDFHoXr1K_g0=" width="350" height="NaN"><p><span>​En complément du blog du périscolaire, ce beau projet fait l&apos;objet d&apos;un Cahier multimédia à lui tout seul ! Pour découvrir et suivre nos belles aventures, feuilletez le </span><a target="_blank" rel="noopener noreferrer nofollow" href="/scrapbook#/view-scrapbook/f682ec87-4e86-4b75-8ca2-d9e6f4a7b88d"><strong><span>en cliquant ici</span></strong></a><span>. </span></p><p><span>​</span></p><p><span>​ ​</span></p><img class="custom-image" src="https://media.istockphoto.com/id/1322277517/fr/photo/herbe-sauvage-dans-les-montagnes-au-coucher-du-soleil.jpg?s=612x612&w=0&k=20&c=tQ19uZQLlIFy8J6QWMyOL6lPt3pdSHBSDFHoXr1K_g0=" width="350" height="NaN"><p><span>     ​</span></p><img class="custom-image" src="https://media.istockphoto.com/id/1322277517/fr/photo/herbe-sauvage-dans-les-montagnes-au-coucher-du-soleil.jpg?s=612x612&w=0&k=20&c=tQ19uZQLlIFy8J6QWMyOL6lPt3pdSHBSDFHoXr1K_g0=" width="350" height="NaN"><img class="custom-image" src="https://media.istockphoto.com/id/1322277517/fr/photo/herbe-sauvage-dans-les-montagnes-au-coucher-du-soleil.jpg?s=612x612&w=0&k=20&c=tQ19uZQLlIFy8J6QWMyOL6lPt3pdSHBSDFHoXr1K_g0=" width="350" height="NaN"><p><span>  </span><br></p>',
  contentVersion: 1,
  previousContentVersion: 0,
  status: InfoStatus.PUBLISHED,
  owner: {
    id: '8f437f63-1115-44c3-a3a3-33531ae80d90',
    displayName: 'Catherine',
    deleted: false,
  },
  created: '2025-08-07T16:40:58.693',
  modified: '2025-08-07T16:40:58.693',
  publicationDate: '2025-08-07T00:00:00.000',
  expirationDate: null,
  numberOfComments: 0,
  title: 'Voici une actualité mise en avant',
  headline: true,
  sharedRights: [],
};

export const mockInfoPublished: Info = {
  id: 468,
  threadId: 2,
  content:
    '<img class="custom-image" src="https://media.istockphoto.com/id/1322277517/fr/photo/herbe-sauvage-dans-les-montagnes-au-coucher-du-soleil.jpg?s=612x612&w=0&k=20&c=tQ19uZQLlIFy8J6QWMyOL6lPt3pdSHBSDFHoXr1K_g0=" width="350" height="NaN"><p><strong><span>​Le voici ! Le jardin partagé du périscolaire ! Des groupes d&apos;enfants provenant de 11 écoles de la ville participent à créer et entretenir à tour de rôle un jardin où se mêlent fruits, légumes, fleurs et aromates. </span></strong></p><p><span>​</span></p><p><span>​Comment planter des graines ou des jeunes pousses ? Que lui faut-il pour grandir ? Comment va évoluer mon potager ? Autant de questions que se posent les enfants et qui rejoignent leur enseignement en classe sur le cycle de vie des plantes. Par exemple, </span><a target="_blank" rel="noopener noreferrer nofollow" href="/timelinegenerator#/view/c8fe320a-85a7-4c02-9951-d7ea443b5af8"><strong><span>voici la Frise Chronologique</span></strong></a><span> </span><span style="font-size: 14px">réalisée</span> par Mr Loison à l&apos;école Arthur Rimbaud.</p><p><span>​</span></p><p><span>​En complément du blog du périscolaire, ce beau projet fait l&apos;objet d&apos;un Cahier multimédia à lui tout seul ! Pour découvrir et suivre nos belles aventures, feuilletez le </span><a target="_blank" rel="noopener noreferrer nofollow" href="/scrapbook#/view-scrapbook/f682ec87-4e86-4b75-8ca2-d9e6f4a7b88d"><strong><span>en cliquant ici</span></strong></a><span>. </span></p><p><span>​</span></p><p><span>​ ​</span></p><img class="custom-image" src="https://media.istockphoto.com/id/1322277517/fr/photo/herbe-sauvage-dans-les-montagnes-au-coucher-du-soleil.jpg?s=612x612&w=0&k=20&c=tQ19uZQLlIFy8J6QWMyOL6lPt3pdSHBSDFHoXr1K_g0=" width="350" height="NaN"><p><span>     ​</span></p><img class="custom-image" src="https://media.istockphoto.com/id/1322277517/fr/photo/herbe-sauvage-dans-les-montagnes-au-coucher-du-soleil.jpg?s=612x612&w=0&k=20&c=tQ19uZQLlIFy8J6QWMyOL6lPt3pdSHBSDFHoXr1K_g0=" width="350" height="NaN"><img class="custom-image" src="https://media.istockphoto.com/id/1322277517/fr/photo/herbe-sauvage-dans-les-montagnes-au-coucher-du-soleil.jpg?s=612x612&w=0&k=20&c=tQ19uZQLlIFy8J6QWMyOL6lPt3pdSHBSDFHoXr1K_g0=" width="350" height="NaN"><p><span>  </span><br></p>',
  contentVersion: 1,
  previousContentVersion: 1,
  status: InfoStatus.PUBLISHED,
  owner: {
    id: '8f437f63-1115-44c3-a3a3-33531ae80d90',
    displayName: 'Catherine',
    deleted: false,
  },
  created: '2025-08-07T16:40:58.693',
  modified: '2025-08-07T16:40:58.693',
  publicationDate: '2025-08-07T00:00:00.000',
  expirationDate: null,
  numberOfComments: 0,
  title: 'Voici une actualité publiée',
  headline: false,
  sharedRights: [],
};

export const mockInfoPublishedDraft: Info = {
  id: 575,
  threadId: 1,
  content: '<div>coucou Draft </div>',
  contentVersion: 1,
  previousContentVersion: 0,
  status: InfoStatus.DRAFT,
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
  title: 'Echange scolaire présentation des élèves!',
  headline: false,
  sharedRights: [],
};

export const mockInfoIncoming: Info = {
  id: 577,
  threadId: 1,
  content: '<div>coucou incoming </div>',
  contentVersion: 0,
  previousContentVersion: 0,
  status: InfoStatus.PUBLISHED,
  owner: {
    id: '9154558e-1c94-4fc6-8347-1c493e422ad6',
    displayName: 'Luc',
    deleted: false,
  },
  created: '2025-08-22T15:43:08.152',
  modified: '2025-08-22T15:43:08.152',
  publicationDate: getFutureDate(2),
  expirationDate: null,
  numberOfComments: 0,
  title: 'Voici une actualité à venir',
  headline: false,
  sharedRights: [],
};

export const mockInfoExpired: Info = {
  id: 572,
  threadId: 1,
  content: '<div>coucou expired </div>',
  contentVersion: 0,
  previousContentVersion: 0,
  status: InfoStatus.PUBLISHED,
  owner: {
    id: '9154558e-1c94-4fc6-8347-1c493e422ad6',
    displayName: 'Luc',
    deleted: false,
  },
  created: '2025-08-22T15:43:08.152',
  modified: '2025-08-22T15:43:08.152',
  publicationDate: '2024-08-22T15:43:08.152',
  expirationDate: '2025-03-22T15:43:08.152',
  numberOfComments: 0,
  title: 'Echange scolaire présentation des élèves!',
  headline: false,
  sharedRights: [],
};

export const mockInfos: Info[] = [
  mockInfoPublishedHeadline,
  mockInfoPublished,
  mockInfoPublishedDraft,
  mockInfoIncoming,
  mockInfoExpired,
];

export const mockInfosPublished: Info[] = [
  mockInfoPublishedHeadline,
  mockInfoPublished,
];

export const mockInfosExpired: Info[] = [mockInfoExpired];

export const mockInfosIncoming: Info[] = [mockInfoIncoming];

export const mockInfosDraft: Info[] = [mockInfoPublishedDraft];

export const mockOriginalInfo = {
  _id: 575,
  title: 'coucou',
  content: '<div>coucou</div>',
  status: 3,
  publication_date: null,
  expiration_date: null,
  is_headline: false,
  thread_id: 1,
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

export const mockThreadInfoStats = (threadId: ThreadId): ThreadInfoStats => {
  return {
    id: threadId,
    status: {
      [InfoStatus.DRAFT]: mockInfosDraft.length,
      [InfoStatus.TRASH]: 0, // TODO: add mockInfosTrash
      [InfoStatus.PENDING]: 0, // TODO: add mockInfosPending
      [InfoStatus.PUBLISHED]: mockInfosPublished.length,
    },
    expiredCount: mockInfosExpired.length,
    incomingCount: mockInfosIncoming.length,
  };
};

export const mockInfosStats = {
  threads: mockThreads.map((thread) => mockThreadInfoStats(thread.id)),
};
