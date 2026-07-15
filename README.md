# Hearth & Code · Field Journal

A public research desk log tracking the [Exocore][] project, explorations
in Applied AI, and the craft of building scaffolding for neurodivergent
learners.

[Exocore]: https://github.com/hearthandcode/exocore-platform

> This project was built with AI assistance (Hermes Agent / Virgil). See
> [LICENSE](LICENSE) for AI-provenance details.

This is a working journal: experimental, rough, and explicitly a work in
progress. Posts capture the process of applied
research: design notes, literature surveys, prototype postmortems, and
architectural decisions. Some entries will be wrong. That's the point.

## About the project

The Exocore is a long-form applied research framework asking: *can we
build AI-native scaffolding with neurodivergent learners as a first-class
design target?*

This journal is the public-facing surface of that work. It contains no
private data, no personal history, and no diagnostic claims. It reflects
the thinking of its contributors. It does not speak for Hearth & Code as an entity.

## Technical notes

- Built with [Astro](https://astro.build) 7 and [React](https://react.dev)
  18
- Content authored in Markdown with strict YAML frontmatter
- Published entries are syndicated through the local and deployed RSS endpoint at `/rss.xml`
- This repository contains no analytics, tracking, or cookie code
- Typography: a monospace fallback stack that uses JetBrains Mono when it is available locally
- Reading mode control for accessibility

## License

- **Code** (everything in `src/`, `astro.config.mjs`, `tsconfig.json`,
  etc.): [MIT](LICENSE)
- **Content** (everything in `src/content/`): [Creative Commons
  Attribution 4.0 International](CONTENT-LICENSE.md)

## Running locally

```sh
npm install
npm run dev     # development server at localhost:4321
npm run build   # production build to dist/
npm run preview # preview production build
```

## Contributing

This journal is **not** open for guest posts. If you find an error, a
broken link, or have a substantive comment, open an issue on the
repository. Pull requests for typo fixes are welcome; larger contributions
should be discussed first.