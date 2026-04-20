const ASCII_ART = {
  rebootPanel: String.raw`+----------------------+
|  BOOT SECTOR: GREEN  |
|  [#####-----] 42%    |
|  LOOP: DAY {day}        |
+----------------------+`,
  heartBeacon: String.raw`      .:::.      .:::.
   .::::::::.  .:::::::.
  :::::::::::::::::::::::
  ':::::::::::::::::::::'
    ':::::::::::::::::'
      ':::::::::::::'
         ':::::::'`,
  leafTotem: String.raw`          //
       \\\\||////
     ---  420  ---
       ////||\\\\
          \\
       GREEN RISE`,
  cloudTemple: String.raw`      .--.      .--.
   .-(    )----(    )-.
  (___.__)      (___.__)
       \    SKY    /
        '--------'`,
  bloomGate: String.raw`      _ _  _ _
    _( V )( V )_
   /__  BLOOM __\
      \  ||  /
       \_||_/`,
  solsticeWheel: String.raw`       \  |  /
     ---  O  ---
       /  |  \
    LONG DAY SIGNAL
        \ | /`,
  fireworksTower: String.raw`         .
       .'*'.
    .'* / \ *'.
      *.<*>.*
    .'* \ / *'.
       '*.*'`,
  tapeDeck: String.raw`   .----------------.
  /  AFTERGLOW TAPE /
 /_________________/
 | []  []  ==  [] |
 |________________|`,
  resetConsole: String.raw`  __________________
 |  RESET STACK   |
 |  > calm.exe    |
 |  > focus.bat   |
 |________________|`,
  ghostWindow: String.raw`      .-.
     (o o)
   oo| O |oo
     |   |
     '~~~'
   SPOOK FEED`,
  harvestTable: String.raw`     _____________
    / HARVEST  /|
   /__________/ |
   | TEA  PIE | |
   | STATIC   | /
   |__________|/`,
  glitchTree: String.raw`         *
         /|\
        /*|*\
       /**|**\
      /___|___\
         /_\\`,
  launchPad: String.raw`         /\
         /  \
        /_420\
        |    |
        |____|
       /_/  \_\\`,
  civicBoard: String.raw`+------------------+
|  CIVIC STATIC    |
|  [ VOTE ] [ COPE ] |
|  KEEP BREATHING  |
+------------------+`,
  feastPlate: String.raw`     ____________
    / THANKSGLOW /|
   /____________/ |
   | PIE  TEA  |  |
   | GOOD NOISE| / 
   |___________|/`,
  giftStack: String.raw`   +-----------+
   | []  []   |
   |    ||    |
   | []_||_[] |
   +-----------+
      ||  ||`,
  moonSignal: String.raw`       _..._
    .:::::::::.
   ::::::::::::: 
   ':::::::::::'
      ':::::'`,
  weekendBanner: String.raw`~^~^~^~^~^~^~^~^~^
  WEEKEND STATIC
~^~^~^~^~^~^~^~^~^`,
  yearEndCore: String.raw`    2 0 2 {year}
  < MELTDOWN CORE >
    \\\\ || || //
      \\|| ||//
        \\  //`,
  pumpkinFace: String.raw`      .-"""-.
     / .===. \
     \/ 6 6 \/
     ( \___/ )
 ___ooo_____ooo___`,
  equinoxAxis: String.raw`       LIGHT
         |
      ---+---
         |
        DARK
    {monthName} {day}`,
  mondayStack: String.raw`   .-----------.
  / MONDAY FIX /
 /___________ /
 | reboot now|
 |__||||||||_|`,
  fridaySignal: String.raw`  _________
 / FRIDAY /|
/_______ / |
| LIFT  |  |
| OFF   | /`,
  leftoversTray: String.raw`   .------------.
  / LEFTOVERS  /|
 /___________ / |
 | ROUND TWO |  |
 |___________| /`,
  valentineLock: String.raw`    .--------.
  .'  LOVE   '.
 /  SIGNAL  42 \
 \  HEART      /
  '._.__.__._.'`,
  luckyArch: String.raw`      ____
   .-' __ '-.
  /  .'  '.  \
 |  / LUCK \  |
 |  \ 420 /  |
  \  '.__.'  /
   '-.____.-'`
};

const ASCII_FOOTERS = {
  games: '[ OPEN /GAMES/ ]   [ STAY LIFTED ]',
  about: '[ OPEN /ABOUT/ ]   [ READ THE STATIC ]',
  cartoons: '[ OPEN /CARTOONS/ ]   [ DRAW OUTSIDE THE LINES ]',
  reviews: '[ OPEN /MOVIE-REVIEWS/ ]   [ LET IT MARINATE ]',
  esoteric: '[ OPEN /ESOTERIC/ ]   [ ENTER THE SHRINE ]',
  nullVesper: '[ OPEN /NULL-VESPER/ ]   [ ARCHIVE THE GLITCH ]'
};

function theme(labelTemplate, href, messageTemplate, asciiArt, asciiFooterTemplate) {
  return {
    labelTemplate,
    href,
    messageTemplate,
    asciiArt,
    asciiFooterTemplate
  };
}

// Theme definitions are reusable content blocks. Calendar rules below decide when a theme appears.
export const CALENDAR_POPUP_THEMES = {
  januaryReboot: theme(
    'JANUARY REBOOT - DAY {day}',
    '/games/',
    '{weekdayName} {day}: cold-start the year with fresh static and greener habits.',
    [ASCII_ART.rebootPanel, ASCII_ART.launchPad, ASCII_ART.resetConsole],
    ASCII_FOOTERS.games
  ),
  februaryLoveStatic: theme(
    'FEBRUARY LOVE STATIC - DAY {day}',
    '/about/',
    '{weekdayName} {day}: send a little extra glow to your favorite chaos gremlin.',
    [ASCII_ART.heartBeacon, ASCII_ART.valentineLock, ASCII_ART.moonSignal],
    ASCII_FOOTERS.about
  ),
  marchGreenRiot: theme(
    'MARCH GREEN RIOT - DAY {day}',
    '/games/',
    '{weekdayName} {day}: spring the traps, crack the haze, and let the green riot in.',
    [ASCII_ART.leafTotem, ASCII_ART.luckyArch, ASCII_ART.launchPad],
    ASCII_FOOTERS.games
  ),
  aprilCloudParade: theme(
    'APRIL CLOUD PARADE - DAY {day}',
    '/games/',
    '{weekdayName} {day}: keep the celebration lit and let the cloud parade roll through.',
    [ASCII_ART.cloudTemple, ASCII_ART.launchPad, ASCII_ART.leafTotem],
    ASCII_FOOTERS.games
  ),
  mayBloomBlitz: theme(
    'MAY BLOOM BLITZ - DAY {day}',
    '/cartoons/',
    '{weekdayName} {day}: bloom loud, blink weird, and give the month a little extra color.',
    [ASCII_ART.bloomGate, ASCII_ART.leafTotem, ASCII_ART.heartBeacon],
    ASCII_FOOTERS.cartoons
  ),
  juneSunStatic: theme(
    'JUNE SUN STATIC - DAY {day}',
    '/movie-reviews/',
    '{weekdayName} {day}: stretch the daylight and keep the summer static humming.',
    [ASCII_ART.solsticeWheel, ASCII_ART.cloudTemple, ASCII_ART.tapeDeck],
    ASCII_FOOTERS.reviews
  ),
  julyHeatWave: theme(
    'JULY HEAT WAVE - DAY {day}',
    '/games/',
    '{weekdayName} {day}: spark up the heat wave and let the arcade melt around you.',
    [ASCII_ART.fireworksTower, ASCII_ART.solsticeWheel, ASCII_ART.launchPad],
    ASCII_FOOTERS.games
  ),
  augustAfterglow: theme(
    'AUGUST AFTERGLOW - DAY {day}',
    '/movie-reviews/',
    '{weekdayName} {day}: ride the afterglow and keep the late-summer buzz alive.',
    [ASCII_ART.tapeDeck, ASCII_ART.weekendBanner, ASCII_ART.moonSignal],
    ASCII_FOOTERS.reviews
  ),
  septemberReset: theme(
    'SEPTEMBER RESET - DAY {day}',
    '/about/',
    '{weekdayName} {day}: reset the stack, sharpen the vibe, and drift into a cooler loop.',
    [ASCII_ART.resetConsole, ASCII_ART.rebootPanel, ASCII_ART.mondayStack],
    ASCII_FOOTERS.about
  ),
  octoberSpookStatic: theme(
    'OCTOBER SPOOK STATIC - DAY {day}',
    '/esoteric/',
    '{weekdayName} {day}: ghost the routine and let the spook static leak in.',
    [ASCII_ART.ghostWindow, ASCII_ART.pumpkinFace, ASCII_ART.moonSignal],
    ASCII_FOOTERS.esoteric
  ),
  novemberHarvestHaze: theme(
    'NOVEMBER HARVEST HAZE - DAY {day}',
    '/about/',
    '{weekdayName} {day}: harvest the good noise and keep the room warm with haze.',
    [ASCII_ART.harvestTable, ASCII_ART.feastPlate, ASCII_ART.moonSignal],
    ASCII_FOOTERS.about
  ),
  decemberGlitchmas: theme(
    'DECEMBER GLITCHMAS - DAY {day}',
    '/games/',
    '{weekdayName} {day}: wrap the year in glittering static and keep the lights weird.',
    [ASCII_ART.glitchTree, ASCII_ART.giftStack, ASCII_ART.fireworksTower],
    ASCII_FOOTERS.games
  ),
  mondayMotivation: theme(
    'MONDAY REBOOT',
    '/about/',
    'It is {weekdayName}. Pretend the timeline is fixable and reboot anyway.',
    [ASCII_ART.mondayStack, ASCII_ART.resetConsole],
    ASCII_FOOTERS.about
  ),
  fridayLiftOff: theme(
    'FRIDAY LIFT-OFF',
    '/games/',
    '{weekdayName} is here. Clock out of reality and boot the weird stuff.',
    [ASCII_ART.fridaySignal, ASCII_ART.launchPad, ASCII_ART.fireworksTower],
    ASCII_FOOTERS.games
  ),
  weekendStatic: theme(
    'WEEKEND STATIC',
    '/games/',
    '{weekdayName} unlocked. Stay up late and click on something irresponsible.',
    [ASCII_ART.weekendBanner, ASCII_ART.moonSignal, ASCII_ART.tapeDeck],
    ASCII_FOOTERS.games
  ),
  newYear: theme(
    'HAPPY NEW YEAR!',
    '/games/',
    'Fresh orbit, fresh static, fresh excuses to keep clicking.',
    [ASCII_ART.yearEndCore, ASCII_ART.fireworksTower],
    ASCII_FOOTERS.games
  ),
  valentines: theme(
    'LOVE & HAZE DAY',
    '/about/',
    'Send somebody a weird little heart-shaped puff of chaos.',
    [ASCII_ART.valentineLock, ASCII_ART.heartBeacon],
    ASCII_FOOTERS.about
  ),
  stPatricks: theme(
    'LUCKY LEAF DAY',
    '/games/',
    'Wear the green, chase the glow, and hoard the lucky static.',
    [ASCII_ART.luckyArch, ASCII_ART.leafTotem],
    ASCII_FOOTERS.games
  ),
  aprilFools: theme(
    'APRIL FOOLS STATIC',
    '/cartoons/',
    'Trust nothing. Laugh loudly. Click recklessly.',
    [ASCII_ART.cloudTemple, ASCII_ART.fireworksTower],
    ASCII_FOOTERS.cartoons
  ),
  fourTwenty: theme(
    'HAPPY 420!',
    '/games/',
    'This whole site was built for days like this. Stay lifted.',
    [ASCII_ART.leafTotem, ASCII_ART.launchPad, ASCII_ART.luckyArch],
    ASCII_FOOTERS.games
  ),
  memorialDay: theme(
    'LONG WEEKEND STATIC',
    '/about/',
    'Memorial Day drift is active. Keep it reflective, keep it hazy.',
    [ASCII_ART.weekendBanner, ASCII_ART.moonSignal, ASCII_ART.harvestTable],
    ASCII_FOOTERS.about
  ),
  summerSolstice: theme(
    'SUMMER SOLSTICE SIGNAL',
    '/movie-reviews/',
    'Longest day, loudest glow. Let the sunshine glitch a little.',
    [ASCII_ART.solsticeWheel],
    ASCII_FOOTERS.reviews
  ),
  fireworkStatic: theme(
    'FIREWORK STATIC',
    '/games/',
    'Explode the timeline and celebrate the sky-noise.',
    [ASCII_ART.fireworksTower],
    ASCII_FOOTERS.games
  ),
  sevenTen: theme(
    'HAPPY 710',
    '/games/',
    'Oil flipped is 710. You know the assignment.',
    [ASCII_ART.tapeDeck, ASCII_ART.launchPad],
    ASCII_FOOTERS.games
  ),
  laborDay: theme(
    'LABOR DAY LAZE',
    '/movie-reviews/',
    'Drop the workload, pick up the glow, and coast through the static.',
    [ASCII_ART.weekendBanner, ASCII_ART.solsticeWheel],
    ASCII_FOOTERS.reviews
  ),
  autumnEquinox: theme(
    'AUTUMN EQUINOX',
    '/esoteric/',
    'Equal light, equal dark, unequal levels of weird.',
    [ASCII_ART.equinoxAxis, ASCII_ART.moonSignal],
    ASCII_FOOTERS.esoteric
  ),
  halloweed: theme(
    'HALLOWEED',
    '/esoteric/',
    'Happy Halloweed. Haunted vibes only.',
    [ASCII_ART.pumpkinFace, ASCII_ART.ghostWindow],
    ASCII_FOOTERS.esoteric
  ),
  electionStatic: theme(
    'CIVIC STATIC TUESDAY',
    '/about/',
    'Deep breaths, weird thoughts, and one more lap through democracy.',
    [ASCII_ART.civicBoard],
    ASCII_FOOTERS.about
  ),
  thanksgiving: theme(
    'THANKSGLOWING',
    '/movie-reviews/',
    'Eat well, drift slow, and keep the room full of grateful noise.',
    [ASCII_ART.feastPlate, ASCII_ART.harvestTable],
    ASCII_FOOTERS.reviews
  ),
  leftovers: theme(
    'LEFTOVER HAZE DAY',
    '/movie-reviews/',
    'Round two. More snacks, more static, less pretending.',
    [ASCII_ART.leftoversTray, ASCII_ART.feastPlate],
    ASCII_FOOTERS.reviews
  ),
  xmasEve: theme(
    'XMAS EVE STATIC',
    '/games/',
    'The lights are blinking. The cookies are gone. The weirdness is peaking.',
    [ASCII_ART.glitchTree, ASCII_ART.giftStack],
    ASCII_FOOTERS.games
  ),
  xmas: theme(
    'MERRY XMAS!',
    '/games/',
    'Merry Xmas from the smoke-filled arcade.',
    [ASCII_ART.giftStack, ASCII_ART.glitchTree],
    ASCII_FOOTERS.games
  ),
  twixmas: theme(
    'TWIXMAS DRIFT',
    '/movie-reviews/',
    'Time is fake between Xmas and New Year. Lean into it.',
    [ASCII_ART.giftStack, ASCII_ART.tapeDeck, ASCII_ART.weekendBanner],
    ASCII_FOOTERS.reviews
  ),
  yearEnd: theme(
    'YEAR-END MELTDOWN',
    '/null-vesper/',
    'Close the tabs you can. Keep the best glitches forever.',
    [ASCII_ART.yearEndCore, ASCII_ART.fireworksTower],
    ASCII_FOOTERS.nullVesper
  )
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
