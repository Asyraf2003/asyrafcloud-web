# Design references — Systems in Motion

The approved direction combines a mechanical identity, an editorial project index, and a personal explorable workspace. This document identifies the source of each design decision. References inform principles; all identity geometry, layouts, shaders, and application code in this project are original implementations.

## Verified reference set

| Reference | Recognition verified on Awwwards | Primary evidence |
| --- | --- | --- |
| Lusion v3 — Lusion | Site of the Year 2023; Developer Award | [Winner entry](https://www.awwwards.com/sites/lusion-v3), [documented scroll element](https://www.awwwards.com/inspiration/scroll-animation-3) |
| Igloo Inc — abeto | Site of the Year 2024; Developer Award | [Annual winners index](https://www.awwwards.com/websites/sites_of_the_year/), [creator case study](https://www.awwwards.com/igloo-inc-case-study.html) |
| Siena Film Foundation — Niccolò Miranda and collaborators | Site of the Month, March 2025; Developer Award | [Monthly winners index](https://www.awwwards.com/websites/sites_of_the_month/), [creator case study](https://www.awwwards.com/siena-film-foundation-case-study.html) |
| Bruno Simon Portfolio — Bruno Simon | Site of the Year 2019; Developer Award | [Annual winners index](https://www.awwwards.com/websites/sites_of_the_year/), [2019 award article](https://www.awwwards.com/bruno-simon-portfolio-wins-site-of-the-month-november.html) |
| Bruno's Portfolio — Bruno Simon | Site of the Month, January 2026; Developer Award | [Monthly winners index](https://www.awwwards.com/websites/sites_of_the_month/), [creator case study](https://www.awwwards.com/brunos-portfolio-case-study.html) |

## Area-by-area decisions

| Area | Reference and studied principle | Application to Asyraf |
| --- | --- | --- |
| Opening composition | Lusion v3: an interactive introduction and scroll-led presentation as one identity. | A dominant name, quiet technical metadata, and a physical A assembly. The typography, silver/cobalt palette, and monogram are this project's own direction. |
| Typography | Siena: poster typography and a cohesive graphic language rooted in its subject. | Closely tracked Nimbus Sans, editorial scale changes, a restrained italic counterpoint, and mono annotations rooted in software tooling. We use locally licensed fonts rather than reproducing the reference's type system. |
| Hero 3D | Igloo: a branded object anchors the experience; transitions maintain its world. | Three beveled structural members, actual fasteners, and an orbital connector express a system whose parts agree. Disassembly exposes the construction. The A, metal lighting, and orbit are original. |
| Selected work and media frames | Siena: poster and footage modes give the same work different rhythms. | Four asymmetric project frames with a switch between an editorial composition and a compact index. The slots are intentionally left for the owner's future images/video. |
| Engineering approach | Siena's subject-led graphic consistency, applied as our interpretation. | Scale, spacing, numbered rules, and explicit engineering stories replace generic skill cards. Content comes from Asyraf's repositories. |
| Explorable workspace | Bruno's portfolios: learn about the author by exploring a personal world. | An orbitable desk with an Arch terminal, tools, and system modules. Click/tap or use keyboard controls to inspect three notes. The scene is a conceptual workspace, not a claim about the exact physical desk. |
| Hover | Siena's documented lettering rollover. | Clipped, staggered character rollovers, directional arrows, a quiet pointer label, and frame tilt. Motion remains subordinate to readable project names. |
| Page transitions | Siena's documented stripe transition and consistent motion direction. Igloo's scene continuity is a secondary reference. | A short, five-strip cobalt curtain carries the project index into a case-study route; a coordinated reveal introduces the new heading. Browser back/forward restores the corresponding view. |
| Scroll and section entry | Lusion's documented scroll element: coordinated progression rather than unrelated effects. | Native scrolling drives restrained object orientation and section-specific entrances. No wheel interception or forced scroll duration. |
| Contact and footer | Siena's contact lettering is the typography reference. | A large typographic invitation, rolling text, an expressive directional arrow, and a deliberately quiet technical footer. |
| Background sound | Bruno's 2026 case study documents world-level sound design. | An original, optional generative ambient score supports this project's atmosphere. A user can also choose a local audio file. Audio begins only after an explicit play gesture. |
| Mobile and reduced motion | Product constraints of this implementation. | Touch-friendly controls, preserved vertical scrolling, readable static content, motion controls, and a software 3D fallback when a GPU context is unavailable. These are our engineering choices. |

## Motion specification

- Microinteraction: 160–260 ms, with a brief character stagger.
- Section reveal: 650–850 ms, eased, with minimal travel.
- Project transition: about 800 ms, with overlapping strip and content motion.
- 3D orbit: damped input; automatic movement stops when offscreen or motion is disabled.
- Reduced motion: immediate route changes and static compositions; manual inspection remains available.

## Reference limits

The case-study descriptions and award indexes above were retrieved on 2026-10-26. Several Awwwards detail pages timed out during direct text retrieval; their indexed primary-source excerpts were available. This is not a claim to have reproduced every animation from those sites. The mappings above distinguish documented features from our interpretations.

An award is a juried outcome. These references set the craft target; this project does not claim to have won or been nominated for an award.
