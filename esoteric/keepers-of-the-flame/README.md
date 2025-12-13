# Keepers of the Flame - Project Documentation

## Overview

**Keepers of the Flame** is an esoteric project centered around Zoroastrian storytelling traditions and sacred fire worship. It reimagines ancient oral traditions in a modern, interactive format where users become keepers of sacred stories and maintain mystical "flame streaks."

## Project Philosophy

The project honors the oral tradition heritage of Zoroastrianism while gamifying the experience through:
- **Story Collection**: Progressive story unlocks based on engagement patterns
- **Flame Maintenance**: Daily visit streaks that symbolize keeping the sacred fire burning
- **Seasonal Integration**: Stories tied to Zoroastrian festivals and seasonal cycles
- **Rank Progression**: Advancement from Spark to Sacred Fire through consistent engagement

## Gamification System

### Story Collection (8 Total Stories)

Stories unlock through various conditions:

1. **The Creation Myth** - Unlocked on first visit
2. **Ahura Mazda's Wisdom** - 5+ total visits
3. **Zarathustra's Journey** - 10+ total visits
4. **Sacred Fire Prophecy** - Maintain 7-day visit streak
5. **Nowruz: Season of Renewal** - Visit during Spring (Feb 19 - Mar 20)
6. **Tirgan: Courage Rekindled** - Visit during Summer (Jun 1 - Jul 31)
7. **Mehregan: Friendship's Circle** - Visit during Autumn (Sep 1 - Oct 31)
8. **Yalda: The Eternal Flame** - Visit during Winter (Nov 1 - Feb 18)

### Storyteller Ranks (5 Levels)

Ranks progress based on combined scoring: (Stories × 10) + (Streak × 5) + (Total Visits)

- **Spark** (0-29 points): "First light of understanding"
- **Ember** (30-99 points): "Growing warmth and knowledge"
- **Flame** (100-249 points): "Steady keeper of wisdom"
- **Bonfire** (250-499 points): "Guardian of the circle"
- **Sacred Fire** (500+ points): "Master of the tradition"

### Flame Streak System

- **Daily Tracking**: One visit per day continues the streak
- **Streak Breaks**: Missing a day resets to 1
- **Benefits**: 
  - Psychological motivation for consistent engagement
  - Unlocks special story (Sacred Fire Prophecy) at 7 days
  - Contributes to rank progression

### Seasonal Festival Integration

Four Zoroastrian festivals trigger story unlocks:

| Festival | Dates | Theme |
|----------|-------|-------|
| **Nowruz** | March 20-21 | Spring renewal, new beginnings |
| **Tirgan** | June 15 | Summer courage, valor |
| **Mehregan** | September 16 | Autumn friendship, gratitude |
| **Yalda** | December 20-21 | Winter light, eternal hope |

## Project Structure

```
keepers-of-the-flame/
├── index.html (Main hub page with stats and overview)
├── scripts/
│   └── gamification.js (Core game mechanics)
├── pages/
│   ├── stories.html (Full story collection view)
│   └── traditions.html (About Zoroastrian traditions)
├── styles/
│   └── (CSS files for project styling)
└── README.md (This file)
```

## Key Features

### Visual Design
- **Color Palette**: Fire-themed oranges (#ff6b35), golds (#d4af37), and warm accent colors
- **Pixel Aesthetic**: Maintains 420360's retro pixel design while adding fire-inspired elements
- **Animations**: Floating symbols, glowing effects, and flame-like transitions

### Data Persistence
- All progress saved to browser localStorage
- Key storage variables:
  - `totalVisits`: Cumulative site visits
  - `visitedPages`: Array of visited page names
  - `unlockedStories`: Array of unlocked story IDs
  - `currentFlameStreak`: Days of consecutive visits
  - `storytellerRank`: Current rank level (0-4)
  - `achievements`: Array of unlocked achievement IDs

### Achievement System

16 total achievements across categories:

**Story Achievements (8)**
- `story_creation_myth` to `story_yalda_eternal`

**Streak Achievements (1)**
- `flame_keeper_week`: Maintain 7-day visit streak

**Rank Achievements (5)**
- `storyteller_spark` through `storyteller_sacred`

**Collection Achievements (2)**
- `all_stories`: Unlock all 8 stories
- `all_seasons`: Experience all 4 seasonal festivals

## Hub Integration

The project integrates with the Esoteric Hub's unified gamification system:

1. **Signals**: `KeepersOfTheFlamGamification` signals progress to hub
2. **Hub Achievements**: Keepers achievements count toward hub-level progression
3. **Cross-Project**: Users can earn "Mystical Collector" achievement by exploring multiple projects
4. **Unified Leaderboard**: Hub tracks combined achievements across all projects

## Technical Implementation

### Gamification Class

`KeepersOfTheFlamGamification` handles:
- Page visit tracking
- Story unlock logic
- Flame streak management
- Seasonal festival detection
- Rank calculation
- Achievement signaling

### Storage Keys

- Main: `keepers_of_flame_progress`
- Stored in browser localStorage for persistence

### Initialization

```javascript
// Auto-initializes on DOMContentLoaded
window.keepersOfTheFlamGamification = new KeepersOfTheFlamGamification();
```

## Content Structure

### Home Page (`index.html`)
- Hero with Zoroastrian imagery
- Current stats display (stories, streak, rank, visits)
- Story cards with unlock conditions
- Rank progression visualization
- Seasonal festival information
- Game mechanics explanation

### Future Pages

**Stories Page** (`pages/stories.html`)
- Detailed story content
- Story themes and symbolism
- Cross-references to Zoroastrian traditions

**Traditions Page** (`pages/traditions.html`)
- Zoroastrian fire worship background
- Festival explanations
- Mythological context

## Achievement Standards

### Unlock Conditions

Stories unlock through:
- Direct visit count thresholds
- Temporal conditions (seasonal windows)
- Consistency metrics (flame streak)

Ranks are calculated algorithmically based on combined progress.

## Future Enhancements

1. Story content pages with full narratives
2. Audio narration for stories (with Zoroastrian musical elements)
3. Interactive flame visualization
4. Seasonal notification system
5. Community story sharing (future social feature)
6. Advanced analytics on reading patterns

## Integration with 420360

- Lives in `/esoteric/keepers-of-the-flame/`
- Links back to Esoteric Hub and main 420360 site
- Follows established pixel aesthetic
- Uses standard SEO meta tags

## Support & Documentation

- Main hub documentation: `/esoteric/ESOTERIC_HUB_GUIDE.md`
- General project structure: `/esoteric/IMPLEMENTATION_SUMMARY.md`
- For issues, refer to `/esoteric/STATUS.md`
