# Devpost submission — Deluge

Paste-ready text for the Devpost form. Every claim below is checked against [README.md](../README.md),
[ARCHITECTURE.md](../ARCHITECTURE.md) and [docs/VALIDATION.md](../docs/VALIDATION.md) in this repo. The image
gallery and its captions are in [GALLERY.md](GALLERY.md).

**Contents:** [Built with](#built-with) · [Try it out](#try-it-out) · [Elevator paragraph](#elevator-paragraph) ·
[Numbers you can quote safely](#numbers-you-can-quote-safely) · [Before you paste this](#before-you-paste-this)

---

## Built with

25 tags, the Devpost maximum. Lowercase, one per box.

```
webgpu
wgsl
compute-shaders
typescript
vite
node.js
electron
playwright
geotiff
leaflet
shallow-water-equations
computational-fluid-dynamics
gpu-computing
numerical-analysis
dijkstra
geospatial
usgs-3dep
lidar
naip
esri
tiger-line
openstreetmap
nominatim
noaa
copernicus-dem
```

Why each one is defensible, if a judge asks:

| Tag group | What it actually is in the repo |
| --- | --- |
| `webgpu` `wgsl` `compute-shaders` | The solver is WGSL compute shaders — momentum and continuity passes in `src/sim/shaders/`. No WebGL fallback, no CPU solver in the product. |
| `typescript` `vite` `node.js` | The whole app is TypeScript on Vite; Node 20.19+ / 22.12+ to build. Zero runtime frameworks. The same TypeScript runs headless as the `deluge` CLI on Node. |
| `electron` | `electron/` wraps the same static build as `Deluge.app` — a privileged `app://deluge/` origin, no preload, no IPC, no listening port. |
| `playwright` | Drives the end-to-end, performance, visual-regression and security suites on a real GPU through headless Chromium. |
| `geotiff` `leaflet` | The only two runtime dependencies: GeoTIFF parses USGS elevation rasters, Leaflet is the *Pick any US location* map. |
| `shallow-water-equations` `computational-fluid-dynamics` `numerical-analysis` `gpu-computing` | Local-inertial 2-D shallow water with upwind advection, a CFL-adaptive time step, semi-implicit friction, a positivity-preserving flux limiter and well-balanced face depths. |
| `dijkstra` | `src/routing/` — travel-time Dijkstra over the road graph, re-planned as edges flood. |
| `usgs-3dep` `lidar` `naip` `esri` `tiger-line` `openstreetmap` `nominatim` `noaa` `copernicus-dem` `geospatial` | Every data source the app names in its own *How it works → Data* panel. Copernicus GLO-30 is the elevation behind the three Himalayan scenes and the global fallback (`src/data/demGlobal.ts`). |

---

## Try it out

**Link 1 — the code**
`https://github.com/SaathvikG/Deluge-Flood-Simulator`
The full repo: solver, shaders, data pipeline, analyses, tests, desktop wrapper, and `ARCHITECTURE.md`.

**Link 2 — run it**
`https://deluge-flood-simulator.vercel.app/`
`npm run build` emits a static site with relative URLs, so it runs from any static host (the repo also carries
`.github/workflows/pages.yml` for GitHub Pages). **Deploy it before you paste this link, then open it once in Chrome to
confirm.** A hosted copy needs a WebGPU browser (Chrome / Edge / Brave 113+, Safari 26+, Firefox 141+ on Windows or 147+
on Apple silicon). If the deployment isn't live in time, drop this link rather than ship a 404.

*Optional third:* `https://github.com/SaathvikG/Deluge-Flood-Simulator/blob/main/ARCHITECTURE.md` — the numerical
method in full, including the validation tables.

---

## Elevator paragraph

> Deluge loads real USGS elevation for a place in the United States and solves the 2-D shallow-water equations on your
> GPU with WebGPU compute shaders, live in a browser tab. Raise the Allegheny and the Monongahela to the 1936 crest and
> watch the Golden Triangle go under; draw a levee and see the land it keeps dry counted in acres; crank the rain to
> Harvey levels; drop a pin and watch the evacuation route re-plan as roads flood. A million cells of momentum and
> continuity run every frame at 60 fps and roughly 70× real time on an Apple M4, with the mass-balance error staying
> under 0.001 % at the crest. On top of the flood it estimates damage and dollar loss per building, checks whether a
> parcel's occupants can get out before the last road closes, runs ensembles for a flood-probability map, and compares
> mitigation designs with a benefit–cost ratio. Nothing here is a wrapper: no language models, no hosted simulation
> service, no baked animation. The method is checked against the Ritter dam-break solution, a Float64 CPU reference, a
> 16× finer grid, the National Weather Service's impact statements for the Pittsburgh Point gauge, and real floods —
> USGS high-water marks and FEMA flood zones — and every cubic metre is booked in a ledger you can watch in the corner
> of the screen.

Short version, if the field is tight:

> Real-time flood simulation on real terrain: the 2-D shallow-water equations solved on the GPU in WGSL compute
> shaders, over USGS lidar elevation, with levees you can draw, evacuation routes that re-plan as roads go under, and
> loss, egress and benefit–cost numbers from the same run. 60 fps and ~70× real time on an M4, mass conserved to under
> 0.001 %.

---

## Numbers you can quote safely

All measured, all in the repo.

| Claim | Source |
| --- | --- |
| 60 fps, p95 frame 18.7 ms, 68–73× real time at 1600×1000, Apple M4, crest + 50 mm/hr rain | `ARCHITECTURE.md §8.1` |
| HUD mass-balance error < 0.001 % at the 1936 crest, with or without hurricane rain | `README.md` → Validation |
| Solver mass error 7·10⁻⁹ closed / ≤ 9.1·10⁻⁸ open, in tests | `tests/sim/conservation.test.ts` |
| Dam break vs the Ritter analytic solution: 1.6 % L1 profile error | `tests/sim/dambreak.test.ts` |
| GPU Float32 vs Float64 CPU reference: max \|Δh\| ≤ 4.3·10⁻⁵ m over 5 cases × 400 steps | `tests/sim/reference.test.ts` |
| Lake at rest on rough terrain, 2000 steps: max \|u\| = 9.3·10⁻⁵ m/s | `tests/sim/wellbalanced.test.ts` |
| Grid convergence: the 1024² demo grid vs a 4096² run, 1936 crest — flooded area −0.92 %, extent overlap 98.0 % | `ARCHITECTURE.md §9.1` |
| Water surface at the Point within 3 cm of the NWS gauge reading at every stage | `ARCHITECTURE.md §4` |
| Hurricane Ian, Fort Myers: 25 USGS high-water-mark sites, bias +0.07 m, RMSE 0.14 m, all within ±0.3 m | `docs/VALIDATION.md` |
| FEMA 1 % flood zone at FEMA's 1 % level: CSI 88 % (Fort Myers), 82 % (Nashville), 61 % (Pittsburgh) | `docs/VALIDATION.md` |
| 1,043 unit tests, 31 end-to-end flows, plus perf / visual / security / desktop suites | `README.md` → Testing |
| 1024 × 1024 cells, 7.8 m per cell, 8 km square (Pittsburgh) | in-app scenario panel |

**Say these limitations out loud** (saying them first is what makes the rest credible):

* bare-earth terrain by default, so water flows under bridges and, unless *Buildings block flow* is switched on,
  through buildings;
* no riverbed survey, so channels are burned to a nominal depth;
* one Manning's n for the whole map by default;
* the river *rise* is a time-lapse; the flood after it runs at real speed;
* a first-order scheme;
* validated against real floods, not calibrated to them — and low by 1–2 m where a scene's discharge or rainfall
  duration is not the event's (Asheville, Houston);
* frame-rate figures are measured on an Apple M4; batch and ensemble speeds on a GTX 1660 Ti.

---

## Before you paste this

1. **Check the build you link.** Every feature in the gallery — the 3D city, Asheville, Nashville, Houston, Boulder
   and Fort Myers — is on `main`, so a build of `main` matches the screenshots.
2. **Deploy before you link.** Link 2 only works once the hosted copy is live; open it in Chrome to confirm.
3. **Mention the desktop path** in the long description. `npm run app:build` → `release/Deluge.app` (ad-hoc signed,
   ~330 MB) is the offline, no-terminal, no-browser way to present, and it is the same static build.
4. **Mention the business layer** if the field allows: Site check, portfolios, ensembles, dam breaches, coastal surge
   and design comparison are described with worked numbers in [BUSINESS.md](../BUSINESS.md).
