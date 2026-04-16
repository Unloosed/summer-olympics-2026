# 🏅 Summer Olympics 2026

Welcome to the official repository for the **Summer Olympics 2026**! This project is a Jekyll-powered static site dedicated to organizing and documenting the upcoming family and friends Olympic games in June 2026.

## 📂 Project Structure

- `docs/`: The source directory for the Jekyll site.
  - `_events/`: Markdown files for each competition event.
  - `_awards/`: Markdown files for special recognition awards.
  - `_layouts/`: Jekyll layouts for the site (default, event, award).
  - `assets/`: CSS and JavaScript files.
  - `index.html`: The landing page.
  - `events.md`: The event directory with search and filter capabilities.
  - `awards.md`: The directory for special awards.
  - `charter.md`: Official rules and event categories.
- `_config.yml`: Jekyll configuration for the project.
- `CONTRIBUTING.md`: Guidelines for adding new content.

## 🚀 GitHub Pages

This repository is hosted via GitHub Pages. The site is served from the `/docs` folder on the main branch.

Visit the live site: [Summer Olympics 2026](https://unloosed.github.io/summer-olympics-2026/)

## ✨ Key Features

- **Event Directory:** Browse and filter events by category, type (team/individual), and status (open/closed).
- **Awards Section:** Learn about special honors like the *Olympic Champion* and *Iron Warrior*.
- **Mock Registration:** A client-side "registration" system using `localStorage` to simulate signing up for events.
- **Responsive Design:** A clean, accessible layout for all devices.

## 🛠️ Local Development

To run the site locally:

1.  **Install Ruby and Bundler.**
2.  **Install dependencies:**
    ```bash
    bundle install
    ```
3.  **Build and serve the site:**
    ```bash
    bundle exec jekyll serve --source docs
    ```

## 🤝 Contributing

We welcome additions of new events and awards! Please refer to [CONTRIBUTING.md](CONTRIBUTING.md) for detailed instructions.

---
*Let the games begin!* 🏅
