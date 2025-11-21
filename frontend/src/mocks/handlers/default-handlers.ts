import { HttpResponse, http } from 'msw';
import { mockUserLogged } from '../datas/users';
import { mockUserInfos } from '../datas/userinfos';

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
      result: [mockUserLogged],
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

  http.get(`/directory/userbook/${mockUserLogged.id}`, () => {
    return HttpResponse.json({
      mood: 'happy',
      health: 'good',
      alertSize: false,
      storage: 12345678,
      type: 'USERBOOK',
      userid: mockUserLogged.id,
      picture: mockUserLogged.photo,
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

  http.get(`/workspace/quota/user/${mockUserLogged.id}`, () => {
    return HttpResponse.json({ quota: 104857600, storage: 12345678 });
  }),

  http.get('/auth/oauth2/userinfo', () => {
    return HttpResponse.json(mockUserInfos);
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
