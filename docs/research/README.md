# Research notes

These are the research records the shipped features were designed from: what the literature and the data say, with
the numbers and the evidence behind each. They are kept as written at the time, so the code and the other docs can
cite them by section (for example glacier-hazard-chain.md §G.9 or business-case.md §E.1). For how the app works
*today*, read [ARCHITECTURE.md](../../ARCHITECTURE.md); where a note and the code differ, the code and ARCHITECTURE.md
are current.

| Note | Read it for | Implemented in |
| --- | --- | --- |
| [glacier-hazard-chain.md](glacier-hazard-chain.md) | Glacier floods: sources, breach and routing models, debris-flow rheology, case studies, calibration residuals (§G.9) | `src/hazard/`, ARCHITECTURE.md §3.9 |
| [climate-scenarios.md](climate-scenarios.md) | Future climate: warming by pathway, rain scaling, sea-level rise, glacial-lake growth, today-vs-future EAL | `src/climate/`, README *Future climate* |
| [business-case.md](business-case.md) | Market, competitors, regulation, and the loss-model methods and tables | `src/loss/`, [BUSINESS.md](../../BUSINESS.md) |

Background research behind Deluge v2. Every number is tagged with how far it was checked:
**[V]** verified against a primary source, **[S]** secondary source, **[M]** from domain knowledge and still to be
verified, **[C]** computed, **[I]** illustrative assumption. Treat [M] and [I] values as placeholders until checked.

* [glacier-hazard-chain.md](glacier-hazard-chain.md) — glacial-lake outbursts, ice/rock avalanches, debris-flow
  rheology, 1-D valley routing, glacier melt, and case studies (Langtang/Betrawati 2026, Thame 2024, South Lhonak 2023,
  Chamoli 2021, Dig Tsho 1985, Gongbatongsha 2016, Blatten 2025). The design `src/hazard/` implements.
  [breach-check.mjs](breach-check.mjs) reproduces its breach-model table (`node docs/research/breach-check.mjs`).
* [climate-scenarios.md](climate-scenarios.md) — future-climate scenarios: AR6 warming by SSP and horizon,
  Clausius–Clapeyron and super-CC rain scaling, NOAA 2022 sea-level rise at Fort Myers, why river stages are not
  scaled, Himalayan glacial-lake growth and melt, and the Site check's today-vs-future EAL. The design `src/climate/`
  implements.
* [business-case.md](business-case.md) — market, competitors, loss modelling (JRC depth–damage curves, hazard
  classes, business interruption, expected annual loss, benefit–cost ratio), building valuation, product concept and
  pitch. The design `src/loss/` implements.
