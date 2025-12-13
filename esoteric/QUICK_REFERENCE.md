# Esoteric Hub Quick Reference

## 🌙 What Is It?

A mystical gateway hub page that unifies all esoteric content on 420360 with cross-project gamification and achievement tracking.

## 📍 Navigation

### Access From Main Site
- **Button**: Click "ESOTERIC" in header (top center)
- **Keyboard**: Press **E**
- **URL**: `/esoteric/index.html`

### Browse Esoteric Content
1. From Hub → Click "Daughters of Zion" card
2. Explore sections (Seven Veils, Rituals, etc.)
3. Return to Hub to check progress

## 📊 Hub Dashboard

**Displays Four Key Metrics:**

| Metric | Shows |
|--------|-------|
| Content Explored | Sections visited in all projects |
| Achievements Unlocked | Total achievements earned |
| Current Rank | Your progression level (Initiate → Enlightened) |
| Total Visits | Lifetime hub visits |

## 🏆 Achievement System

### How to Earn Achievements

| Achievement | How to Unlock |
|------------|--------------|
| Esoteric Explorer | Visit the hub |
| Daughters Initiate | Start exploring Daughters of Zion |
| Daughters Seeker | Visit 5 different sections |
| Daughters Master | Visit all 8 Daughters sections |
| Spiritual Pilgrim | Unlock 10+ achievements total |
| Enlightened Soul | Unlock 25+ achievements total |
| Mystical Collector | Earn achievements from multiple projects |
| Lunar Devotee | Unlock all moon phase achievements |
| Dedicated Student | Make 10 hub visits |
| Circle Sister | Make 50 hub visits |

### Achievement Unlocking
- ✓ Automatic - unlock when criteria met
- 📢 Toast notification appears
- 💾 Progress saved to browser
- 🎯 Shows in hub achievements grid

## ⭐ Ranking System

**Progress Through 6 Ranks:**

```
Initiate (0 pts)
    ↓
Seeker (5 pts)
    ↓
Wanderer (15 pts)
    ↓
Keeper (30 pts)
    ↓
Circle Mother (50 pts)
    ↓
Enlightened (100 pts)
```

**How Points Work:**
- 1 point = 1 achievement unlocked
- Points come from hub + all sub-projects
- Progress bar shows distance to next rank

## 📁 File Structure

```
esoteric/
├── index.html                 ← Hub landing page
├── styles/
│   └── esoteric-hub.css       ← Styling
├── scripts/
│   └── esoteric-gamification.js ← Tracking system
├── daughters-of-zion/         ← Primary content
│   ├── index.html
│   ├── pages/
│   ├── scripts/
│   └── styles/
└── [Future projects here]
```

## 💾 Data & Storage

**Saved Locations (Browser localStorage):**
- `esoteric_hub_progress` - Hub achievements/visits
- `daughters_of_zion_progress` - Daughters achievements/progress

**Persistence:**
- ✓ Saves automatically
- ✓ Persists across sessions
- ✓ No external servers
- ✓ Private to your browser

## 🎨 Design Theme

**Color Palette:**
- Dark Background: `#1a1f1a`
- Primary Green: `#4a8c3a`
- Mystical Purple: `#6b4c9a`
- Gold Accent: `#c9a961`
- Light Text: `#e8f5e8`

**Style Elements:**
- Pixel font (Press Start 2P)
- Retro borders & shadows
- Animated symbols
- Glowing effects
- Responsive layout

## 🔧 For Developers

### Add New Esoteric Project

1. **Create folder**: `esoteric/my-project/`
2. **Register in gamification.js**:
   ```javascript
   this.projects['my-project'] = {
       name: 'My Project',
       icon: 'emoji',
       sections: ['section1', 'section2'],
       achievements: ['ach1', 'ach2']
   };
   ```
3. **Add hub achievement**:
   ```javascript
   this.hubAchievements['my_achievement'] = {
       name: 'Achievement',
       desc: 'Description',
       icon: 'emoji',
       category: 'my-project',
       requirement: () => this.countVisitedSections('my-project') >= 1
   };
   ```
4. **Add card to hub page** (esoteric/index.html)

### Update Stats in Real-Time
- Hub checks Daughters progress every 1 second
- Automatic sync via localStorage
- No manual refresh needed

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **E** | Open Esoteric Hub |
| **D** | Open Daughters of Zion |
| **Esc** | Close overlays |

(Other 420360 shortcuts: A=About, G=Games, M=Music, S=SFX)

## 🐛 Troubleshooting

**Achievement not unlocking?**
- Wait 1 second for automatic check
- Refresh page to force update
- Check browser console for errors

**Stats not updating?**
- Hub syncs every 1 second
- Try refreshing page
- Check localStorage is enabled

**Links not working?**
- Verify folder structure exists
- Check file paths are correct
- Test in new browser tab

## 📖 Documentation

- **Full Guide**: See `ESOTERIC_HUB_GUIDE.md`
- **Implementation**: See `IMPLEMENTATION_SUMMARY.md`
- **Code Comments**: In `.js` and `.css` files

## 🎯 Quick Stats

- **Load Time**: <500ms
- **Size**: ~26KB (JS + CSS)
- **Browser Support**: All modern browsers
- **Offline Ready**: Yes (localStorage only)
- **Mobile Ready**: Fully responsive

## 🌟 Pro Tips

1. **Achieve Enlightened Status**: Earn 25+ achievements across all esoteric content
2. **Become Circle Mother**: Hit 50 achievement points
3. **Visit During All Moon Phases**: Unlock Lunar Devotee achievement
4. **Make 50 Hub Visits**: Become Circle Sister
5. **Explore Every Section**: Unlock Daughters Master achievement

## 🔗 Related Pages

- Main Site: `/index.html`
- Games: `/games/index.html`
- About: `/about/index.html`
- Daughters of Zion: `/esoteric/daughters-of-zion/`

---

**Created**: December 2025 | **Part of**: 420360.xyz
