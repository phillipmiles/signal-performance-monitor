# react-web-app-bootstrap
This is my own personal template for quickly setting up new web apps.gf

## Features
### Bundler - Parcel
Parcel is used as the bundler. (See Parcel documentation)[https://parceljs.org/getting_started.html].

### Compiler - Babel
Babel is used to compile the source code. The configuration file `.babelrc` is located in the root directory.

By default Parcel uses it's own babel configuration file when compiling code. (See Default Babel Transforms)[https://parceljs.org/javascript.html#default-babel-transforms]. It's unclear if this configuration file is merged with this project's `.babelrc` file or is just outright replaced by it.

By default Storybook uses it's own internal babel configuration file when compiling code. (See Storybook Babel Config)[https://storybook.js.org/docs/react/configure/babel]. It's unclear if this configuration file is merged with this project's `.babelrc` file or is just outright replaced by it.

**React v17 new JSX Transform -** This is set to use the classic transform, a setting shared by both parcel and storybook within the `.babelrc.js` file. Once the `theme-ui` package is updated to support
the new transform this setting can be changed to `automatic`.

Be aware the the `theme-ui` JSX pragma used in all the component files is likely to need changing if the 
(documentation for the pre release version)[https://dev.theme-ui.com/api] of the package is any indicator.

### Component Library - Storybook
Storybook is used for documenting the component library. **It appears that the `.babelrc` config flat out replaces storybook's default config** whereas Parcel holds onto some of it's default babel configurations. This was evident when including Typescript into the project. By default storybook should handle Typescript fine and you can see in it's default (babel configuration)[https://github.com/storybookjs/storybook/blob/master/lib/core/src/server/common/babel.ts] that `@babel/preset-typescript` is included. However, it throws unexpected error messages on any Typescript code when using the root directories `.babelrc.js` config. After including `@babel/preset-typescript` into the root directory config storybook worked fine again. Something to keep in mind considering storybook has a bunch of other default babel plugins that would
be getting lost by my custom babel config.

**ERROR: By default, the implementation of storybook 6.1.14 fails to build. Some issue with mapping the dependency `core-js`. However adding `core-js` as a dev dependency to this project fixes it. It's the only reason `core-js` is added to this project. If the issue is fixed in a future version of storybook then `core-js` should be removed from this project. See (git issue)[https://github.com/storybookjs/storybook/issues/11255] for more information on the issue.**

### Linter - ESLint
Linting is handled by ESLint.

### Type Checking - Typescript
Typescript is used to validate types throughout the code. For files containing JSX, `.tsx` file name extension must be used. 

ESLint is setup to report typescript errors but Parcel and Jest will not do any type checking as part of their processes. It's just supported to the point that both can transpile Typescript code. See (here)[https://parceljs.org/typeScript.html] and (here)[https://jestjs.io/docs/en/getting-started#using-typescript].

**NOTE: `@types/theme-ui` was installed to get the `sx` prop working by Parcel's compiling. Before eslint would show an error in the IDE and the built app wouldn't render any styling within the sx prop. Weirdly Storybook worked fine. See (here)[for more info]**


**NOTE: `@types/jest` was installed to stop eslint throwing warnings on global Jest functions like `test()` and `expect()`.**

### Router - React Router
React Router is used as the routing library. Additionally dynamic imports are setup to work with it as well.

### Server - Firebase
Firebase is used for hosting the server functions and Firebase's own SDK is used to to connect with it. 

### Testing - Jest and react-testing-library
Jest is used for testing and react-testing-library adds some support to it specific for react component rendering. Run `npm run test` to run through tests. 

### Exception Tracking - Sentry
Sentry is used for tracking and recording errors.

**WARNING: Sentry api calls appear to get blocked by uBlock Origin Chrome extension. To get it working in development I had to add localhost to uBlock's list of Trusted sites. This may cause issues in production. See (git issue)[https://github.com/getsentry/sentry-javascript/issues/2916] for more info.

### Analytics - Google Analytics
Google Analytics is used to capture user activity within the app.

There's a number of event types that Google supports and recommends using when possible. These can be found (here)[https://developers.google.com/gtagjs/reference/ga4-events#sign_up]. 

## Setup

### Link to Firebase
Linking to a Firebase account will be necessary to utilise it's features. Within a Firebase project create a new web app and follow the instructions provided. At time of writting, you needed to run `firebase init` to begin. Although you may also need to configure Visual Studio Code to run global scripts like `firebase` if running on a windows machine.

Double check that .firebaserc and firebase.json have been updated to the new configuration set by `firebase init` and aren't still using the settings made by this template project.

### Create Firebase projects.
Create 3 firebase projects. One for development, staging and production. Once create you'll need to configure them as necessary. For example enable your authentication sign-in methods and customise the email templates.
### Env file
You'll need to update the `./env.js` file.

### Create Firebase aliases
After creating the development, staging and production projects in firebase and adding the necessary configurations to the env files you'll need to add staging and production aliases in order for the `npm run deploy:` scripts work.

- Run `firebase use --add` and select the staging firebase project. Name this alias `staging`.
- Run `firebase use --add` and select the production firebase project. Name this alias `prod`.

See (deploy to multiple environments)[https://firebase.googleblog.com/2016/07/deploy-to-multiple-environments-with.html] for more info.
### Running global npm scripts in Visual Studio Code (Windows)
Some global scripts won't run in Visual Studio Code by default when on windows. Scripts like `firebase etc`. This is due to the execution policy within Viscode. Normally you would need to open up the Command Prompt app in administrator mode to run them. To allow these types of scripts to run in viscode open up Viscodes settings.json file and add `"terminal.integrated.shellArgs.windows": ["-ExecutionPolicy", "Bypass"]`. Save and restart Viscode. [See StackOverflow for more info.](https://stackoverflow.com/questions/56199111/visual-studio-code-cmd-error-cannot-be-loaded-because-running-scripts-is-disabl)


## Clearing caches
Sometimes caches get stuffed. Parcel for example will freak out if you rename a `.js` file to a `.tsx` file.

- Clear Parcel's cache. Delete the folder `.cache`.