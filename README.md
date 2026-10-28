# Headly

Headly is a smart, user-friendly and cross-platform migraine-tracking app.

## Development

This project uses Expo SDK 58. Use Node.js 22.13+ (22.x) or 24.3+ (24.x),
and pnpm 10.32.1. Expo Go on your phone must support SDK 58.

1. Install dependencies

   ```bash
   pnpm install
   ```

2. Start the app

   ```bash
   pnpm start
   ```

This project uses [Expo](https://expo.dev) with [file-based routing](https://docs.expo.dev/router/introduction/). Edit files in `src/app` to develop.

For a physical phone, run `pnpm start --go --tunnel` and scan the QR code.
Existing development builds must be rebuilt after the SDK upgrade.

Validation: `pnpm typecheck`, `pnpm lint`, `pnpm exec expo install --check`,
and `npx expo-doctor`. Sign-in, email verification, OAuth, and native gestures
should also be checked on the device before releasing.
