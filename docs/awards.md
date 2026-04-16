---
title: Awards
layout: default
permalink: /awards.html
---

<h1>Awards & Special Recognition</h1>
<p>In addition to event medals, we honor exceptional performance with these special awards presented at the Closing Ceremony.</p>

<div class="award-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; margin-top: 2rem;">
{% for award in site.awards %}
  <div class="award-card" style="border: 1px solid #ddd; padding: 1.5rem; border-radius: 8px; background: #fff;">
    <div style="font-size: 2rem; margin-bottom: 1rem;">{{ award.icon }}</div>
    <h3>{{ award.title }}</h3>
    <p>{{ award.description }}</p>
    <a href="{{ award.url | relative_url }}" class="cta-button secondary" style="display: block; text-align: center; margin-top: 1rem;">View Details</a>
  </div>
{% endfor %}
</div>
