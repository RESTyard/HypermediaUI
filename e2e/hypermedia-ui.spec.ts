import { expect, test } from '@playwright/test';
import { URLPattern } from 'node:url';

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
    { rel: ['missing'], href: `${api}/missing` },
  ],
  entities: [
    {
      rel: ['summary'],
      class: ['Summary'],
      title: 'Embedded summary',
      properties: { status: 'ready' },
      entities: [
        {
          rel: ['detail'],
          class: ['Detail'],
          title: 'Nested detail',
          properties: { depth: 'nested-value' },
        },
      ],
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
      name: 'delete', title: 'Delete customer', method: 'DELETE', href: `${api}/customers/42`, type: 'application/json', class: ['Destructive'],
    },
    {
      name: 'generateReport', title: 'Generate report', method: 'POST', href: `${api}/customers/42/report`, type: 'application/json',
    },
    {
      name: 'fail', title: 'Fail action', method: 'POST', href: `${api}/customers/42/fail`, type: 'application/json',
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
        case '/protected': return route.fulfill({ status: 401 });
        case '/forbidden': return route.fulfill({ status: 403 });
        case '/bff/session': return route.fulfill({
          contentType: 'application/json',
          body: JSON.stringify({ isAuthenticated: false }),
        });
        case '/bff/login': return route.fulfill({
          contentType: 'text/html',
          body: '<h1>BFF login</h1>',
        });
        case '/bff/logout': return route.fulfill({
          contentType: 'text/html',
          body: '<h1>BFF logout</h1>',
        });
        case '/missing': return route.fulfill({
          status: 404,
          contentType: 'application/problem+json',
          body: JSON.stringify({ type: 'NotFound', title: 'API error', detail: 'The requested resource does not exist.', status: 404 }),
        });
      }
    }

    if (url.pathname === '/customers/42/activate') {
      expect(request.method()).toBe('POST');
      expect(request.postData()).toBeNull();
      return json({}, 204);
    }
    if (url.pathname === '/customers/42' && request.method() === 'DELETE') {
      expect(request.postData()).toBeNull();
      return json({}, 204);
    }
    if (url.pathname === '/customers/42/report') {
      return route.fulfill({
        contentType: 'application/json',
        headers: { location: `${api}/documents/data`, 'access-control-expose-headers': 'location' },
        body: '{}',
      });
    }
    if (url.pathname === '/customers/42/fail') {
      return route.fulfill({
        status: 422,
        contentType: 'application/problem+json',
        body: JSON.stringify({ type: 'ValidationError', title: 'Action failed', detail: 'The action could not be completed.', status: 422 }),
      });
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

test('executes an action without parameters', async ({ page }) => {
  await openEntryPoint(page);
  await page.getByRole('link', { name: 'customer' }).click();

  await page.getByRole('button', { name: 'Activate customer' }).click();
  await expect(page.locator('app-parameterless-action-view .success')).toBeVisible();
});

test('executes an action with parameters', async ({ page }) => {
  await openEntryPoint(page);
  await page.getByRole('link', { name: 'customer' }).click();

  await page.locator('button', { hasText: 'Change address' }).click();
  await page.getByLabel('street').fill('12 Analytical Engine Way');
  await page.getByLabel('city').fill('London');
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.locator('app-parameter-action .success')).toBeVisible();
});

test('requires confirmation for an action with a warning configuration', async ({ page }) => {
  await openEntryPoint(page);
  await page.getByRole('link', { name: 'customer' }).click();

  await page.getByRole('button', { name: 'Delete customer' }).click();
  await expect(page.getByRole('heading', { name: 'Confirm destructive Action' })).toBeVisible();
  await expect(page.getByText('This action is destructive and cannot be undone. Are you sure you want to continue?')).toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.locator('app-parameterless-action-view .success')).toBeVisible();
});

test('does not execute a warning action when confirmation is cancelled', async ({ page }) => {
  let deleteRequested = false;
  await page.route(`${api}/customers/42`, async route => {
    if (route.request().method() === 'DELETE') deleteRequested = true;
    await route.fallback();
  });
  await openEntryPoint(page);
  await page.getByRole('link', { name: 'customer' }).click();
  await page.getByRole('button', { name: 'Delete customer' }).click();
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByRole('heading', { name: 'Confirm destructive Action' })).toBeHidden();
  expect(deleteRequested).toBe(false);
});

test('shows action errors and follows an action result location', async ({ page }) => {
  await openEntryPoint(page);
  await page.getByRole('link', { name: 'customer' }).click();

  await page.getByRole('button', { name: 'Fail action' }).click();
  await expect(page.locator('app-parameterless-action-view .error')).toBeVisible();

  await page.getByRole('button', { name: 'Generate report' }).click();
  await page.getByRole('link', { name: 'View Result' }).click();
  await expect(page.locator('app-json-preview')).toContainText('ordinary JSON');
});

test('uploads a file through a file-upload action', async ({ page }) => {
  await openEntryPoint(page);
  await page.getByRole('link', { name: 'customer' }).click();
  await page.locator('button', { hasText: 'Upload avatar' }).click();
  await page.locator('input[type="file"]').setInputFiles({ name: 'avatar.txt', mimeType: 'text/plain', buffer: Buffer.from('avatar content') });
  await expect(page.locator('.file-name')).toHaveText('avatar.txt');
  await page.getByRole('button', { name: 'Upload', exact: true }).click();
  await expect(page.locator('app-file-upload-action .success')).toBeVisible();
});

test('rejects files that do not meet upload constraints', async ({ page }) => {
  await openEntryPoint(page);
  await page.getByRole('link', { name: 'customer' }).click();
  await page.locator('button', { hasText: 'Upload avatar' }).click();
  await page.locator('input[type="file"]').setInputFiles({ name: 'avatar.png', mimeType: 'image/png', buffer: Buffer.from('not an image') });
  await expect(page.getByText('avatar.png has wrong type. Acceptable: text/plain')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Upload', exact: true })).toBeDisabled();
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

test('navigates between top level embedded entities with keys, buttons and clicks', async ({ page }) => {
  await openEntryPoint(page);
  const navigation = page.getByRole('navigation', { name: 'Page navigation' });
  const summary = page.locator('mat-expansion-panel', { hasText: 'Embedded summary' });
  const linkedCustomer = page.locator('mat-card', { hasText: 'Linked customer' });
  const current = page.locator('.embedded-nav-current');
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());

  await expect(current).toHaveCount(0);
  // collapsed to a handle until hovered
  const buttonsWidth = async () => (await navigation.locator('.buttons').boundingBox())?.width ?? 0;
  await expect.poll(buttonsWidth).toBe(0);
  await navigation.hover();
  await expect.poll(buttonsWidth).toBe(4 * 40 + 3 * 4);
  const buttonsBox = await navigation.locator('.buttons').boundingBox();
  const bottomButtonBox = await navigation.getByRole('button', { name: 'To bottom' }).boundingBox();
  expect(bottomButtonBox!.x + bottomButtonBox!.width).toBeLessThanOrEqual(buttonsBox!.x + buttonsBox!.width + 0.5);
  await page.mouse.move(0, 0);
  await page.keyboard.press('ArrowDown');
  await expect(summary).toHaveClass(/embedded-nav-current/);
  const summaryHeader = summary.locator('mat-expansion-panel-header').first();
  await page.keyboard.press('Enter');
  await expect(summaryHeader).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Enter');
  await expect(summaryHeader).toHaveAttribute('aria-expanded', 'false');
  await summaryHeader.hover();
  await expect(page.locator('.mat-mdc-tooltip')).toHaveText('Expand / collapse (Enter while selected)');
  await page.mouse.move(0, 0);
  await page.keyboard.press('ArrowDown');
  await expect(linkedCustomer).toHaveClass(/embedded-nav-current/);
  await expect(navigation.getByRole('button', { name: 'Next embedded entity' })).toBeDisabled();

  await navigation.hover();
  await navigation.getByRole('button', { name: 'Previous embedded entity' }).click();
  await expect(summary).toHaveClass(/embedded-nav-current/);
  // Enter toggles the current item instead of pressing the clicked footer button again
  await page.keyboard.press('Enter');
  await expect(summaryHeader).toHaveAttribute('aria-expanded', 'true');
  await expect(summary).toHaveClass(/embedded-nav-current/);
  await page.keyboard.press('Enter');
  await expect(summaryHeader).toHaveAttribute('aria-expanded', 'false');

  await linkedCustomer.getByText('Linked customer', { exact: true }).click();
  await expect(linkedCustomer).toHaveClass(/embedded-nav-current/);
  await expect(current).toHaveCount(1);

  await page.getByText('welcome:', { exact: true }).click();
  await expect(current).toHaveCount(0);

  await navigation.hover();
  await navigation.getByRole('button', { name: 'To bottom' }).click();
  await expect(linkedCustomer).toHaveClass(/embedded-nav-current/);
  await page.keyboard.press('Home');
  await expect(summary).toHaveClass(/embedded-nav-current/);

  await page.getByRole('link', { name: 'customer', exact: true }).click();
  await expect(page.getByText('Customer 42', { exact: true })).toBeVisible();
  await expect(navigation).toHaveCount(0);
});

test('expands and collapses all embedded entities of a level', async ({ page }) => {
  await openEntryPoint(page);
  const status = page.getByText('ready', { exact: true });
  await page.getByRole('button', { name: 'Expand all embedded entities' }).click();
  await expect(status).toBeVisible();
  await page.getByRole('button', { name: 'Collapse all embedded entities' }).first().click();
  await expect(status).toBeHidden();
});

test('leaves nested embedded entities alone when expanding or collapsing a level', async ({ page }) => {
  await openEntryPoint(page);
  const expandAll = page.getByRole('button', { name: 'Expand all embedded entities' });
  const collapseAll = page.getByRole('button', { name: 'Collapse all embedded entities' });
  const summaryHeader = page.locator('mat-expansion-panel-header', { hasText: 'Embedded summary' });
  const nestedHeader = page.locator('mat-expansion-panel-header', { hasText: 'Nested detail' });

  await expandAll.click();
  await expect(summaryHeader).toHaveAttribute('aria-expanded', 'true');
  await expect(nestedHeader).toHaveAttribute('aria-expanded', 'false');

  await expandAll.last().click();
  await expect(nestedHeader).toHaveAttribute('aria-expanded', 'true');

  await collapseAll.first().click();
  await expect(summaryHeader).toHaveAttribute('aria-expanded', 'false');
  await expect(nestedHeader).toHaveAttribute('aria-expanded', 'true');
  await expect(collapseAll).toHaveCount(1);
});

test('expands and collapses all top level embedded entities with + and -', async ({ page }) => {
  await openEntryPoint(page);
  const summaryHeader = page.locator('mat-expansion-panel-header', { hasText: 'Embedded summary' });
  const nestedHeader = page.locator('mat-expansion-panel-header', { hasText: 'Nested detail' });

  await page.keyboard.press('+');
  await expect(summaryHeader).toHaveAttribute('aria-expanded', 'true');
  await expect(nestedHeader).toHaveAttribute('aria-expanded', 'false');

  // + needs Shift on a US layout
  await page.keyboard.press('-');
  await expect(summaryHeader).toHaveAttribute('aria-expanded', 'false');
  await page.keyboard.press('Shift++');
  await expect(summaryHeader).toHaveAttribute('aria-expanded', 'true');

  await page.getByRole('button', { name: 'Expand all embedded entities' }).first().hover();
  await expect(page.locator('.mat-mdc-tooltip')).toHaveText('Expand all embedded entities (+)');
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

test('downloads non-Siren content', async ({ page }) => {
  await openEntryPoint(page);
  await page.getByRole('link', { name: 'plain-text' }).click();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download File' }).click();
  expect((await download).suggestedFilename()).toBe('download.dat');
});

test('searches nested properties in the tree', async ({ page }) => {
  await openEntryPoint(page);
  const search = page.getByPlaceholder('Search ...');
  await search.fill('needle-value');
  await expect(page.getByText('searchableProperty:', { exact: true })).toBeVisible();
  await expect(page.getByText('needle-value', { exact: true })).toBeVisible();
  await expect(page.locator('.match-counter')).toHaveText('1/1');
});

test('expands an embedded entity that contains a search hit', async ({ page }) => {
  await openEntryPoint(page);
  await page.getByPlaceholder('Search ...').fill('ready');
  await expect(page.locator('mark', { hasText: 'ready' })).toBeVisible();
  await expect(page.locator('.match-counter')).toHaveText('1/1');
});

test('steps through link relation hits with Enter and Shift+Enter', async ({ page }) => {
  await openEntryPoint(page);
  await page.getByRole('button', { name: 'Search options' }).click();
  await page.getByRole('switch', { name: 'Link relations' }).check();
  await page.keyboard.press('Escape');

  const search = page.getByPlaceholder('Search ...');
  await search.fill('plain');
  await expect(page.locator('.match-counter')).toHaveText('1/2');
  await search.press('Enter');
  await expect(page.locator('.match-counter')).toHaveText('2/2');
  await search.press('Shift+Enter');
  await expect(page.locator('.match-counter')).toHaveText('1/2');
  await expect(page.locator('.link-group.search-current')).toContainText('plain-json');
});

test('remembers search options after a reload', async ({ page }) => {
  await openEntryPoint(page);
  await page.getByRole('button', { name: 'Search options' }).click();
  await page.getByRole('switch', { name: 'Actions' }).check();
  await page.keyboard.press('Escape');

  await page.reload();
  await expect(page.getByText('Demo API', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Search options' }).click();
  await expect(page.getByRole('switch', { name: 'Actions' })).toBeChecked();
});

test('opens the raw view 2 levels deep and expands or collapses it with buttons and keys', async ({ page }) => {
  await openEntryPoint(page);
  await page.getByRole('radio', { name: 'Raw' }).check();
  const rawView = page.locator('app-raw-view');
  // an opened node lists "key: value"; a collapsed one only shows a JSON preview of its content
  const rootProperty = 'welcome: "Navigate using hypermedia"';
  const embeddedProperty = 'status: "ready"';
  await expect(rawView).toContainText(rootProperty);
  await expect(rawView).not.toContainText(embeddedProperty);

  // a clicked view toggle releases the focus, so the shortcuts work right away
  await page.keyboard.press('+');
  await expect(rawView).toContainText(embeddedProperty);
  await page.keyboard.press('-');
  await expect(rawView).not.toContainText(rootProperty);
  await page.getByRole('button', { name: 'Expand 2 levels' }).click();
  await expect(rawView).toContainText(rootProperty);
  await expect(rawView).not.toContainText(embeddedProperty);
  await page.getByRole('button', { name: 'Expand all' }).click();
  await expect(rawView).toContainText(embeddedProperty);
  await page.getByRole('button', { name: 'Collapse all' }).hover();
  await expect(page.locator('.mat-mdc-tooltip')).toHaveText('Collapse all (-)');

  const navigation = page.getByRole('navigation', { name: 'Page navigation' });
  await expect(navigation.getByRole('button')).toHaveCount(2);
  await expect(navigation.getByRole('button', { name: 'Back to top' })).toBeAttached();
  await expect(navigation.getByRole('button', { name: 'To bottom' })).toBeAttached();
});

test('searches the raw view as plain text', async ({ page }) => {
  await openEntryPoint(page);
  await page.getByRole('radio', { name: 'Raw' }).check();
  await page.getByPlaceholder('Search ...').fill('"class"');
  await expect(page.locator('app-raw-view mark').first()).toHaveText('"class"');
});

test('hides the search when configured', async ({ page }) => {
  await page.route('**/app.config.json', route => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify({
      showSearch: false,
      relationIconMapping: {}, httpMethodIconMapping: {}, actionPopupWarningConfigurations: [],
    }),
  }));
  await openEntryPoint(page);
  await expect(page.getByPlaceholder('Search ...')).toBeHidden();
});

test('navigates with breadcrumbs and recovers from an API error', async ({ page }) => {
  await openEntryPoint(page);
  await page.getByRole('link', { name: 'customer' }).click();
  await page.getByRole('link', { name: 'entrypoint' }).click();
  await expect(page.getByText('Demo API', { exact: true })).toBeVisible();

  await page.getByRole('link', { name: 'customer' }).click();
  await page.getByRole('link', { name: 'entrypoint' }).click();
  await page.getByRole('link', { name: 'missing' }).click();
  await expect(page.getByText('API error', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Go to entry point' }).click();
  await expect(page.getByText('Demo API', { exact: true })).toBeVisible();
  await page.getByRole('button', { description: 'Exit API' }).click();
  await expect(page).toHaveURL(new URLPattern({ hostname: 'api.test', pathname: '/bff/logout' }));
});

test('uses configured entry points and disables developer controls', async ({ page }) => {
  await page.route('**/app.config.json', route => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify({
      disableDeveloperControls: true,
      configuredEntryPoints: [{ alias: 'demo', title: 'Configured Demo', entryPointUri: `${api}/entrypoint` }],
      onlyAllowConfiguredEntryPoints: true,
      relationIconMapping: {}, httpMethodIconMapping: {}, actionPopupWarningConfigurations: [],
    }),
  }));
  await page.goto('/');
  await expect(page.getByText('Configured Demo', { exact: true })).toBeVisible();
  await expect(page.getByPlaceholder('Enter API entrypoint URL')).toBeHidden();
  await expect(page.getByRole('radio', { name: 'Raw' })).toBeHidden();
});

test('reduces UI elements when configured', async ({ page }) => {
  await page.route('**/app.config.json', route => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify({
      reduceUiElements: true,
      relationIconMapping: {}, httpMethodIconMapping: {}, actionPopupWarningConfigurations: [],
    }),
  }));
  await openEntryPoint(page);

  await page.getByRole('link', { name: 'customer' }).click();
  await expect(page.getByText('activate', { exact: true })).toBeHidden();
});

test('automatically follows an action result location when configured', async ({ page }) => {
  await page.route('**/app.config.json', route => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify({
      autoFollowActionLocationOnSuccess: true,
      relationIconMapping: {}, httpMethodIconMapping: {}, actionPopupWarningConfigurations: [],
    }),
  }));
  await openEntryPoint(page);
  await page.getByRole('link', { name: 'customer' }).click();

  await page.getByRole('button', { name: 'Generate report' }).click();
  await expect(page.locator('app-json-preview')).toContainText('ordinary JSON');
});

test('redirects to the BFF login endpoint after an unauthenticated 401', async ({ page }) => {
  await page.goto('/');
  await page.getByPlaceholder('Enter API entrypoint URL').fill(`${api}/protected`);
  await page.getByRole('button', { name: 'Enter API' }).click();
  await expect(page).toHaveURL(new URLPattern({ hostname: 'api.test', pathname: '/bff/login' }));
  const loginUrl = new URL(page.url());
  const search = loginUrl.searchParams.get('redirectUri');
  expect(search).not.toBeNull();
  const redirectUrl = URL.parse(search!);
  expect(redirectUrl).not.toBeNull();
  expect(redirectUrl!.pathname).toBe("/hui");
  const apiPath = redirectUrl!.searchParams.get('apiPath');
  expect(apiPath).not.toBeNull();
  const apiPathUrl = URL.parse(apiPath!);
  expect(apiPathUrl).not.toBeNull();
  expect(apiPathUrl!.pathname).toBe("/protected");
  await expect(page.getByRole('heading', { name: 'BFF login' })).toBeVisible();
});

test('logs out through the BFF when exiting an API error from the main page', async ({ page }) => {
  await page.goto('/');
  await page.getByPlaceholder('Enter API entrypoint URL').fill(`${api}/forbidden`);
  await page.getByRole('button', { name: 'Enter API' }).click();
  await expect(page.getByText('API error', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Exit API' }).click();
  await expect(page).toHaveURL(new URLPattern({ hostname: 'api.test', pathname: '/bff/logout' }));
});

test('loads an API without BFF that allows any origin', async ({ page }) => {
  const plainApi = 'https://plain.test';
  const anyOrigin = { 'access-control-allow-origin': '*' };
  await page.route(`${plainApi}/**`, route => {
    if (new URL(route.request().url()).pathname === '/entrypoint') {
      return route.fulfill({ headers: anyOrigin, contentType: siren, body: JSON.stringify({ ...entryPoint, title: 'Plain API' }) });
    }
    return route.fulfill({ status: 404, headers: anyOrigin });
  });

  await page.goto('/');
  await page.getByPlaceholder('Enter API entrypoint URL').fill(`${plainApi}/entrypoint`);
  await page.getByRole('button', { name: 'Enter API' }).click();
  await expect(page.getByText('Plain API', { exact: true })).toBeVisible();
});

test('sends credentials to an API backed by a BFF', async ({ page, context }) => {
  await context.addCookies([{ name: 'bff-session', value: 'session-cookie', domain: 'api.test', path: '/', secure: true, sameSite: 'None' }]);
  const entryPointRequest = page.waitForRequest(`${api}/entrypoint`);
  await openEntryPoint(page);
  expect(await (await entryPointRequest).headerValue('cookie')).toContain('bff-session=session-cookie');
});

test('keeps a site settings panel open and the focus while editing it', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByRole('tab', { name: 'Sites' }).click();
  await page.getByRole('button', { name: 'Add site' }).click();

  const site = page.locator('app-site-settings').nth(1);
  const header = site.locator('mat-expansion-panel-header');
  await expect(header).toHaveAttribute('aria-expanded', 'true');
  await site.getByRole('textbox', { name: 'Host' }).fill('api.test');
  await site.locator('#headersTitle').click();
  await expect(header).toHaveAttribute('aria-expanded', 'true');
  await expect(header).toContainText('api.test');

  await site.locator('#addHeaderButton').click();
  await site.getByRole('textbox', { name: 'Key' }).fill('X-Tenant');
  await page.keyboard.press('Tab');
  await expect(site.getByRole('textbox', { name: 'Value' })).toBeFocused();
  await page.keyboard.type('blue');
  await site.locator('#headersTitle').click();
  await expect(header).toHaveAttribute('aria-expanded', 'true');
  await expect(site.getByRole('textbox', { name: 'Key' })).toHaveValue('X-Tenant');
  await expect(site.getByRole('textbox', { name: 'Value' })).toHaveValue('blue');

  await site.locator('.deleteHeader').click();
  await expect(site.getByRole('textbox', { name: 'Key' })).toHaveCount(0);
});

async function openSiteSettings(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByRole('tab', { name: 'Sites' }).click();
}

async function addHeaderSetting(site: import('@playwright/test').Locator, key: string, value: string) {
  await site.locator('#addHeaderButton').click();
  await site.getByRole('textbox', { name: 'Key' }).last().fill(key);
  await site.getByRole('textbox', { name: 'Value' }).last().fill(value);
  await site.locator('#headersTitle').click();
}

test('sends global and site specific headers', async ({ page }) => {
  await openSiteSettings(page);
  const global = page.locator('app-site-settings').first();
  await global.locator('mat-expansion-panel-header').click();
  await addHeaderSetting(global, 'X-Global', 'g1');

  await page.getByRole('button', { name: 'Add site' }).click();
  const site = page.locator('app-site-settings').nth(1);
  await expect(site.locator('mat-expansion-panel-header')).toHaveAttribute('aria-expanded', 'true');
  await site.getByRole('textbox', { name: 'Host' }).fill('API.test');
  await addHeaderSetting(site, 'X-Site', 's1');
  await expect(page.locator('app-error-dialog')).toHaveCount(0);
  await page.keyboard.press('Escape');

  await expect(page.getByText('Settings saved.')).toBeVisible();
  const request = page.waitForRequest(`${api}/entrypoint`);
  await openEntryPoint(page);
  const headers = (await request).headers();
  expect(headers['x-global']).toBe('g1');
  expect(headers['x-site']).toBe('s1');
});

test('accepts only a host for site specific settings', async ({ page }) => {
  await openSiteSettings(page);
  await page.getByRole('button', { name: 'Add site' }).click();
  const site = page.locator('app-site-settings').nth(1);
  const header = site.locator('mat-expansion-panel-header');
  await expect(header).toHaveAttribute('aria-expanded', 'true');
  const host = site.getByRole('textbox', { name: 'Host' });

  await expect(host).toHaveAttribute('placeholder', 'Host or IP, optional port');
  await host.pressSequentially('https://api.test/entrypoint');
  // validated while typing
  await expect(site.locator('mat-error')).toHaveText('Enter the host without scheme: api.test');
  await site.locator('#headersTitle').click();
  await expect(header).not.toContainText('api.test');

  await host.fill('api.test/entrypoint');
  await site.locator('#headersTitle').click();
  await expect(site.locator('mat-error')).toHaveText('Enter the host without path, query or fragment: api.test');

  await host.fill('api.test:8080');
  await site.locator('#headersTitle').click();
  await expect(site.locator('mat-error')).toHaveCount(0);
  await expect(header).toContainText('api.test:8080');

  // an invalid host is never stored, closing the settings discards it
  await host.fill('https://other.test');
  await site.locator('#headersTitle').click();
  await page.keyboard.press('Escape');
  await expect(page.getByText('Settings saved.')).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('appSettings'))).not.toContain('other.test');
  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByRole('tab', { name: 'Sites' }).click();
  await page.locator('app-site-settings').nth(1).locator('mat-expansion-panel-header').click();
  await expect(page.locator('app-site-settings').nth(1).getByRole('textbox', { name: 'Host' })).toHaveValue('api.test:8080');
});

test('opens a new site for entering its host and does not add a second one without host', async ({ page }) => {
  await openSiteSettings(page);
  await page.getByRole('button', { name: 'Add site' }).click();
  const newSite = page.locator('app-site-settings').nth(1);
  await expect(newSite.locator('mat-expansion-panel-header')).toHaveAttribute('aria-expanded', 'true');
  await expect(newSite.getByRole('textbox', { name: 'Host' })).toBeFocused();

  await newSite.locator('mat-expansion-panel-header').click();
  await page.getByRole('button', { name: 'Add site' }).click();

  await expect(page.locator('app-site-settings')).toHaveCount(2);
  await expect(page.locator('app-error-dialog')).toHaveCount(0);
  const site = page.locator('app-site-settings').nth(1);
  await expect(site.locator('mat-expansion-panel-header')).toHaveAttribute('aria-expanded', 'true');
  await expect(site.getByRole('textbox', { name: 'Host' })).toBeFocused();
});

test('keeps using headers stored before values could be hidden', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('appSettings', JSON.stringify({
    SiteSettings: {
      GlobalSiteSettings: { SiteUrl: 'Global', Headers: [{ Key: 'X-Global', Value: 'g1' }] },
      SiteSpecificSettings: [{ SiteUrl: 'api.test', Headers: [{ Key: 'X-Site', Value: 's1' }] }],
    },
  })));

  const request = page.waitForRequest(`${api}/entrypoint`);
  await openEntryPoint(page);
  const headers = (await request).headers();
  expect(headers['x-global']).toBe('g1');
  expect(headers['x-site']).toBe('s1');

  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByRole('tab', { name: 'Sites' }).click();
  const site = page.locator('app-site-settings').nth(1);
  await site.locator('mat-expansion-panel-header').click();
  await expect(site.getByRole('button', { name: 'Hide value' })).toHaveAttribute('aria-pressed', 'false');
  await expect(site.getByRole('textbox', { name: 'Value' })).not.toHaveClass(/maskedValue/);
});

test('hides a header value, also after renaming the header and reopening the settings', async ({ page }) => {
  await openSiteSettings(page);
  const global = page.locator('app-site-settings').first();
  await global.locator('mat-expansion-panel-header').click();
  await addHeaderSetting(global, 'X-Secret', 'token');
  const value = global.getByRole('textbox', { name: 'Value' });
  await expect(value).not.toHaveClass(/maskedValue/);

  await global.getByRole('button', { name: 'Hide value' }).click();
  await expect(value).toHaveClass(/maskedValue/);
  await global.getByRole('textbox', { name: 'Key' }).fill('X-Renamed');
  await global.locator('#headersTitle').click();
  await page.keyboard.press('Escape');
  await expect(page.getByText('Settings saved.')).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('appSettings')))
    .toContain('{"Key":"X-Renamed","Value":"token","Hidden":true}');

  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByRole('tab', { name: 'Sites' }).click();
  await global.locator('mat-expansion-panel-header').click();
  await expect(global.getByRole('button', { name: 'Hide value' })).toHaveAttribute('aria-pressed', 'true');
  await expect(value).toHaveClass(/maskedValue/);
  await expect(value).toHaveValue('token');
});
