## Microblocks App for Tablet

This app was created using [`@capacitor/create-app`](https://github.com/ionic-team/create-capacitor-app),
and comes with a very minimal shell for building an app.

### Building the app

- Copy the webapp output to the `src` folder.
- apply the patch `gpsupport.diff` to `gpSupport.js`
```
patch src/gpSupport.js < gpsupport.diff
```
- Run `npm run build` to build the app.
- Run `npx cap sync` to sync the app with the webapp.
- Run `npx cap open` to open the app in Xcode.