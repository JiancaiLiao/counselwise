# Counselwise landing page (JSR R1 Study 10; copied from Study 8 on 26 Oct 2026)

Static site for the Meta Ads A/B field experiment. Plain HTML, CSS and JS; no build step. GitHub Pages serves the folder as-is.

**S10 changes from the S8 page (26 Oct 2026).** The page content is identical for both arms and carries no arm-related text. The pixel events now record the arm on both custom events: `WaitlistClick {arm}` and `MC_answer {arm, answer}` (the S8 event `AdCheck` renamed; `answer` is `one`, `four` or `dont_remember`). The arm is read from `?arm=` (single or multi), kept in session storage for the visit, and recorded as `unknown` when the parameter is missing or invalid. The privacy notice, the debrief page and the footer line state which events and parameters the pixel records. The S8 advert PNGs were removed from `assets/`. **Not pushed to GitHub**: whether S10 reuses the `counselwise` repository or a new path is the author's decision after the ethics check, so steps 2 and 3 below are on hold.

## Files

| File | Purpose |
|---|---|
| `index.html` | Landing page with waitlist panel and Meta Pixel snippet |
| `debrief.html` | "About this study" page |
| `privacy.html` | Privacy and cookie notice |
| `styles.css` | Shared styles |
| `app.js` | Arm detection, waitlist panel, pixel events |
| `assets/logo.svg`, `assets/favicon.png` | Placeholder brand assets (overwritten by the brand script) |

## 1. Paste the Pixel ID

In `index.html`, find the line marked `>>> REPLACE PIXEL_ID_HERE` in the `<head>` and replace `PIXEL_ID_HERE` in **both** places (the `fbq('init', ...)` call and the `<noscript>` image URL) with the Pixel ID from Meta Events Manager.

Until a real ID is in place `fbq` still loads, so the console fallback will not fire; test the event wiring locally by temporarily commenting out the pixel `<script>` block, or just watch the Network tab for `facebook.com/tr` requests.

## 2. Test locally

```sh
cd "<this folder>"
python3 -m http.server
```

Open `http://localhost:8000/?arm=multi` (or `?arm=single`), then open the browser console. You should see:

- `[pixel] arm = multi` on load
- with the pixel snippet disabled: `[pixel] track PageView`, then `[pixel] trackCustom WaitlistClick {arm: "multi"}` on the button, then `[pixel] trackCustom AdCheck {arm: "multi", answer: "one" | "four" | "unknown"}` after an answer.

Navigate to `http://localhost:8000/` without a query string in the same tab: the arm should still be `multi` (held in sessionStorage). A new tab with no `?arm=` gives `unknown`.

Check at 360px width (DevTools device mode) that there is no horizontal scroll, and that Esc closes the panel.

## 3. Publish on GitHub Pages

1. Create a **public** repository named `counselwise` on GitHub (no README, no licence; leave it empty).
2. From this folder:

   ```sh
   git init -b main
   git add .
   git commit -m "Counselwise landing page"
   git remote add origin https://github.com/<user>/counselwise.git
   git push -u origin main
   ```

   The contents of this folder (not the folder itself) must sit at the root of the repository.
3. In the repository go to **Settings > Pages**. Under *Build and deployment* choose **Deploy from a branch**, branch `main`, folder `/ (root)`. Save.
4. Wait a minute or two, then open `https://<user>.github.io/counselwise/`. The first deploy can take up to ten minutes; later pushes are faster.

Any later edit is just another commit and push to `main`.

## 4. Ad URLs

Use one destination URL per ad, differing only in the `arm` and `utm_content` values:

- Single arm:
  `https://<user>.github.io/<repo>/?arm=single&utm_source=meta&utm_medium=paid&utm_campaign=s10&utm_content=single`
- Multi arm:
  `https://<user>.github.io/<repo>/?arm=multi&utm_source=meta&utm_medium=paid&utm_campaign=s10&utm_content=multi`

The page reads `arm` and stamps it on every `WaitlistClick` and `MC_answer` event, so the two arms can be separated in Events Manager even though both ads point at the same page. A visit without a valid `arm` is recorded as `unknown`.

## 5. Meta Pixel Helper check

1. Install the Meta Pixel Helper extension in Chrome.
2. Open the live URL with `?arm=single`. The helper icon should show one pixel with a `PageView` event and the correct Pixel ID.
3. Click **Join the waitlist**: the helper should list a custom event `WaitlistClick` with parameter `arm: single`.
4. Answer the question: a custom event `MC_answer` with `arm` and `answer` (`one`, `four` or `dont_remember`) should appear.
5. Open the URL without `?arm=` in a fresh tab: both events should carry `arm: unknown`.
6. Repeat with `?arm=multi`. In Events Manager > Test events you can watch the same events arrive in real time.

If the helper reports "Pixel did not load", check that `PIXEL_ID_HERE` has been replaced in both places and that the site is served over `https`.
