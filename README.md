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
