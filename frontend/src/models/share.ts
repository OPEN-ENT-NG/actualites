export interface Share {
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
  rights: string[];
  owner: string;
}
