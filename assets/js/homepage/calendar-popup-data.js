const BASE_GIFS = {
  greenBurst: 'https://media.giphy.com/media/7Ti0iZdo5QCiWJfMvA/giphy.gif',
  signalPulse: 'https://media.giphy.com/media/DfqSbJVYLHmO8QFn1R/giphy.gif',
  staticWave: 'https://media.giphy.com/media/qxJ9pAQCBIJLxfelCv/giphy.gif',
  redField: 'https://media.giphy.com/media/HtCcDJ134eAICJZjLb/giphy.gif',
  goldFlash: 'https://media.giphy.com/media/JeEjGpM2TVZGaM5BuE/giphy.gif',
  neonLoop: 'https://media.giphy.com/media/R7roNpEGCKqzjs1kkO/giphy.gif',
  smokeOrbit: 'https://media.giphy.com/media/8Javw7WzqetpyiT3ls/giphy.gif',
  arcadeBlink: 'https://media.giphy.com/media/3PLAXg1osLVVttjRTN/giphy.gif'
};

// Theme definitions are reusable content blocks. Calendar rules below decide when a theme appears.
export const CALENDAR_POPUP_THEMES = {
  januaryReboot: {
    labelTemplate: 'JANUARY REBOOT • DAY {day}',
    href: '/games/',
    messageTemplate: '{weekdayName} {day}: cold-start the year with fresh static and greener habits.',
    gifs: [BASE_GIFS.greenBurst, BASE_GIFS.staticWave, BASE_GIFS.goldFlash]
  },
  februaryLoveStatic: {
    labelTemplate: 'FEBRUARY LOVE STATIC • DAY {day}',
    href: '/about/',
    messageTemplate: '{weekdayName} {day}: send a little extra glow to your favorite chaos gremlin.',
    gifs: [BASE_GIFS.redField, BASE_GIFS.neonLoop, BASE_GIFS.staticWave]
  },
  marchGreenRiot: {
    labelTemplate: 'MARCH GREEN RIOT • DAY {day}',
    href: '/games/',
    messageTemplate: '{weekdayName} {day}: spring the traps, crack the haze, and let the green riot in.',
    gifs: [BASE_GIFS.greenBurst, BASE_GIFS.smokeOrbit, BASE_GIFS.signalPulse]
  },
  aprilCloudParade: {
    labelTemplate: 'APRIL CLOUD PARADE • DAY {day}',
    href: '/games/',
    messageTemplate: '{weekdayName} {day}: keep the celebration lit and let the cloud parade roll through.',
    gifs: [BASE_GIFS.greenBurst, BASE_GIFS.arcadeBlink, BASE_GIFS.neonLoop]
  },
  mayBloomBlitz: {
    labelTemplate: 'MAY BLOOM BLITZ • DAY {day}',
    href: '/cartoons/',
    messageTemplate: '{weekdayName} {day}: bloom loud, blink weird, and give the month a little extra color.',
    gifs: [BASE_GIFS.goldFlash, BASE_GIFS.greenBurst, BASE_GIFS.redField]
  },
  juneSunStatic: {
    labelTemplate: 'JUNE SUN STATIC • DAY {day}',
    href: '/movie-reviews/',
    messageTemplate: '{weekdayName} {day}: stretch the daylight and keep the summer static humming.',
    gifs: [BASE_GIFS.goldFlash, BASE_GIFS.signalPulse, BASE_GIFS.neonLoop]
  },
  julyHeatWave: {
    labelTemplate: 'JULY HEAT WAVE • DAY {day}',
    href: '/games/',
    messageTemplate: '{weekdayName} {day}: spark up the heat wave and let the arcade melt around you.',
    gifs: [BASE_GIFS.arcadeBlink, BASE_GIFS.redField, BASE_GIFS.goldFlash]
  },
  augustAfterglow: {
    labelTemplate: 'AUGUST AFTERGLOW • DAY {day}',
    href: '/movie-reviews/',
    messageTemplate: '{weekdayName} {day}: ride the afterglow and keep the late-summer buzz alive.',
    gifs: [BASE_GIFS.smokeOrbit, BASE_GIFS.staticWave, BASE_GIFS.goldFlash]
  },
  septemberReset: {
    labelTemplate: 'SEPTEMBER RESET • DAY {day}',
    href: '/about/',
    messageTemplate: '{weekdayName} {day}: reset the stack, sharpen the vibe, and drift into a cooler loop.',
    gifs: [BASE_GIFS.signalPulse, BASE_GIFS.greenBurst, BASE_GIFS.staticWave]
  },
  octoberSpookStatic: {
    labelTemplate: 'OCTOBER SPOOK STATIC • DAY {day}',
    href: '/esoteric/',
    messageTemplate: '{weekdayName} {day}: ghost the routine and let the spook static leak in.',
    gifs: [BASE_GIFS.redField, BASE_GIFS.smokeOrbit, BASE_GIFS.neonLoop]
  },
  novemberHarvestHaze: {
    labelTemplate: 'NOVEMBER HARVEST HAZE • DAY {day}',
    href: '/about/',
    messageTemplate: '{weekdayName} {day}: harvest the good noise and keep the room warm with haze.',
    gifs: [BASE_GIFS.goldFlash, BASE_GIFS.greenBurst, BASE_GIFS.signalPulse]
  },
  decemberGlitchmas: {
    labelTemplate: 'DECEMBER GLITCHMAS • DAY {day}',
    href: '/games/',
    messageTemplate: '{weekdayName} {day}: wrap the year in glittering static and keep the lights weird.',
    gifs: [BASE_GIFS.redField, BASE_GIFS.goldFlash, BASE_GIFS.arcadeBlink]
  },
  mondayMotivation: {
    labelTemplate: 'MONDAY REBOOT',
    href: '/about/',
    messageTemplate: 'It is {weekdayName}. Pretend the timeline is fixable and reboot anyway.',
    gifs: [BASE_GIFS.staticWave, BASE_GIFS.signalPulse]
  },
  fridayLiftOff: {
    labelTemplate: 'FRIDAY LIFT-OFF',
    href: '/games/',
    messageTemplate: '{weekdayName} is here. Clock out of reality and boot the weird stuff.',
    gifs: [BASE_GIFS.arcadeBlink, BASE_GIFS.greenBurst]
  },
  weekendStatic: {
    labelTemplate: 'WEEKEND STATIC',
    href: '/games/',
    messageTemplate: '{weekdayName} unlocked. Stay up late and click on something irresponsible.',
    gifs: [BASE_GIFS.neonLoop, BASE_GIFS.arcadeBlink, BASE_GIFS.smokeOrbit]
  },
  newYear: {
    labelTemplate: 'HAPPY NEW YEAR!',
    href: '/games/',
    messageTemplate: 'Fresh orbit, fresh static, fresh excuses to keep clicking.',
    gifs: [BASE_GIFS.goldFlash]
  },
  valentines: {
    labelTemplate: 'LOVE & HAZE DAY',
    href: '/about/',
    messageTemplate: 'Send somebody a weird little heart-shaped puff of chaos.',
    gifs: [BASE_GIFS.redField]
  },
  stPatricks: {
    labelTemplate: 'LUCKY LEAF DAY',
    href: '/games/',
    messageTemplate: 'Wear the green, chase the glow, and hoard the lucky static.',
    gifs: [BASE_GIFS.greenBurst]
  },
  aprilFools: {
    labelTemplate: 'APRIL FOOLS STATIC',
    href: '/cartoons/',
    messageTemplate: 'Trust nothing. Laugh loudly. Click recklessly.',
    gifs: [BASE_GIFS.neonLoop]
  },
  fourTwenty: {
    labelTemplate: 'HAPPY 420!',
    href: '/games/',
    messageTemplate: 'This whole site was built for days like this. Stay lifted.',
    gifs: [BASE_GIFS.greenBurst]
  },
  memorialDay: {
    labelTemplate: 'LONG WEEKEND STATIC',
    href: '/about/',
    messageTemplate: 'Memorial Day drift is active. Keep it reflective, keep it hazy.',
    gifs: [BASE_GIFS.goldFlash, BASE_GIFS.smokeOrbit]
  },
  summerSolstice: {
    labelTemplate: 'SUMMER SOLSTICE SIGNAL',
    href: '/movie-reviews/',
    messageTemplate: 'Longest day, loudest glow. Let the sunshine glitch a little.',
    gifs: [BASE_GIFS.goldFlash]
  },
  fireworkStatic: {
    labelTemplate: 'FIREWORK STATIC',
    href: '/games/',
    messageTemplate: 'Explode the timeline and celebrate the sky-noise.',
    gifs: [BASE_GIFS.arcadeBlink]
  },
  sevenTen: {
    labelTemplate: 'HAPPY 710',
    href: '/games/',
    messageTemplate: 'Oil flipped is 710. You know the assignment.',
    gifs: [BASE_GIFS.signalPulse]
  },
  laborDay: {
    labelTemplate: 'LABOR DAY LAZE',
    href: '/movie-reviews/',
    messageTemplate: 'Drop the workload, pick up the glow, and coast through the static.',
    gifs: [BASE_GIFS.goldFlash, BASE_GIFS.neonLoop]
  },
  autumnEquinox: {
    labelTemplate: 'AUTUMN EQUINOX',
    href: '/esoteric/',
    messageTemplate: 'Equal light, equal dark, unequal levels of weird.',
    gifs: [BASE_GIFS.smokeOrbit]
  },
  halloweed: {
    labelTemplate: 'HALLOWEED',
    href: '/esoteric/',
    messageTemplate: 'Happy Halloweed. Haunted vibes only.',
    gifs: [BASE_GIFS.redField]
  },
  electionStatic: {
    labelTemplate: 'CIVIC STATIC TUESDAY',
    href: '/about/',
    messageTemplate: 'Deep breaths, weird thoughts, and one more lap through democracy.',
    gifs: [BASE_GIFS.staticWave, BASE_GIFS.signalPulse]
  },
  thanksgiving: {
    labelTemplate: 'THANKSGLOWING',
    href: '/movie-reviews/',
    messageTemplate: 'Eat well, drift slow, and keep the room full of grateful noise.',
    gifs: [BASE_GIFS.goldFlash, BASE_GIFS.greenBurst]
  },
  leftovers: {
    labelTemplate: 'LEFTOVER HAZE DAY',
    href: '/movie-reviews/',
    messageTemplate: 'Round two. More snacks, more static, less pretending.',
    gifs: [BASE_GIFS.goldFlash]
  },
  xmasEve: {
    labelTemplate: 'XMAS EVE STATIC',
    href: '/games/',
    messageTemplate: 'The lights are blinking. The cookies are gone. The weirdness is peaking.',
    gifs: [BASE_GIFS.arcadeBlink]
  },
  xmas: {
    labelTemplate: 'MERRY XMAS!',
    href: '/games/',
    messageTemplate: 'Merry Xmas from the smoke-filled arcade.',
    gifs: [BASE_GIFS.redField]
  },
  twixmas: {
    labelTemplate: 'TWIXMAS DRIFT',
    href: '/movie-reviews/',
    messageTemplate: 'Time is fake between Xmas and New Year. Lean into it.',
    gifs: [BASE_GIFS.neonLoop, BASE_GIFS.smokeOrbit]
  },
  yearEnd: {
    labelTemplate: 'YEAR-END MELTDOWN',
    href: '/null-vesper/',
    messageTemplate: 'Close the tabs you can. Keep the best glitches forever.',
    gifs: [BASE_GIFS.neonLoop]
  }
};

// Rules are evaluated top-to-bottom. Higher-priority celebrations should appear earlier.
export const CALENDAR_POPUP_RULES = [
  { type: 'fixed-date', month: 1, day: 1, themeId: 'newYear' },
  { type: 'fixed-date', month: 2, day: 14, themeId: 'valentines' },
  { type: 'fixed-date', month: 3, day: 17, themeId: 'stPatricks' },
  { type: 'fixed-date', month: 4, day: 1, themeId: 'aprilFools' },
  { type: 'fixed-date', month: 4, day: 20, themeId: 'fourTwenty' },
  { type: 'last-weekday', month: 5, weekday: 1, themeId: 'memorialDay' },
  { type: 'fixed-date', month: 6, day: 21, themeId: 'summerSolstice' },
  { type: 'fixed-date', month: 7, day: 4, themeId: 'fireworkStatic' },
  { type: 'fixed-date', month: 7, day: 10, themeId: 'sevenTen' },
  { type: 'first-weekday', month: 9, weekday: 1, themeId: 'laborDay' },
  { type: 'fixed-date', month: 9, day: 22, themeId: 'autumnEquinox' },
  { type: 'fixed-date', month: 10, day: 31, themeId: 'halloweed' },
  { type: 'nth-weekday', month: 11, weekday: 2, occurrence: 1, themeId: 'electionStatic' },
  { type: 'nth-weekday', month: 11, weekday: 4, occurrence: 4, themeId: 'thanksgiving' },
  { type: 'day-after-rule', sourceThemeId: 'thanksgiving', themeId: 'leftovers' },
  { type: 'fixed-date', month: 12, day: 24, themeId: 'xmasEve' },
  { type: 'fixed-date', month: 12, day: 25, themeId: 'xmas' },
  { type: 'date-range', startMonth: 12, startDay: 26, endMonth: 12, endDay: 30, themeId: 'twixmas' },
  { type: 'fixed-date', month: 12, day: 31, themeId: 'yearEnd' },
  { type: 'weekday', weekday: 5, themeId: 'fridayLiftOff' },
  { type: 'weekday', weekday: 6, themeId: 'weekendStatic' },
  { type: 'weekday', weekday: 0, themeId: 'weekendStatic' },
  { type: 'weekday', weekday: 1, themeId: 'mondayMotivation' },
  { type: 'month', month: 1, themeId: 'januaryReboot' },
  { type: 'month', month: 2, themeId: 'februaryLoveStatic' },
  { type: 'month', month: 3, themeId: 'marchGreenRiot' },
  { type: 'month', month: 4, themeId: 'aprilCloudParade' },
  { type: 'month', month: 5, themeId: 'mayBloomBlitz' },
  { type: 'month', month: 6, themeId: 'juneSunStatic' },
  { type: 'month', month: 7, themeId: 'julyHeatWave' },
  { type: 'month', month: 8, themeId: 'augustAfterglow' },
  { type: 'month', month: 9, themeId: 'septemberReset' },
  { type: 'month', month: 10, themeId: 'octoberSpookStatic' },
  { type: 'month', month: 11, themeId: 'novemberHarvestHaze' },
  { type: 'month', month: 12, themeId: 'decemberGlitchmas' }
];
