import { expect, test } from '@playwright/test';

const api = 'https://api.test';
const siren = 'application/vnd.siren+json';

const entryPoint = {
  class: ['DemoEntryPoint'],
  title: 'Demo API',
  properties: {
    welcome: 'Navigate using hypermedia',
    details: { searchableProperty: 'needle-value' },
  },
  links: [
    { rel: ['customer'], href: `${api}/customers/42` },
    { rel: ['plain-json'], href: `${api}/documents/data`, type: 'application/json' },
    { rel: ['plain-text'], href: `${api}/documents/readme`, type: 'text/plain' },
    { rel: ['image'], href: `${api}/documents/logo`, type: 'image/png' },
  ],
  entities: [
    {
      rel: ['summary'],
      class: ['Summary'],
      title: 'Embedded summary',
      properties: { status: 'ready' },
    },
    {
      rel: ['customer-reference'],
      class: ['Customer'],
      title: 'Linked customer',
      href: `${api}/customers/42`,
    },
  ],
  actions: [],
};

const customer = {
  class: ['Customer'],
  title: 'Customer 42',
  properties: { name: 'Ada Lovelace', address: { city: 'London', postcode: 'N1' } },
  links: [{ rel: ['self'], href: `${api}/customers/42` }],
  entities: [],
  actions: [
    {
      name: 'activate', title: 'Activate customer', method: 'POST', href: `${api}/customers/42/activate`, type: 'application/json',
    },
    {
      name: 'changeAddress', title: 'Change address', method: 'PUT', href: `${api}/customers/42/address`, type: 'application/json',
      fields: [{ name: 'address', type: 'application/json', class: [`${api}/schemas/address`] }],
    },
    {
      name: 'uploadAvatar', title: 'Upload avatar', method: 'POST', href: `${api}/customers/42/avatar`, type: 'multipart/form-data',
      fields: [{ name: 'file', type: 'file', accept: 'text/plain' }],
    },
  ],
};

async function installApi(page: import('@playwright/test').Page) {
  await page.route(`${api}/**`, async route => {
    const request = route.request();
    const url = new URL(request.url());
    const json = (body: object, status = 200) => route.fulfill({
      status,
      contentType: siren,
      body: JSON.stringify(body),
    });

    if (request.method() === 'GET') {
      switch (url.pathname) {
        case '/entrypoint': return json(entryPoint);
        case '/customers/42': return json(customer);
        case '/schemas/address': return route.fulfill({
          contentType: 'application/json',
          body: JSON.stringify({
            type: 'object', required: ['street'], properties: { street: { type: 'string' }, city: { type: 'string' } },
          }),
        });
        case '/documents/data': return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ document: 'ordinary JSON' }) });
        case '/documents/readme': return route.fulfill({ contentType: 'text/plain', body: 'Hello from plain text' });
        case '/documents/logo': return route.fulfill({
          contentType: 'image/png',
          body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64'),
        });
      }
    }

    if (url.pathname === '/customers/42/activate') {
      expect(request.method()).toBe('POST');
      expect(request.postData()).toBeNull();
      return json({}, 204);
    }
    if (url.pathname === '/customers/42/address') {
      expect(request.method()).toBe('PUT');
      expect(request.postDataJSON()).toEqual([{ address: { street: '12 Analytical Engine Way', city: 'London' } }]);
      return json({}, 204);
    }
    if (url.pathname === '/customers/42/avatar') {
      expect(request.method()).toBe('POST');
      expect(await request.headerValue('content-type')).toContain('multipart/form-data; boundary=');
      expect(request.postData()).toContain('avatar.txt');
      expect(request.postData()).toContain('avatar content');
      return json({}, 204);
    }

    throw new Error(`Unhandled API request: ${request.method()} ${request.url()}`);
  });
}

async function openEntryPoint(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.getByPlaceholder('Enter API entrypoint URL').fill(`${api}/entrypoint`);
  await page.getByRole('button', { name: 'Enter API' }).click();
  await expect(page.getByText('Demo API', { exact: true })).toBeVisible();
}

test.beforeEach(async ({ page }) => installApi(page));

test('navigates from an entry point to a linked entity', async ({ page }) => {
  await openEntryPoint(page);
  await page.getByRole('link', { name: 'customer' }).click();
  await expect(page.getByText('Customer 42', { exact: true })).toBeVisible();
  await expect(page.getByText('Ada Lovelace', { exact: true })).toBeVisible();
});

test('executes parameterless and parameterized entity actions', async ({ page }) => {
  await openEntryPoint(page);
  await page.getByRole('link', { name: 'customer' }).click();

  await page.getByRole('button', { name: 'Activate customer' }).click();
  await expect(page.locator('app-parameterless-action-view .success')).toBeVisible();

  await page.getByRole('button', { name: 'Change address', exact: true }).click();
  await page.getByLabel('street').fill('12 Analytical Engine Way');
  await page.getByLabel('city').fill('London');
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.locator('app-parameter-action .success')).toBeVisible();
});

test('uploads a file through a file-upload action', async ({ page }) => {
  await openEntryPoint(page);
  await page.getByRole('link', { name: 'customer' }).click();
  await page.getByRole('button', { name: 'Upload avatar', exact: true }).click();
  await page.locator('input[type="file"]').setInputFiles({ name: 'avatar.txt', mimeType: 'text/plain', buffer: Buffer.from('avatar content') });
  await expect(page.locator('.file-name')).toHaveText('avatar.txt');
  await page.getByRole('button', { name: 'Upload', exact: true }).click();
  await expect(page.locator('app-file-upload-action .success')).toBeVisible();
});

test('shows raw Siren data and embedded entities', async ({ page }) => {
  await openEntryPoint(page);
  await page.getByRole('radio', { name: 'Raw' }).check();
  await expect(page.locator('app-raw-view')).toContainText('DemoEntryPoint');
  await page.getByRole('radio', { name: 'UI' }).check();
  await page.getByText('Embedded summary', { exact: true }).click();
  await expect(page.getByText('ready', { exact: true })).toBeVisible();
  await page.locator('app-embedded-entity-view .entityLinkButton').click();
  await expect(page.getByText('Customer 42', { exact: true })).toBeVisible();
});

test('previews JSON, text, and image link content', async ({ page }) => {
  await openEntryPoint(page);
  await page.getByRole('link', { name: 'plain-json' }).click();
  await expect(page.locator('app-json-preview')).toContainText('ordinary JSON');

  await page.getByRole('link', { name: 'entrypoint' }).click();
  await page.getByRole('link', { name: 'plain-text' }).click();
  await expect(page.locator('.text-preview')).toContainText('Hello from plain text');

  await page.getByRole('link', { name: 'entrypoint' }).click();
  await page.getByRole('link', { name: 'image' }).click();
  await expect(page.getByAltText('Image preview')).toBeVisible();
});

test('searches nested properties in the tree', async ({ page }) => {
  await openEntryPoint(page);
  await page.getByRole('switch').check();
  const search = page.getByPlaceholder('Search ...');
  await search.fill('needle-value');
  await expect(page.getByText('searchableProperty:', { exact: true })).toBeVisible();
  await expect(page.getByText('needle-value', { exact: true })).toBeVisible();
  await expect(page.locator('.match-counter')).toHaveText('1/1');
});
