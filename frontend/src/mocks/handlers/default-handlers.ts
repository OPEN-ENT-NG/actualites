import { HttpResponse, http } from 'msw';
import { USER_MOCKED } from '..';

/**
 * DO NOT MODIFY
 */
export const defaultHandlers = [
  http.get('/userbook/preference/apps', () => {
    return HttpResponse.json({
      preference: '{"bookmarks":[],"applications":["FakeApp"]}',
    });
  }),

  http.get('/userbook/api/person', () => {
    return HttpResponse.json({
      status: 'ok',
      result: [USER_MOCKED],
    });
  }),

  http.get('/theme', () => {
    return HttpResponse.json({
      template: '/public/template/portal.html',
      logoutCallback: '',
      skin: '/assets/themes/cg771d/skins/default/',
      themeName: 'cg771d',
      skinName: 'default',
    });
  }),

  http.get('/locale', () => {
    return HttpResponse.json({ locale: 'fr' });
  }),

  http.get(`/directory/userbook/${USER_MOCKED.id}`, () => {
    return HttpResponse.json({
      mood: 'happy',
      health: 'good',
      alertSize: false,
      storage: 12345678,
      type: 'USERBOOK',
      userid: USER_MOCKED.id,
      picture: USER_MOCKED.photo,
      quota: 104857600,
      motto: 'Always Learning',
      theme: 'default',
      hobbies: ['reading', 'coding'],
    });
  }),

  http.get('/userbook/preference/language', () => {
    return HttpResponse.json({
      preference: '{"default-domain":"fr"}',
    });
  }),

  http.get(`/workspace/quota/user/${USER_MOCKED.id}`, () => {
    return HttpResponse.json({ quota: 104857600, storage: 12345678 });
  }),

  http.get('/auth/oauth2/userinfo', () => {
    return HttpResponse.json({
      classNames: null,
      level: '',
      login: 'fake.admin',
      lastName: 'Admin',
      firstName: 'Fake',
      externalId: 'abcd1234-5678-90ef-ghij-klmn1234opqr',
      federated: null,
      birthDate: '1980-01-01',
      forceChangePassword: null,
      needRevalidateTerms: false,
      deletePending: false,
      username: 'fake.user',
      type: 'ADMIN',
      hasPw: true,
      functions: {
        SUPER_ADMIN: {
          code: 'SUPER_ADMIN',
          scope: null,
        },
      },
      groupsIds: ['group1-1234567890', 'group2-0987654321'],
      federatedIDP: null,
      optionEnabled: [],
      userId: USER_MOCKED.id,
      structures: ['d4c3b2a1'],
      structureNames: ['Fake School'],
      uai: [],
      hasApp: false,
      ignoreMFA: true,
      classes: [],
      authorizedActions: [
        {
          name: 'org.entcore.fake.controllers.FoldersController|add',
          displayName: 'fake.createFolder',
          type: 'SECURED_ACTION_WORKFLOW',
        },
        {
          name: 'org.entcore.fake.controllers.FoldersController|list',
          displayName: 'fake.listFolders',
          type: 'SECURED_ACTION_WORKFLOW',
        },
        {
          name: 'org.entcore.fake.controllers.FakeController|print',
          displayName: 'fake.print',
          type: 'SECURED_ACTION_WORKFLOW',
        },
      ],
      apps: [
        {
          name: 'FakeApp',
          address: '/fake',
          icon: 'fake-large',
          target: '',
          displayName: 'fake',
          display: true,
          prefix: '/fake',
          casType: null,
          scope: [''],
          isExternal: false,
        },
      ],
      childrenIds: [],
      children: {},
      widgets: [],
      sessionMetadata: {},
    });
  }),

  http.get('/userbook/preference/rgpdCookies', () => {
    return HttpResponse.json({ preference: '{"showInfoTip":false}' });
  }),

  http.get('/applications-list', () => {
    return HttpResponse.json({
      apps: [
        {
          name: 'FakeApp',
          address: '/fake',
          icon: 'fake-large',
          target: '',
          displayName: 'fake',
          display: true,
          prefix: '/fake',
          casType: null,
          scope: [''],
          isExternal: false,
        },
      ],
    });
  }),

  http.get('/assets/theme-conf.js', () => {
    const theme = {
      overriding: [
        {
          parent: 'theme-open-ent',
          child: 'cg77',
          skins: ['default', 'dyslexic'],
          help: '/help-2d',
          bootstrapVersion: 'ode-bootstrap-neo',
          edumedia: {
            uri: 'https://www.edumedia-sciences.com',
            pattern: 'uai-token-hash-[[uai]]',
            ignoreSubjects: ['n-92', 'n-93'],
          },
          npmTheme: 'neoconnect',
        },
        {
          parent: 'panda',
          child: 'cg771d',
          skins: [
            'circus',
            'desert',
            'neutre',
            'ocean',
            'panda-food',
            'sparkly',
            'default',
            'monthly',
          ],
          help: '/help-1d',
          bootstrapVersion: 'ode-bootstrap-one',
          edumedia: {
            uri: 'https://junior.edumedia-sciences.com',
            pattern: 'uai-token-hash-[[uai]]',
          },
          npmTheme: 'oneconnect',
        },
      ],
    };

    return HttpResponse.json(theme);
  }),
];
