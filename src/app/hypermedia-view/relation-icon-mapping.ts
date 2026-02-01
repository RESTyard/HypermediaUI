export const relationIconMapping: { [key: string]: string } = {
  'self': 'subdirectory_arrow_right',
  'next': 'chevron_right',
  'previous': 'chevron_left',
  'prev': 'chevron_leftd',
  'first': 'first_page',
  'last': 'last_page',
  'search': 'search',
  'edit': 'edit',
  'create': 'add',
  'delete': 'close',
  'author': 'person',
  'collection': 'view_list',
  'item': 'description',
  'up': 'arrow_upward',
  'help': 'help_outline',
  'monitor': 'monitor',
  'history': 'history',
  'settings': 'settings',
  'profile': 'account_circle',
  'preview': 'preview',
  'authenticate': 'lock',
  'login': 'login',
  'logout': 'logout',
  'all': 'all_inclusive',
  'user': 'person',
  'info': 'info',
  'admin': 'admin_panel_settings',
  'selected': 'check_circle',
  'download': 'download',
  'parent': 'arrow_upward',
  'child': 'arrow_downward',
  'get': 'visibility',
  'post': 'send',
  'put': 'amend',
  'patch': 'amend',
};

export const httpMethodIconMapping: { [key: string]: string } = {
  'get': 'visibility',
  'delete': 'close',
  'post': 'send',
  'put': 'edit',
  'patch': 'amend',
};

export function getIconForRelation(relation: string): string | undefined {
  return relationIconMapping[relation.toLowerCase()];
}

export function getIconForHttpMethod(relation: string): string | undefined {
  return httpMethodIconMapping[relation.toLowerCase()];
}
