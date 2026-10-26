# Design references — Systems in Motion

## The two primary benchmarks

The owner explicitly selected **Lusion.co** and **Lando Norris** as the craft standard. They govern this implementation's art direction, interaction rhythm, and final review.

1. **[Lusion.co](https://lusion.co/)** — current studio website retrieved on 2026-10-26. Its own description connects 3D storytelling, interaction, featured work, approach, and an experimental practice. Its current page also exposes play/mute controls. The historical **Lusion v3** won Awwwards Site of the Year 2023 and a Developer Award; this is an award record for v3, not a claim that the current site is the exact 2023 build.
2. **[Lando Norris](https://www.itsoffbrand.com/our-work/lando-norris)** — OFF+BRAND.'s primary creator case study. It describes personality-driven motion, sharp transitions, responsive interactions, cinematic scrolling, bold typography, and 3D/WebGL. Awwwards lists the site as Site of the Year 2025 with a Developer Award.

Award evidence: [Awwwards Sites of the Year](https://www.awwwards.com/websites/sites_of_the_year/). Lusion's specific scroll reference: [documented v3 element](https://www.awwwards.com/inspiration/scroll-animation-3).

## Section and style map

These are interpretations of the references, with original geometry and application code. The map does not imply an identical reproduction of their artwork or technology.

| Area | Main reference | Decision in this portfolio |
| --- | --- | --- |
| Opening composition | Lando's strong typographic personality; Lusion's interactive introduction | A dominant name, quiet metadata, and a structural A assembly create a personal opening. |
| Typography | Lando's confident hierarchy | Tight Nimbus Sans, large scale changes, mono annotations, and a restrained italic counterpoint. The licensed font choices and typography system are ours. |
| Hero 3D | Lusion's connection between a subject and its 3D experience | Three beveled members, fasteners, and a cobalt orbit express an engineered system. Disassembly reveals its construction. The A and its materials are original. |
| Selected work | Lusion's featured-work progression; Lando's immersive galleries | Four asymmetric frames, a compact index, category filtering, and four owner-fillable media areas. |
| Approach section | Lando's personality-led storytelling | Concrete engineering principles and verified repository stories take the place of generic capability cards. |
| Personal workspace | Lusion's interactive world-building | An orbitable conceptual Arch desk connects the terminal, tools, and mindset. It represents the user's software setup, not a verified exact physical desk. |
| Hover | Lando's responsive, immediate interaction rhythm | Rolling letters, directional arrows, subtle frame response, and an exploration pointer. The rollover implementation is original. |
| Project transitions | Lusion's continuity and Lando's sharp momentum | A five-strip cobalt reveal carries the same identity into a full-page project route. Focus and browser history travel with the content. |
| Scroll and section entry | Lusion's documented scroll presentation; Lando's cinematic progression | Native scrolling, restrained object orientation, and section-specific entrances. No wheel interception. |
| Contact and footer | Lando's typography and clear personal voice | A large invitation, rolling type, an expressive arrow, and a quiet technical footer. |
| Background audio | Lusion's integrated media controls, with an original audio design | An optional generative ambient score, volume, and local-track selection. Playback starts only after a play gesture. |
| Mobile and motion preferences | Engineering choices made for this implementation | Preserved vertical touch scrolling, keyboard controls, motion pause, static content, and a depth-buffered software 3D path when WebGL is unavailable. |

## Motion specification

- Microinteraction: 160–440 ms, with a short character stagger.
- Section entrance: 650–850 ms, small travel and restrained blur.
- Project route: approximately 900 ms; overlapping strips and coordinated content reveal.
- Workspace: damped orbit and inspection changes; render on demand when idle.
- Reduced motion: immediate route state, readable static compositions, and manual inspection.

## Secondary studies

Earlier exploratory studies included [Igloo Inc](https://www.awwwards.com/igloo-inc-case-study.html), [Siena Film Foundation](https://www.awwwards.com/siena-film-foundation-case-study.html), and [Bruno Simon](https://www.awwwards.com/brunos-portfolio-case-study.html). Siena documents stripe transitions and lettering rollover; Bruno documents author discovery through a personal world. These informed the exploration. They are not the owner's final primary benchmarks.

## Verification and limits

The reference descriptions and award evidence were retrieved on 2026-10-26. Some Awwwards detail pages timed out, so available indexed primary-source excerpts were used alongside successfully retrieved pages. The OFF+BRAND. case study returned readable source content through search, while its browser view remained blank. No claim is made that every live animation was visually inspected.

All project-media slots are intentionally unfilled. No award, certification, studio affiliation, or measured performance result is claimed for this portfolio.
