# Shipping the apps

The game is a web app wrapped with [Capacitor](https://capacitorjs.com) for iOS and Android.
The native projects are in `ios/` and `android/`. They were generated here but **not built**:
this environment has no Mac and cannot download the Android SDK. Build them on your machine.

## What you need
- **Apple:** a Mac with Xcode 16+, an Apple Developer Program membership ($99/year).
- **Google:** Android Studio, a Google Play developer account ($25 once).
- Change `appId` in `capacitor.config.ts` to a reverse-domain name you own (for example `com.yourstudio.dailydetour`) **before** your first upload; it cannot be changed afterwards.

## Build
```sh
npm install
npm run build          # web build into dist/
npx cap sync           # copies dist/ and plugins into ios/ and android/
npx cap open ios       # then in Xcode: set your team, Product › Archive
npx cap open android   # then in Android Studio: Build › Generate Signed Bundle (.aab)
```
Icons and splash screens are already generated into both projects from `assets/`
(`npx @capacitor/assets generate` recreates them).

## What only works in the installed app
- **Daily reminder** (local notification at a time the player picks). It is only shown in Settings when running natively, and asks for notification permission when switched on. On Android 13+ the permission prompt appears the first time.
- **Haptics** through the native Taptic Engine / vibrator.
- **Android back button** goes back through the game’s screens and leaves the app from the home screen.

## Test before submitting
- Play a full daily on a real phone in both stores’ test tracks (TestFlight, Play internal testing).
- Turn the reminder on, set it a minute ahead, background the app, and check it arrives.
- Airplane mode: the game should open and play offline.
- Check the safe areas on a phone with a notch and one with a home button.

## Leaderboards: not built, deliberately
A daily puzzle with a shared gold target suits a leaderboard (“fastest to gold”, “hint-free streaks”), but it needs either:
- **Game Center + Google Play Games:** native setup in both developer consoles, a community Capacitor plugin, and sign-in flows. No server needed. Recommended when you have the accounts.
- **Your own server:** contradicts the no-backend, no-accounts design and brings moderation, cheating and privacy work.

Nothing in the app pretends to have leaderboards until one of these is done.

## Web version
`npm run build` also produces a service worker (`dist/sw.js`) and a web manifest, so the hosted
game installs to a home screen and plays offline after the first visit. Any static host works
(Netlify, Cloudflare Pages, GitHub Pages). Serve over HTTPS.
