# mobile

React Native app built with Expo.

## Commands

```bash
# Installing EAS
npm install -g eas-cli
# Login to Expo
eas login
# Configure EAS for the project (this will create eas.json)
eas build:configure
# Internal install build (this builds real iOS app & generates a download link w/o App Store)
eas build -p ios --profile preview
```

Env vars: copy [`.env.example`](.env.example) to `.env` and fill in.

## Deploying to Production

```bash
# Make production build
eas build -p ios --profile production
# Submit to apple
eas submit --platform ios
```

## Connecting to a Local API

If you want to run this with a local API, see the [worker README](../worker/README.md#running-locally-with-mobile).
