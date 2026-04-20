// Specific month/day entries override the monthly theme fallback, so every calendar date
// resolves to a celebration without needing a full hand-maintained 365-entry map.
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

export const CALENDAR_POPUP_MONTH_THEMES = {
  '01': {
    label: 'JANUARY REBOOT',
    href: '/games/',
    messageTemplate: 'Day {day}: cold-start the year with fresh static and greener habits.',
    gifs: [BASE_GIFS.greenBurst, BASE_GIFS.staticWave, BASE_GIFS.goldFlash]
  },
  '02': {
    label: 'FEBRUARY LOVE STATIC',
    href: '/about/',
    messageTemplate: 'Day {day}: send a little extra glow to your favorite chaos gremlin.',
    gifs: [BASE_GIFS.redField, BASE_GIFS.neonLoop, BASE_GIFS.staticWave]
  },
  '03': {
    label: 'MARCH GREEN RIOT',
    href: '/games/',
    messageTemplate: 'Day {day}: spring the traps, crack the haze, and let the green riot in.',
    gifs: [BASE_GIFS.greenBurst, BASE_GIFS.smokeOrbit, BASE_GIFS.signalPulse]
  },
  '04': {
    label: 'APRIL CLOUD PARADE',
    href: '/games/',
    messageTemplate: 'Day {day}: keep the celebration lit and let the cloud parade roll through.',
    gifs: [BASE_GIFS.greenBurst, BASE_GIFS.arcadeBlink, BASE_GIFS.neonLoop]
  },
  '05': {
    label: 'MAY BLOOM BLITZ',
    href: '/cartoons/',
    messageTemplate: 'Day {day}: bloom loud, blink weird, and give the month a little extra color.',
    gifs: [BASE_GIFS.goldFlash, BASE_GIFS.greenBurst, BASE_GIFS.redField]
  },
  '06': {
    label: 'JUNE SUN STATIC',
    href: '/movie-reviews/',
    messageTemplate: 'Day {day}: stretch the daylight and keep the summer static humming.',
    gifs: [BASE_GIFS.goldFlash, BASE_GIFS.signalPulse, BASE_GIFS.neonLoop]
  },
  '07': {
    label: 'JULY HEAT WAVE',
    href: '/games/',
    messageTemplate: 'Day {day}: spark up the heat wave and let the arcade melt around you.',
    gifs: [BASE_GIFS.arcadeBlink, BASE_GIFS.redField, BASE_GIFS.goldFlash]
  },
  '08': {
    label: 'AUGUST AFTERGLOW',
    href: '/movie-reviews/',
    messageTemplate: 'Day {day}: ride the afterglow and keep the late-summer buzz alive.',
    gifs: [BASE_GIFS.smokeOrbit, BASE_GIFS.staticWave, BASE_GIFS.goldFlash]
  },
  '09': {
    label: 'SEPTEMBER RESET',
    href: '/about/',
    messageTemplate: 'Day {day}: reset the stack, sharpen the vibe, and drift into a cooler loop.',
    gifs: [BASE_GIFS.signalPulse, BASE_GIFS.greenBurst, BASE_GIFS.staticWave]
  },
  '10': {
    label: 'OCTOBER SPOOK STATIC',
    href: '/esoteric/',
    messageTemplate: 'Day {day}: ghost the routine and let the spook static leak in.',
    gifs: [BASE_GIFS.redField, BASE_GIFS.smokeOrbit, BASE_GIFS.neonLoop]
  },
  '11': {
    label: 'NOVEMBER HARVEST HAZE',
    href: '/about/',
    messageTemplate: 'Day {day}: harvest the good noise and keep the room warm with haze.',
    gifs: [BASE_GIFS.goldFlash, BASE_GIFS.greenBurst, BASE_GIFS.signalPulse]
  },
  '12': {
    label: 'DECEMBER GLITCHMAS',
    href: '/games/',
    messageTemplate: 'Day {day}: wrap the year in glittering static and keep the lights weird.',
    gifs: [BASE_GIFS.redField, BASE_GIFS.goldFlash, BASE_GIFS.arcadeBlink]
  }
};

export const CALENDAR_POPUP_SPECIAL_DATES = {
  '01-01': {
    label: 'HAPPY NEW YEAR!',
    href: '/games/',
    gif: BASE_GIFS.goldFlash,
    message: 'Fresh orbit, fresh static, fresh excuses to keep clicking.'
  },
  '02-14': {
    label: 'LOVE & HAZE DAY',
    href: '/about/',
    gif: BASE_GIFS.redField,
    message: 'Send somebody a weird little heart-shaped puff of chaos.'
  },
  '03-17': {
    label: 'LUCKY LEAF DAY',
    href: '/games/',
    gif: BASE_GIFS.greenBurst,
    message: 'Wear the green, chase the glow, and hoard the lucky static.'
  },
  '04-01': {
    label: 'APRIL FOOLS STATIC',
    href: '/cartoons/',
    gif: BASE_GIFS.neonLoop,
    message: 'Trust nothing. Laugh loudly. Click recklessly.'
  },
  '04-20': {
    label: 'HAPPY 420!',
    href: '/games/',
    gif: BASE_GIFS.greenBurst,
    message: 'This whole site was built for days like this. Stay lifted.'
  },
  '06-21': {
    label: 'SUMMER SOLSTICE SIGNAL',
    href: '/movie-reviews/',
    gif: BASE_GIFS.goldFlash,
    message: 'Longest day, loudest glow. Let the sunshine glitch a little.'
  },
  '07-04': {
    label: 'FIREWORK STATIC',
    href: '/games/',
    gif: BASE_GIFS.arcadeBlink,
    message: 'Explode the timeline and celebrate the sky-noise.'
  },
  '07-10': {
    label: 'HAPPY 710',
    href: '/games/',
    gif: BASE_GIFS.signalPulse,
    message: 'Oil flipped is 710. You know the assignment.'
  },
  '09-22': {
    label: 'AUTUMN EQUINOX',
    href: '/esoteric/',
    gif: BASE_GIFS.smokeOrbit,
    message: 'Equal light, equal dark, unequal levels of weird.'
  },
  '10-31': {
    label: 'HALLOWEED',
    href: '/esoteric/',
    gif: BASE_GIFS.redField,
    message: 'Happy Halloweed. Haunted vibes only.'
  },
  '11-28': {
    label: 'LEFTOVER HAZE DAY',
    href: '/movie-reviews/',
    gif: BASE_GIFS.goldFlash,
    message: 'Round two. More snacks, more static, less pretending.'
  },
  '12-24': {
    label: 'XMAS EVE STATIC',
    href: '/games/',
    gif: BASE_GIFS.arcadeBlink,
    message: 'The lights are blinking. The cookies are gone. The weirdness is peaking.'
  },
  '12-25': {
    label: 'MERRY XMAS!',
    href: '/games/',
    gif: BASE_GIFS.redField,
    message: 'Merry Xmas from the smoke-filled arcade.'
  },
  '12-31': {
    label: 'YEAR-END MELTDOWN',
    href: '/null-vesper/',
    gif: BASE_GIFS.neonLoop,
    message: 'Close the tabs you can. Keep the best glitches forever.'
  }
};
