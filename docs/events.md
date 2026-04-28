---
title: Events
layout: default
permalink: /events/
---

<h1>Event Directory</h1>
<p>Explore all the exciting events available in the Summer Olympics 2026. Filter by category, search for keywords, and find your next challenge!</p>

<section class="filters">
    <div class="filter-group">
        <label for="search-input">Search</label>
        <input type="text" id="search-input" placeholder="Search events...">
    </div>
    <div class="filter-group">
        <label for="category-filter">Category</label>
        <select id="category-filter">
            <option value="all">All Categories</option>
            <option value="Sports">Sports</option>
            <option value="Physical Challenges">Physical Challenges</option>
            <option value="Tabletop Games">Tabletop Games</option>
            <option value="Video Games">Video Games</option>
        </select>
    </div>
    <div class="filter-group">
        <label for="type-filter">Type</label>
        <select id="type-filter">
            <option value="all">All Types</option>
            <option value="individual">Individual</option>
            <option value="team">Team-based</option>
        </select>
    </div>
    <div class="filter-group">
        <label for="status-filter">Status</label>
        <select id="status-filter">
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
        </select>
    </div>
</section>

<div id="no-results" style="display: none; padding: 2rem; text-align: center; background: #fffbe6; border-radius: 6px;">
    <h3>No events match your filters</h3>
    <p>Try adjusting your search or filters to find what you're looking for.</p>
</div>

<div class="event-grid" id="event-grid">
{% assign sorted_events = site.events | sort: "displayOrder" %}
{% for event in sorted_events %}
<div class="event-card" 
     data-title="{{ event.title | downcase }}" 
     data-category="{{ event.category }}" 
     data-team-based="{{ event.teamBased }}"
     data-status="{{ event.status | default: 'open' }}"
     data-id="{{ event.id }}">
  <div class="category-badge">{{ event.category }}</div>
  <h3>{{ event.title }}</h3>
  <div class="event-meta">
    <span>⏱️ {{ event.timeEstimate }}</span> | 
    <span>📍 {{ event.location }}</span> |
    <span>{% if event.teamBased %}👥 Team{% else %}👤 Individual{% endif %}</span>
  </div>
  <p>{{ event.shortDescription }}</p>
  <div class="card-footer">
      <span class="status-badge status-open" id="status-badge-{{ event.id }}">Open</span>
      <a href="{{ event.url | relative_url }}" class="cta-button secondary" style="margin-top: 0.5rem; display: block; text-align: center;">View Details</a>
  </div>
</div>
{% endfor %}
</div>
