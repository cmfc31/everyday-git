# Everyday Git

An interactive guide for people who are starting to work with Git and GitHub. The site teaches GitHub Flow: one main branch, short branches, and a pull request so a teammate can review the change.

You do not write commands. Each lesson puts you in a work situation, and you decide what to ask your AI agent. The real commands stay hidden behind a button, in case you want to see them.

The site is in Latin American Spanish and English, with a light theme and a dark theme. Progress is saved in the browser.

## The story

You and Ana work at a restaurant. The project is the weekend menu customers see. Across the lessons you change it together, but customers should not see a change that is not ready yet.

## Screens

### Home

![Home page](docs/screenshots/inicio.png)

### The path

![List of the eight lessons](docs/screenshots/lecciones.png)

### A lesson

Each lesson has four parts: a background you can skip, the idea for that lesson, a scene to practice, and a five-question quiz. The lesson is complete when you finish the practice and answer all five correctly.

![Lesson 1, a draft of the menu](docs/screenshots/leccion.png)

![Practice in lesson 1](docs/screenshots/practica.png)

## Lessons

1. **A draft of the menu.** A branch is a named draft. `main` stays the menu customers see.
2. **Project copies and pull.** A pull brings onto your computer what the team already has.
3. **Saving a change.** A commit is a named snapshot of the files you choose.
4. **Sending your work.** A push shares your branch, but it does not merge it.
5. **Asking to merge.** A pull request is a conversation, not an overwrite.
6. **Review day.** Comments are answered on the same request.
7. **Someone else moved main.** If main moved ahead, bring it into your branch before you continue.
8. **Two people edited the same thing.** A conflict is a decision about one spot in a file.

## Development

```bash
npm install
npm run dev
```

The app is served at `http://127.0.0.1:5173/everyday-git/`.

```bash
npm run build
npm run preview
```

## Publishing

The GitHub Pages workflow is in `.github/workflows/pages.yml`. It publishes on a push to `main` or `master`. The site base path is `/everyday-git/`, so the repository must be named `everyday-git`.
