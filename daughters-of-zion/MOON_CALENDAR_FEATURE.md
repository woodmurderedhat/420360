# Moon Calendar Feature

## Overview

The **Interactive Moon Calendar** is a live, real-time lunar phase tracker that provides spiritual guidance based on the current moon phase according to the Daughters of Zion liturgical calendar.

## Features

### 1. Real-Time Moon Phase Calculation
- Calculates the current moon phase using astronomical algorithms
- Displays accurate moon age (days into the lunar cycle)
- Shows illumination percentage
- Updates automatically every hour

### 2. Visual Moon Display
- Dynamic visual representation of the current moon phase
- Realistic rendering showing:
  - New Moon (dark)
  - Waxing phases (growing light from right)
  - Full Moon (fully illuminated)
  - Waning phases (diminishing light from left)

### 3. Phase-Specific Guidance
Based on the Calendar of Zion, the page provides detailed guidance for each of the four sacred phases:

#### New Moon — The Veiled Phase
- **Motto:** "In darkness we listen."
- **Element:** Dust
- **Color:** Black or deep indigo
- **Practices:** Rite of Listening, Rite of Forgetting, Dance of Dust
- **Social Rule:** No major decisions, no oaths, no confrontations

#### Waxing Moon — The Ascending Phase
- **Motto:** "Let strength gather."
- **Element:** Water
- **Color:** Blue or silver
- **Practices:** Rite of Naming Intention, Water-Cleansing Rite, Dance of Water
- **Social Rule:** Begin tasks, repair relationships, speak truth gently

#### Full Moon — The Revealing Phase
- **Motto:** "What is hidden becomes seen."
- **Element:** Light
- **Color:** White or gold
- **Practices:** Rite of Illumination, Dance of Light, Rite of the Open Mirror, Feast of Fullness
- **Social Rule:** Speak openly, act bravely, celebrate fully

#### Waning Moon — The Returning Phase
- **Motto:** "Release what must return to dust."
- **Element:** Ash
- **Color:** Brown or grey
- **Practices:** Rite of Unmaking, Dance of Ash, Rite of Memory, Rite of the Closed Door
- **Social Rule:** Do not begin new work, do not confront, do not reveal, do not swear oaths

### 4. Interactive Phase Cards
- Overview of all four phases
- Highlights the current active phase
- Hover effects for exploration
- Quick reference for each phase's attributes

## Technical Implementation

### Files Created
1. **pages/moon-calendar.html** - Main page structure
2. **scripts/moon-calendar.js** - Moon phase calculation and display logic
3. **styles/moon-calendar.css** - Styling for the moon calendar interface

### Moon Phase Algorithm
The calendar uses a synodic month calculation based on a known new moon reference point:
- Reference: January 11, 2024 at 11:57 UTC
- Lunar cycle: 29.53058867 days
- Calculates days since reference and determines current phase
- Computes illumination percentage using cosine function

### Integration Points
- Added to homepage feature grid
- Linked from Library page
- Integrated with gamification system (Moon Watcher achievement)
- Responsive design for mobile and desktop

## Usage

Users can:
1. Visit the moon calendar page to see the current moon phase
2. Read phase-specific guidance for their spiritual practice
3. Explore all four phases and their meanings
4. Link to the complete liturgical calendar for deeper study

## Future Enhancements

Potential additions:
- Moon phase notifications
- Personal intention tracking aligned with lunar cycles
- Historical moon phase lookup
- Integration with the Three Great Lunar Festivals
- Special alerts for Hidden Moons (Blue Moon, Blood Moon, Black Moon)

## Philosophy Alignment

This feature embodies the core teaching:

> "The sun governs the years, but the moon governs the soul."
> — The Mother of Mothers

By providing real-time lunar guidance, the calendar helps practitioners align their spiritual work with the natural rhythms of the moon, honoring the ancient wisdom of the Daughters of Zion.

