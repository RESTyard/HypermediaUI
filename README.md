# HypermediaUI

This is a Web UI to generically process [Siren Hypermedia Format](https://github.com/kevinswiber/siren) speaking http servers. 
Links, embedded entities and actions (including parameter forms) are generically rendered purely from the API response.

There are minor deviations from the Siren hypermedia format, mainly on how action parameters are specified and a specification for file uploades.
For more details see the [RESTyard documentation](https://restyard.github.io/RESTyard-Docs/content/12-Notes-on-Siren.html)

There is a [Live demo](https://restyard.github.io/HypermediaUI/) hosted on github pages.

Ready-to-deploy versions can be found under [Releases](https://github.com/RESTyard/HypermediaUI/releases). For configuration see [Configuration](#configuration)

This Client is designed to work with APIs implemented using the [RESTyard project](https://github.com/RESTyard/RESTyard).
Use the demo server "CarShack" from this project to have a quick compliant backend.

**NOTE**
The code was originally developed [here](https://github.com/MathiasReichardt/HypermediaUi) but was now moved to the RESTyard organization.

## Local Development

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Configuration

The UI can be customized by deploying an artifact from [Releases](https://github.com/RESTyard/HypermediaUI/releases) (or from building your own) and modifying the ``app.config.json`` file that is next to the ``index.html``. This file is read by the app on the first load and could look like this:
```json
{
  "disableDeveloperControls": true,
  "reduceUiElements": true,
  "autoFollowActionLocationOnSuccess": true,
  "configuredEntryPoints": [
    {
      "alias": "SomePage",
      "title": "Some Page",
      "entryPointUri": "https://localhost:1234/api/some/EntryPoint"
    }
  ],
  "onlyAllowConfiguredEntryPoints": true,
  "relationIconMapping": {
    "self": "home",
    "next": "forward"
  },
  "httpMethodIconMapping": {
    "post": "add_box"
  },
  "actionPopupWarningConfigurations": [
    {
      "actionClass": "destructive",
      "title": "Confirm Destructive Action",
      "message": "This action is destructive and cannot be undone. Are you sure you want to continue?",
      "icon": "warning"
    }
  ]
}
```

The configuration in details works like this:

### ``actionPopupWarningConfigurations``

Allows defining custom behaviors for actions based on their Siren classes. Matching is **case-insensitive**.

- `actionClass`: The Siren class to match.
- `title`: Title for the confirmation popup.
- `message`: Message in the confirmation popup.
- `icon`: Material icon name to be displayed next to the action name.

If a match is found, the user is prompted with a confirmation dialog before the action is executed. If multiple classes match, multiple popups will be shown sequentially.

### ``relationIconMapping`` and ``httpMethodIconMapping``

Allows to override the default icons used for relations and HTTP methods.
The icons must be valid [Material Design Icon](https://fonts.google.com/icons) names.

**Note:** If these properties are provided in `app.config.json` and are not empty, they will replace the default mappings entirely. If they are omitted or empty, the defaults are used. This allows users to completely redefine the icon mapping or remove default ones by not including them in the provided configuration.

#### Example

```json
{
  "relationIconMapping": {
    "self": "home",
    "next": "forward"
  },
  "httpMethodIconMapping": {
    "post": "add_box"
  }
}
```

### ``disableDeveloperControls``

default: ``false``

when set to ``true`` removes the settings button and with it all access to the general settings and site settings.

This includes not showing the raw view, classes, any empty views or null properties, and not showing host information.

### ``reduceUiElements``

default: ``false``

when set to ``true`` removes the following UI elements for a leaner experience:
- Titles on embedded entities (since they are already shown in the entity list header)
- Action names (since the title already defines which action is which)

### ``autoFollowActionLocationOnSuccess``

default: ``false``

when set to ``true`` will automaticalle navigate to the result location of a successful action after a short delay

### ``onlyAllowConfiguredEntryPoints``

default: ``false``

when set to ``true`` will not permit the user from entering their own entry point in the home path, instead taking the user to the first configured entry point. Only set this when there is at least one entry point configured

### ``configuredEntryPoints``

default: ``[]``

a list of entry points that are pre-configured. The alias defines the subpath, under which that API is available. The ``alias`` "SomePage" means that if the ui is hosted unter ``https://some.url``, then going to ``https://some.url/SomePage`` will use the ``entryPointUri`` of ``https://localhost:1234/api/some/EntryPoint`` and enter it immediately upon loading, and also display the ``title`` "Some Page" in the top left instead of "Hypermedia UI".

The exit button on the top left then also returns the user to ``/SomePage`` instead of the main page.

The following values for ``alias`` will have no effect, since they are already used internally and have precedence over the wildcard route used to implement the alias:
- hui

## Authentication

Authentication uses an OAuth 2.1 Backend for Frontend (BFF). The backend owns the authorization-code flow, client secret, token acquisition, and HTTP-only session cookie.

When an API request returns ``401``, the UI requests ``/bff/session`` on that API's origin. If it returns ``{ "isAuthenticated": false }``, the browser is redirected to ``/bff/login`` on the same origin. After the BFF completes authentication, its cookie is sent with subsequent API requests. The exit button calls ``/bff/logout`` to clear the BFF session.

The BFF must allow credentialed cross-origin requests from the UI origin. This CORS policy must apply to successful responses and error responses, including ``401`` responses. It must return ``Access-Control-Allow-Origin`` with the exact UI origin, rather than ``*``, and ``Access-Control-Allow-Credentials: true``. Its preflight response must allow the HTTP methods and request headers used by the UI. Without these headers, browsers hide the backend response and Angular receives a status ``0`` network error instead of the ``401`` required to start BFF login.

For a cross-site BFF cookie, configure it as ``Secure`` and ``SameSite=None``. Browser privacy settings can still block third-party cookies; hosting the UI and BFF on the same site avoids that restriction.

When implementing BFF with ASP.NET Core, use `X-Forwarded-Prefix` header to ensure link generation includes the proxy prefix. e.g. when the entry point is /api/entrypoint and the client calls /bff/proxy/api/entrypoint to have the cookie changed for the token, set `X-Forwarded-Prefix` to `"/bff/proxy"` such that the `LinkGenerator` will add this prefix and subsequent links are generated correctly

Manually configured global and per-site headers, including an ``Authorization`` header, remain supported.

## Content Preview

The UI can preview various non-Siren content types directly in the browser.

### Supported Media Types

The following media types are supported for integrated preview:

- **Images:** `image/jpeg`, `image/png`, `image/gif`, `image/svg+xml`, `image/webp`, `image/bmp`, `image/x-icon`.
- **JSON:** `application/json` and any vendor-specific JSON types (e.g., `application/vnd.my.api+json`).
- **Text & Code:** 
  - Plain text: `text/plain`
  - Markdown: `text/markdown`, `text/x-markdown`
  - Data: `text/csv`, `application/csv`, `application/vnd.ms-excel`
  - Markup: `application/xml`, `text/xml`, `text/html`
  - Configuration: `text/toml`, `text/yaml`
  - Binary/Generic: `application/octet-stream` (can be manually rendered as text with syntax highlighting options).

## 💚 Many thanks to our dear sponsors

<div style="display: flex; justify-content: space-around; align-items: flex-start;">
  <div style="margin-right: 10px;"> 
    <a href="https://www.bluehands.de" target="_blank" rel="noopener noreferrer">
      <img src="media/sponsors/bluehands-logo.png" alt="bluehands sponsor logo" style="height: 80px; width: auto; object-fit: cover;">
    </a>
  </div>
  <div style="margin-right: 10px;"> 
    <a href="https://data-cybernetics.com" target="_blank" rel="noopener noreferrer">
      <img src="media/sponsors/datacybernetics-logo.png" alt="data cybernetics sponsor logo" style="height: 80px; width: auto; object-fit: cover;">
    </a>
  </div>
</div>
