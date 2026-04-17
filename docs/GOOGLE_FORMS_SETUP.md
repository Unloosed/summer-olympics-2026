# Setting up Google Forms for Event Registration

This guide explains how to connect your Jekyll site to a Google Form for event registrations.

## 1. Create the Google Form

1. Go to [Google Forms](https://forms.google.com) and create a new form.
2. Add the following fields (all should be "Short answer" or "Paragraph"):
   - **Full Name** (Required)
   - **Email Address** (Required)
   - **Phone Number**
   - **Team Name**
   - **Notes / Accommodations**
   - **Event Title** (This will be hidden)
   - **Event URL** (This will be hidden)
   - **Event Slug** (This will be hidden)

## 2. Get the Form Action URL

1. Click the **Send** button in the top right.
2. Click the link icon and copy the form URL.
3. Open the form in a new tab.
4. View the page source (right-click -> **View Page Source**).
5. Search for `<form action="`. It will look something like:
   `https://docs.google.com/forms/d/e/1FAIpQLSfXXXXXXXXXXXX/formResponse`
6. Copy this URL.

## 3. Get the Field Entry IDs

1. While still viewing the page source or using Browser DevTools (F12) on the live form.
2. Search for `entry.` followed by numbers (e.g., `entry.123456789`). These can be found in a complex list of lists variable `FB_LOAD_DATA`, or in a `jscontroller` div object with the `data-fieldid` being the entry ID.
3. Map each `entry.ID` to the corresponding field in the form.
   - *Tip:* You can also find these by inspecting each input element in the form's live view.

## 4. Update the Jekyll Site

1. Open `docs/_includes/event-signup-form.html`.
2. Replace the following variables with your actual values:
   - `GOOGLE_FORM_ACTION_URL`
   - `ENTRY_NAME`
   - `ENTRY_EMAIL`
   - `ENTRY_PHONE`
   - `ENTRY_TEAM`
   - `ENTRY_NOTES`
   - `ENTRY_EVENT_TITLE`
   - `ENTRY_EVENT_URL`
   - `ENTRY_EVENT_SLUG`

## 5. Enable Registration for Events

To enable the Google Form for a specific event, add `registration_enabled: true` to the event's Markdown file in `docs/_events/`.

```yaml
---
title: My Event
registration_enabled: true
---
```

## How it Works

- The form uses a standard HTML `<form>` that POSTs to the Google Form's `formResponse` endpoint.
- It targets a hidden `<iframe>` to prevent the page from redirecting to Google's "Thank You" page.
- Jekyll automatically fills the hidden fields (`Event Title`, `Event URL`, `Event Slug`) using Liquid variables.
- JavaScript in `assets/js/events.js` detects when the iframe has loaded after a submission and displays the success message.
