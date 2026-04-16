# Contributing to Summer Olympics 2026

Thank you for your interest in contributing to the Summer Olympics 2026 project! This document outlines the process for adding new events and awards to the site.

## Adding a New Event

Events are managed as Markdown files in the `docs/_events/` directory.

1.  **Create a new file:** Create a new `.md` file in `docs/_events/`. Use a slug-friendly filename (e.g., `marathon.md`).
2.  **Add Front Matter:** Each event file must contain YAML front matter. Here is a template:

    ```yaml
    ---
    id: unique-numeric-id
    title: Event Title
    category: Sports | Physical Challenges | Board Games | Card Games | Video Games
    shortDescription: A brief summary of the event.
    description: |
      A detailed description of the event.
    ruleset: |
      1. Rule one
      2. Rule two
    timeEstimate: e.g., 1 hour
    location: e.g., North Field
    capacity: maximum number of participants
    teamBased: true | false
    status: open | closed
    displayOrder: numeric value for sorting
    ---
    ```

3.  **Add Content:** You can add additional information or stories about the event below the front matter.

## Adding a New Award

Awards are managed as Markdown files in the `docs/_awards/` directory.

1.  **Create a new file:** Create a new `.md` file in `docs/_awards/` (e.g., `mvp.md`).
2.  **Add Front Matter:**

    ```yaml
    ---
    title: Award Name
    description: A short description of the award.
    icon: 🏅 (or any emoji)
    criteria: Description of what is required to win.
    ---
    ```

3.  **Add Content:** Add a longer description of the award's significance below the front matter.

## Development Setup

The site is built using Jekyll. To run it locally:

1.  Ensure you have Ruby and Bundler installed.
2.  Install dependencies: `bundle install`
3.  Build the site: `bundle exec jekyll build --source docs --destination _site`

## Navigation and Links

When adding new pages, ensure links use the `.html` extension for consistency (e.g., `[Link](/page.html)`).
