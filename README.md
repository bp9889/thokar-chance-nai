# THOKAR চান্স NAI

**Ajker bazar-er ashol dam.** Today's usual retail prices for 70 fruits, vegetables, shak and moshla in Dhaka, with a bargaining game (Dor-দাম with Kashem bhai) and a bazar list that tells you how much cash to carry.

## How prices stay fresh
- `scripts/update-prices.mjs` pulls the government's daily Dhaka price reports: TCB (Trading Corporation of Bangladesh) and DAM (Department of Agricultural Marketing).
- `.github/workflows/update-prices.yml` runs it twice a day (14:17 and 19:47 Dhaka). If prices changed, it commits `public/prices.json`, and Vercel redeploys.
- Every number is sanity-checked (no 3x jumps, no upside-down ranges). A bad or missing report never overwrites good data.
- The site shows how fresh each price is: "Aj update", "2 din age update", or **Update pending** after 7 days without a fresh report. Items no report covers show "approx.".

Run it by hand: `npm run update-prices` (add `DEBUG=1` to print what each source returned), or use **Actions → Update prices → Run workflow** on GitHub.

## Develop
```
npm install
npm run dev
npm run build
```

## Android app

`android/` is a small native app (one `MainActivity`): the live site in a full-screen WebView with a
potato loading screen, pull to refresh, a no-internet screen, and outside links (WhatsApp, the APK) opened
in the phone's own apps. Because it loads the live site, site changes reach app users without a new APK.

- **Building:** `.github/workflows/android.yml` builds it on GitHub whenever `android/` changes and
  force-pushes the **unsigned** file to the `android-build` branch.
- **Signing:** the signing key is kept off GitHub. Sign with
  `python3 scripts/sign_apk.py unsigned.apk public/thokar-chance-nai.apk key.p12 password-file`
  (APK signature v2; check with `python3 -m apksigtool verify`). Every update must use the same key,
  or phones refuse to install it over the old app.
- **New version:** raise `versionCode` in `android/app/build.gradle.kts` and `APP_VERSION` in
  `MainActivity.java`, push, sign the new build, replace `public/thokar-chance-nai.apk`, deploy.

## Offline and install

`public/manifest.webmanifest`, `public/sw.js` and `public/icons/` make the site installable. The service
worker keeps the last good copy of the page and `prices.json`, so the last prices open without internet.
