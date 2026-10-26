# AsyrafCloud | Open Systems Studio

**Systems in Motion** — a personal portfolio for Asyraf Mubarak. A mechanical identity, an editorial project index, and an explorable Arch Linux workspace tell one connected story.

## Run

No package manager or build step is required. Serve `dist/` from any static web server:

```sh
python3 -m http.server 8080 --directory dist
```

Open `http://localhost:8080`. Use an HTTP server rather than opening `index.html` directly, because the interactive enhancement uses JavaScript modules.

## Structure

- `dist/index.html`: semantic content and accessible static baseline.
- `dist/style.css`: responsive editorial composition and interaction states.
- `dist/assets/`: locally bundled fonts, original vector artwork, and optimized project screenshots.
- `.openai/hosting.json`: deployment configuration for the corresponding Site.

The experience is designed to work without third-party CDN requests. WebGL and motion progressively enhance the readable HTML.

## Content sources

Project descriptions and engineering approach are based on the public READMEs in [Asyraf2003/Asyraf2003](https://github.com/Asyraf2003/Asyraf2003), [schoolai](https://github.com/Asyraf2003/schoolai), [GlassPos](https://github.com/Asyraf2003/GlassPos), [meawpos-api](https://github.com/Asyraf2003/meawpos-api), [miawpos-ui](https://github.com/Asyraf2003/miawpos-ui), and [dotfiles](https://github.com/Asyraf2003/dotfiles).

SchoolAI and GlassPos images are optimized copies of their repository screenshots. MiawPOS is presented as in development; its poster is an original editorial illustration, not a product screenshot. The fourth project is this portfolio.

Nimbus Sans and Nimbus Mono PS are from URW Base35; their license and font exception are included in `THIRD_PARTY_FONTS.txt`.

## Delivery sequence

1. Editorial foundation and verified project stories.
2. Native WebGL monogram and explorable workspace.
3. WAAPI interactions, project case studies, accessibility, and browser verification.

The visual target is the craft of leading award-winning experiences. No award, certification, or measured performance claim is made by this repository.
