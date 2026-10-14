# Counselwise landing page (JSR R1 Study 8)

Static site for the Meta Ads A/B field experiment. Plain HTML, CSS and JS; no build step. GitHub Pages serves the folder as-is.

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
  `https://<user>.github.io/counselwise/?arm=single&utm_source=meta&utm_medium=paid&utm_campaign=s8&utm_content=single`
- Multi arm:
  `https://<user>.github.io/counselwise/?arm=multi&utm_source=meta&utm_medium=paid&utm_campaign=s8&utm_content=multi`

The page reads `arm` and stamps it on every `WaitlistClick` and `AdCheck` event, so the two arms can be separated in Events Manager even though both ads point at the same page.

## 5. Meta Pixel Helper check

1. Install the Meta Pixel Helper extension in Chrome.
2. Open the live URL with `?arm=single`. The helper icon should show one pixel with a `PageView` event and the correct Pixel ID.
3. Click **Join the waitlist**: the helper should list a custom event `WaitlistClick` with parameter `arm: single`.
4. Answer the question: a custom event `AdCheck` with `arm` and `answer` should appear.
5. Repeat with `?arm=multi`. In Events Manager > Test events you can watch the same events arrive in real time.

If the helper reports "Pixel did not load", check that `PIXEL_ID_HERE` has been replaced in both places and that the site is served over `https`.
