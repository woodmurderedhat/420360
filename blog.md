---
layout: default
title: Blog
permalink: /blog/
---

# Blog

<div style="margin-bottom: 30px;">
  <p>Development updates, experiments, and thoughts.</p>
</div>

<ul style="list-style: none; padding: 0;">
  {% for post in site.posts %}
    <li style="margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #ddd;">
      <h3 style="margin: 0 0 5px 0;">
        <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
      </h3>
      <p style="margin: 5px 0; font-size: 14px; color: #666;">
        <span>{{ post.date | date: "%B %d, %Y" }}</span>
        {% if post.author %}
          <span style="margin-left: 15px;">by {{ post.author }}</span>
        {% endif %}
      </p>
      {% if post.excerpt %}
        <p style="margin: 10px 0;">{{ post.excerpt }}</p>
      {% endif %}
      {% if post.tags %}
        <p style="margin: 10px 0; font-size: 13px;">
          {% for tag in post.tags %}
            <span style="background: #eee; padding: 2px 8px; border-radius: 3px; margin-right: 5px;">#{{ tag }}</span>
          {% endfor %}
        </p>
      {% endif %}
    </li>
  {% endfor %}
</ul>

{% if site.posts.size == 0 %}
  <p>No posts yet. Check back soon!</p>
{% endif %}
