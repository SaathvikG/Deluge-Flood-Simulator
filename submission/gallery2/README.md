# Torrent image gallery

12 images, 2400 × 1600 JPEG (3:2), 0.7–1.6 MB each. Upload in this order; Devpost uses the first image as the cover.
The order tells the story: **hook → what it does → why you should believe it → how far it goes.**

Every frame is the production build running live on the GPU (headless Chromium, WebGPU), captured by
`artifacts/gallery-new/capture.mjs`. Each scene is set up by clicking the app's own buttons, then paused at an exact
simulated time, so every number in a caption is the one on screen.

| # | File | Caption |
| --- | --- | --- |
| 1 | `01-pittsburgh-1936-crest.jpg` — **cover** | **Pittsburgh at the 1936 St. Patrick's Day crest.** The rivers raised to the 46 ft record and the depth of every cell coloured, from ankle-deep to second storey, over real USGS terrain and aerial imagery. |
| 2 | `02-live-solver-depth-view.jpg` | **The app, live.** 6.25 km² flooded, 83.3 million m³ of water, solved on the GPU — next to the scenario's own check against FEMA's 1 % flood zone. |
| 3 | `03-levee-keeps-north-shore-dry.jpg` | **One click builds a floodwall along the North Shore and replays the rise against it.** The land it keeps dry glows green and the strip counts it: 135 acres and 11 km of streets. |
| 4 | `04-evacuation-route-replans.jpg` | **A safe route out, re-planned as the streets flood.** From downtown to Hill District high ground: 2.2 km, 5 minutes, avoiding every road under water. |
| 5 | `05-shallow-water-equations.jpg` | **How it works, inside the app:** the 2-D shallow-water equations Torrent solves, term by term, down to the semi-implicit flux update on a staggered grid. |
| 6 | `06-site-check-verdict.jpg` | **Should we build here?** Site check sweeps a parcel through seven river levels. Dry up to the 1972 Agnes crest; at the 1936 record, 4.04 m of water, $39.5 M of damage, and the last way out cut at T+3 min. |
| 7 | `07-houston-harvey-impact-and-loss.jpg` | **Harvey's rain on Houston, in dollars.** Streets pond across the city; Impact & loss books 4,934 of 49,368 buildings reached and an estimated $2.7 B, with its range. |
| 8 | `08-flood-probability-ensemble.jpg` | **How sure is it?** Twelve perturbed runs of the 1936 crest on the GPU in 84 s: a flood-probability map, and loss as p10 / p50 / p90 — $11.0 B · $12.4 B · $14.9 B. |
| 9 | `09-glacier-flood-early-warning.jpg` | **A glacier flood in the Himalaya, and the warning it gave.** The 2026 Trishuli debris flood routed 64 km down the valley past five hydropower plants; the early-warning designer shows the existing alert reached none of the first five places before the water. |
| 10 | `10-fort-myers-ian-surge.jpg` | **Hurricane Ian's record 12.9 ft surge on Fort Myers** — checked against 25 USGS high-water-mark sites: bias +0.07 m, RMSE 0.14 m, all within ±0.3 m. |
| 11 | `11-asheville-helene.jpg` | **Hurricane Helene in Asheville.** The French Broad at 3,200 m³/s meets the Swannanoa at 1,722 m³/s — with the model's miss against the USGS gauges stated on screen. |
| 12 | `12-boulder-canyon-flash-flood.jpg` | **The 2013 flash flood out of Boulder Canyon,** in the speed view: water crossing the city at up to 12.6 m/s (28 mph). |

## Notes (for you, not for Devpost)

* **Nothing here is staged.** Pittsburgh, Houston, Fort Myers, Asheville and Boulder ship with the app and run offline;
  the Site check, portfolio and glacier shots come from the in-app *Use cases*.
* **Images 6 and 8 show the water reset.** Site check sweeps and ensembles run headless and put the user's scenario
  back afterwards, which is why the map in those two reads T+00:00:00 while the panel holds the results.
* **The Houston portfolio is fictional:** 19 made-up assets on real building footprints (README *Use cases*).
* **Re-capture** with `TORRENT_DEBUG_API=1 npm run demo`, then `node artifacts/gallery-new/capture.mjs [shot-id …]`.
  `artifacts/` is git-ignored, so the script is not committed; copy it into `scripts/` if you want to keep it.
