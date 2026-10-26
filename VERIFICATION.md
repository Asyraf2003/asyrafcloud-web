# Verification — cinematic rebuild

Checked on 27 October 2026 (Asia/Makassar).

## Reproducible checks

`node scripts/check.mjs` passes JavaScript syntax, unique HTML IDs, local assets, section anchors, four project routes, all 19 media configuration slots, the local-audio CSP policy, and the retained hosting identity. It also runs the geometry check: 19,968 triangles across eight capped sculpture members, finite attributes, unit normals, and bounded framing coordinates.

## Browser coverage

- Chrome cloud browser, approximately 1363 × 936 desktop viewport.
- Same-browser responsive frames at 390 × 844 and 320 × 740. Their usable widths are 375 and 305 pixels because of scrollbars. Document scroll widths equal those usable widths.
- Software 3D rendering visually reviewed: large close framing, assembled/separated forms, and a full-stage scroll composition. Expand/reconnect state and the corrected internal scroll position were checked.
- Desktop project index moved from SchoolAI to GlassPos. GlassPos opened with its correct title, close-button focus, and route. Escape returned to the previous page. In a second route pass, SchoolAI → next project reached GlassPos, retained close-button focus, and removed its transition mask.
- The mobile menu reached the identity chapter. SchoolAI opened at the narrow width with no horizontal overflow.
- Full-screen navigation, workspace tool-note switching, and design notes were checked. The menu has distinct accessible labels for its serif/sans rollover layers.
- Generative audio Play reported Playing. Volume changed 22% → 21% and was restored. A temporary WAV was selected through the actual file chooser, reported as a local track, and reset. Final sound state is paused.
- Motion Off switched the desktop project track to a column with no transform. Motion On was restored.
- A focused control originally caused the clipped hero to scroll internally; structural clipping now uses `overflow: clip`, and `hero-stage.scrollTop` remains 0 after interaction.
- The fixed audio dock has reserved space above the footer links and beside the opening scroll link.
- The transition overlay uses the browser top layer so it can cover native project dialogs. It is removed after the route change.
- Empty image/video slots issue no requests. The screenshot composition contains original code-rendered geometry and intentionally empty planes.

## Limits

The cloud browser reports no WebGL context, so the GPU path has not been executed here. Software rendering is deliberately slower and is not a proxy for native GPU frame-rate testing. Before presenting a performance claim, test the WebGL path on a GPU-enabled desktop and a physical phone.

No Lighthouse score, formal accessibility audit, broad browser certification, or production audio-mastering claim is made. Supplied reference recordings were inspected as time-indexed frame sequences; no source-site assets are copied.
