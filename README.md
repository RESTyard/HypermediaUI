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
  }
}
```

The configuration in details works like this:

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

### ``onlyAllowConfiguredEntryPoints``

default: ``false``

when set to ``true`` will not permit the user from entering their own entry point in the home path, instead taking the user to the first configured entry point. Only set this when there is at least one entry point configured

### ``configuredEntryPoints``

default: ``[]``

a list of entry points that are pre-configured. The alias defines the subpath, under which that API is available. The ``alias`` "SomePage" means that if the ui is hosted unter ``https://some.url``, then going to ``https://some.url/SomePage`` will use the ``entryPointUri`` of ``https://localhost:1234/api/some/EntryPoint`` and enter it immediately upon loading, and also display the ``title`` "Some Page" in the top left instead of "Hypermedia UI".

The exit button on the top left then also returns the user to ``/SomePage`` instead of the main page.

The following values for ``alias`` will have no effect, since they are already used internally and have precedence over the wildcard route used to implement the alias:
- hui
- auth-redirect
- logout-redirect

## Authentication

The UI supports authentication with an OIDC provider by using the [``oidc-client-ts``](https://www.npmjs.com/package/oidc-client-ts) npm library.

The parameters/formats from [this Microsoft article](https://learn.microsoft.com/en-us/entra/msal/dotnet/advanced/extract-authentication-parameters) are used / asserted.

Upon receiving a ``401`` response from the API with a ``www-authentication`` header starting with "Bearer", the values ``authorization_uri`` and ``client_id`` are extracted. These will be used to make an OIDC call to the authorization uri.<br/>
The redirect uri is given as ``/auth_redirect`` with the current alias (in case of a configured entry point) or hui as the ``path`` parameter, and the current api path as the ``apiPath`` parameter.<br/>
When redirected to ``auth-redirect``, the token is extracted and saved under the site specific settings for the API, and the user is internally redirected to the page they just requested using the ``path`` and ``apiPath`` parameters.

The exit button on the top right performs a logout action on top of leaving the API. The user is redirected to the ``/logout-redirect`` page and is able to see if the logout was successful. While the app is open it remembers this, such that when authenticating again, the OIDC provider is prompted to select an account explicitly, preventing an automatic re-login after logout, especially when the user was in a configured EntryPoint which enforces authentication from the start.

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
