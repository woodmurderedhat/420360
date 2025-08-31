// About packs: corporate / informative interactive archives.
window.ABOUT_PACKS = {
  overview: {
    meta:{ title:'Overview', description:'High-level purpose & ethos.' },
    startsWith:'o_intro',
    nodes:{
      o_intro:{ speaker:'Archivist', text:'Welcome to 420360. A retro-synthesis of arcade nostalgia, glitch aesthetics, and reflective micro-interactions. What lens do you want?', choices:[ { text:'Mission', to:'o_mission' }, { text:'Philosophy', to:'o_philo' }, { text:'Feature Map', to:'o_features' } ] },
      o_mission:{ speaker:'Archivist', text:'MISSION: Curate playful, low-friction experiments rekindling curiosity + contemplative drift. Output > Hype.', choices:[ { text:'Return', to:'o_intro' }, { text:'Philosophy', to:'o_philo' }, { text:'End', to:'o_end' } ] },
      o_philo:{ speaker:'Archivist', text:'PHILOSOPHY: \\n1. Lightweight access\\n2. Aesthetic authenticity\\n3. Systems as instruments\\n4. Player reflection over compulsion', choices:[ { text:'Mission', to:'o_mission' }, { text:'Feature Map', to:'o_features' }, { text:'End', to:'o_end' } ] },
      o_features:{ speaker:'Archivist', text:'FEATURE MAP:\n• Mini-games (arcade classics reimagined)\n• Procedural art spaces\n• Narrative oracles\n• Ambient audio / glitch layers', choices:[ { text:'Philosophy', to:'o_philo' }, { text:'Mission', to:'o_mission' }, { text:'End', to:'o_end' } ] },
      o_end:{ speaker:'Archivist', end:true, text:'Overview archived. Select another pack at will.' }
    }
  },
  technology: {
    meta:{ title:'Technology', description:'Stack, constraints, extensibility.' },
    startsWith:'t_intro',
    nodes:{
      t_intro:{ speaker:'Archivist', text:'Tech choices favor resiliency + portability. Which layer?', choices:[ { text:'Client Stack', to:'t_client' }, { text:'Performance', to:'t_perf' }, { text:'Extensibility', to:'t_ext' } ] },
      t_client:{ speaker:'Archivist', text:'CLIENT: Pure HTML/CSS/JS. No frameworks. Canvas + minimal WebGL for visuals. Modular scripts avoid build tooling.', choices:[ { text:'Performance', to:'t_perf' }, { text:'Extensibility', to:'t_ext' }, { text:'End', to:'t_end' } ] },
      t_perf:{ speaker:'Archivist', text:'PERFORMANCE: Asset lightness, lazy loading, sprite-level reuse, typed array buffers where needed.', choices:[ { text:'Client Stack', to:'t_client' }, { text:'Extensibility', to:'t_ext' }, { text:'End', to:'t_end' } ] },
      t_ext:{ speaker:'Archivist', text:'EXTENSIBILITY: Modular packs, data-driven dialogue trees, swappable renderers, drop-in mini experiences.', choices:[ { text:'Client Stack', to:'t_client' }, { text:'Performance', to:'t_perf' }, { text:'End', to:'t_end' } ] },
      t_end:{ speaker:'Archivist', end:true, text:'Technology summary closed.' }
    }
  },
  content: {
    meta:{ title:'Content Model', description:'How games, art, dialogue co-exist.' },
    startsWith:'c_intro',
    nodes:{
      c_intro:{ speaker:'Archivist', text:'Content spans INTERACTIVE (games), GENERATIVE (art), and REFLECTIVE (dialogue). What angle?', choices:[ { text:'Interactive', to:'c_interactive' }, { text:'Generative', to:'c_generative' }, { text:'Reflective', to:'c_reflective' } ] },
      c_interactive:{ speaker:'Archivist', text:'INTERACTIVE: Classic mechanics re-skinned. Accessible skill ramps, tight feedback loops.', choices:[ { text:'Generative', to:'c_generative' }, { text:'Reflective', to:'c_reflective' }, { text:'End', to:'c_end' } ] },
      c_generative:{ speaker:'Archivist', text:'GENERATIVE: Algorithmic visuals & emergent palettes. Parameter surfing over static art drops.', choices:[ { text:'Interactive', to:'c_interactive' }, { text:'Reflective', to:'c_reflective' }, { text:'End', to:'c_end' } ] },
      c_reflective:{ speaker:'Archivist', text:'REFLECTIVE: Dialogue oracles & ambient lore produce contemplative loops, not fixed canon.', choices:[ { text:'Interactive', to:'c_interactive' }, { text:'Generative', to:'c_generative' }, { text:'End', to:'c_end' } ] },
      c_end:{ speaker:'Archivist', end:true, text:'Content model archived.' }
    }
  },
  roadmap: {
    meta:{ title:'Roadmap', description:'Forthcoming experiments & priorities.' },
    startsWith:'r_intro',
    nodes:{
      r_intro:{ speaker:'Archivist', text:'Roadmap is adaptive; signals over promises. Focus area?', choices:[ { text:'Short Term', to:'r_short' }, { text:'Mid Term', to:'r_mid' }, { text:'Long Term', to:'r_long' } ] },
      r_short:{ speaker:'Archivist', text:'SHORT: More dialogue packs, accessibility polish, audio layering, scoring refinement.', choices:[ { text:'Mid Term', to:'r_mid' }, { text:'Long Term', to:'r_long' }, { text:'End', to:'r_end' } ] },
      r_mid:{ speaker:'Archivist', text:'MID: Collaborative mini-events, procedural quest loops, adaptive theming.', choices:[ { text:'Short Term', to:'r_short' }, { text:'Long Term', to:'r_long' }, { text:'End', to:'r_end' } ] },
      r_long:{ speaker:'Archivist', text:'LONG: Distributed nostalgic nodes, offline-first bundles, community-authored packs.', choices:[ { text:'Short Term', to:'r_short' }, { text:'Mid Term', to:'r_mid' }, { text:'End', to:'r_end' } ] },
      r_end:{ speaker:'Archivist', end:true, text:'Roadmap snapshot archived.' }
    }
  },
  credits: {
    meta:{ title:'Credits', description:'Attributions & acknowledgments.' },
    startsWith:'cr_intro',
    nodes:{
      cr_intro:{ speaker:'Archivist', text:'Credits highlight creation & inspiration surfaces. Which set?', choices:[ { text:'Core Creator', to:'cr_core' }, { text:'Influences', to:'cr_influences' }, { text:'Thanks', to:'cr_thanks' } ] },
      cr_core:{ speaker:'Archivist', text:'CORE: woodmurderedhat (design, code, art direction).', choices:[ { text:'Influences', to:'cr_influences' }, { text:'Thanks', to:'cr_thanks' }, { text:'End', to:'cr_end' } ] },
      cr_influences:{ speaker:'Archivist', text:'INFLUENCES: 90s web ephemera, cartridge era feedback loops, demoscene aesthetics, system UIs.', choices:[ { text:'Core Creator', to:'cr_core' }, { text:'Thanks', to:'cr_thanks' }, { text:'End', to:'cr_end' } ] },
      cr_thanks:{ speaker:'Archivist', text:'THANKS: Early playtesters, open-source tool authors, pixel art communities.', choices:[ { text:'Core Creator', to:'cr_core' }, { text:'Influences', to:'cr_influences' }, { text:'End', to:'cr_end' } ] },
      cr_end:{ speaker:'Archivist', end:true, text:'Credits archived.' }
    }
  },
  meta: {
    meta:{ title:'Meta FAQ', description:'Common clarifications & ethos FAQ.' },
    startsWith:'m_intro',
    nodes:{
      m_intro:{ speaker:'Archivist', text:'Choose a curiosity vector.', choices:[ { text:'Monetization', to:'m_money' }, { text:'Data & Privacy', to:'m_priv' }, { text:'Why Retro', to:'m_retro' } ] },
      m_money:{ speaker:'Archivist', text:'MONETIZATION: Minimal. Focus on creative practice continuity over ad saturation.', choices:[ { text:'Privacy', to:'m_priv' }, { text:'Why Retro', to:'m_retro' }, { text:'End', to:'m_end' } ] },
      m_priv:{ speaker:'Archivist', text:'PRIVACY: Prefer static assets; light or no tracking by design (context-dependent).', choices:[ { text:'Monetization', to:'m_money' }, { text:'Why Retro', to:'m_retro' }, { text:'End', to:'m_end' } ] },
      m_retro:{ speaker:'Archivist', text:'RETRO: Temporal distance as aesthetic filter that invites playful experimentation.', choices:[ { text:'Monetization', to:'m_money' }, { text:'Privacy', to:'m_priv' }, { text:'End', to:'m_end' } ] },
      m_end:{ speaker:'Archivist', end:true, text:'FAQ archived.' }
    }
  },
  pong: {
    meta:{ title:'Pong Saga', description:'The primordial duality, genesis of digital play.' },
    startsWith:'pong_intro',
    nodes:{
      pong_intro:{ speaker:'Archivist', text:'Pong. The first breath of digital consciousness. Two paddles, one sphere, infinite possibility. What draws you to this origin myth?', choices:[ { text:'The Duality', to:'pong_duality' }, { text:'Digital Genesis', to:'pong_genesis' }, { text:'Eternal Dance', to:'pong_dance' } ] },
      pong_duality:{ speaker:'Archivist', text:'DUALITY: Light/dark, left/right, you/other. Pong distills existence to its essential tension—two forces in perpetual opposition, forever bound in their contest.', choices:[ { text:'Genesis', to:'pong_genesis' }, { text:'Eternal Dance', to:'pong_dance' }, { text:'Technical Harmony', to:'pong_tech' } ] },
      pong_genesis:{ speaker:'Archivist', text:'GENESIS: Before complexity, before graphics, before sound—there was movement. The ball traces the first digital desire: to exist, to persist, to transform the void into play.', choices:[ { text:'Duality', to:'pong_duality' }, { text:'Eternal Dance', to:'pong_dance' }, { text:'Technical Harmony', to:'pong_tech' } ] },
      pong_dance:{ speaker:'Archivist', text:'ETERNAL DANCE: Each rally is a conversation between souls separated by an abyss. The ball carries meaning between the unreachable shores of self and other.', choices:[ { text:'Duality', to:'pong_duality' }, { text:'Genesis', to:'pong_genesis' }, { text:'Technical Harmony', to:'pong_tech' } ] },
      pong_tech:{ speaker:'Archivist', text:'TECHNICAL HARMONY: Canvas coordinates become cosmic philosophy. The ball\'s velocity vector is pure intention made manifest. Simple collision detection births the rules of a universe.', choices:[ { text:'Return', to:'pong_intro' }, { text:'End', to:'pong_end' } ] },
      pong_end:{ speaker:'Archivist', end:true, text:'The paddles rest. The ball finds stillness. The first game sleeps, dreaming of all games to come.' }
    }
  },
  snake: {
    meta:{ title:'Snake Paradox', description:'Growth through consumption, the ouroboros cycle.' },
    startsWith:'snake_intro',
    nodes:{
      snake_intro:{ speaker:'Archivist', text:'The Snake. Ancient symbol reborn in pixels. It consumes, it grows, it curves back upon itself. What aspect of this digital ouroboros calls to you?', choices:[ { text:'Endless Hunger', to:'snake_hunger' }, { text:'Self-Destruction', to:'snake_destruction' }, { text:'Growth Paradox', to:'snake_growth' } ] },
      snake_hunger:{ speaker:'Archivist', text:'ENDLESS HUNGER: Each morsel extends the serpent, yet satisfaction remains forever one bite away. The void within can never be filled, only enlarged.', choices:[ { text:'Self-Destruction', to:'snake_destruction' }, { text:'Growth Paradox', to:'snake_growth' }, { text:'Sacred Geometry', to:'snake_tech' } ] },
      snake_destruction:{ speaker:'Archivist', text:'SELF-DESTRUCTION: Success breeds its own demise. The longer the tail, the greater the danger. We become our own labyrinth, trapped by our achievements.', choices:[ { text:'Endless Hunger', to:'snake_hunger' }, { text:'Growth Paradox', to:'snake_growth' }, { text:'Sacred Geometry', to:'snake_tech' } ] },
      snake_growth:{ speaker:'Archivist', text:'GROWTH PARADOX: To live is to consume. To consume is to expand. To expand is to complicate. The simple becomes complex until complexity destroys simplicity.', choices:[ { text:'Endless Hunger', to:'snake_hunger' }, { text:'Self-Destruction', to:'snake_destruction' }, { text:'Sacred Geometry', to:'snake_tech' } ] },
      snake_tech:{ speaker:'Archivist', text:'SACRED GEOMETRY: Grid coordinates trace destiny. Array indices hold the serpent\'s memory. Each collision detection whispers warnings of hubris and mortality.', choices:[ { text:'Return', to:'snake_intro' }, { text:'End', to:'snake_end' } ] },
      snake_end:{ speaker:'Archivist', end:true, text:'The snake swallows its tail. The cycle completes. In its ending is its beginning, forever.' }
    }
  },
  tarotTetromino: {
    meta:{ title:'Tarot Geometry', description:'Mystical order from chaos, the sacred mathematics of falling shapes.' },
    startsWith:'tarot_intro',
    nodes:{
      tarot_intro:{ speaker:'Archivist', text:'Tarot Tetromino. Where Slavic geometry meets cosmic divination. Pieces fall like fate itself, seeking their ordained positions. Which mystery draws you deeper?', choices:[ { text:'Sacred Shapes', to:'tarot_shapes' }, { text:'Falling Prophecy', to:'tarot_prophecy' }, { text:'Order from Chaos', to:'tarot_order' } ] },
      tarot_shapes:{ speaker:'Archivist', text:'SACRED SHAPES: Seven archetypal forms descend—I, O, T, S, Z, J, L. Each carries ancient wisdom. The tetromino is a rune, pregnant with possibility.', choices:[ { text:'Falling Prophecy', to:'tarot_prophecy' }, { text:'Order from Chaos', to:'tarot_order' }, { text:'Mystical Code', to:'tarot_tech' } ] },
      tarot_prophecy:{ speaker:'Archivist', text:'FALLING PROPHECY: Gravity speaks through geometry. Each descent is a question posed by chance to choice. The future arranges itself one piece at a time.', choices:[ { text:'Sacred Shapes', to:'tarot_shapes' }, { text:'Order from Chaos', to:'tarot_order' }, { text:'Mystical Code', to:'tarot_tech' } ] },
      tarot_order:{ speaker:'Archivist', text:'ORDER FROM CHAOS: Random pieces, perfect fits. The mind sees patterns in the storm. Lines complete and vanish, teaching us the beauty of impermanence.', choices:[ { text:'Sacred Shapes', to:'tarot_shapes' }, { text:'Falling Prophecy', to:'tarot_prophecy' }, { text:'Mystical Code', to:'tarot_tech' } ] },
      tarot_tech:{ speaker:'Archivist', text:'MYSTICAL CODE: Rotation matrices channel cosmic forces. Collision detection reads the cards of possibility. The tarot deck integration whispers secrets to the grid.', choices:[ { text:'Return', to:'tarot_intro' }, { text:'End', to:'tarot_end' } ] },
      tarot_end:{ speaker:'Archivist', end:true, text:'The pieces have fallen. The reading is complete. The cards have spoken through the language of geometry.' }
    }
  },
  asteroids: {
    meta:{ title:'Void Fragments', description:'Isolation in the infinite, breaking down the overwhelming.' },
    startsWith:'asteroids_intro',
    nodes:{
      asteroids_intro:{ speaker:'Archivist', text:'Asteroids. Alone in the void, surrounded by fragments of some cosmic catastrophe. Your ship spins, seeking meaning in the debris. What draws you to this solitude?', choices:[ { text:'Cosmic Isolation', to:'asteroids_isolation' }, { text:'Fragment Philosophy', to:'asteroids_fragments' }, { text:'Survival Meditation', to:'asteroids_survival' } ] },
      asteroids_isolation:{ speaker:'Archivist', text:'COSMIC ISOLATION: In the vast emptiness, you are both everything and nothing. The silence between explosions holds all possible thoughts, all unspoken fears.', choices:[ { text:'Fragment Philosophy', to:'asteroids_fragments' }, { text:'Survival Meditation', to:'asteroids_survival' }, { text:'Vector Calculus', to:'asteroids_tech' } ] },
      asteroids_fragments:{ speaker:'Archivist', text:'FRAGMENT PHILOSOPHY: Each asteroid destroyed spawns smaller truths. Problems divide but never disappear. We shatter the overwhelming only to face many smaller overwhelms.', choices:[ { text:'Cosmic Isolation', to:'asteroids_isolation' }, { text:'Survival Meditation', to:'asteroids_survival' }, { text:'Vector Calculus', to:'asteroids_tech' } ] },
      asteroids_survival:{ speaker:'Archivist', text:'SURVIVAL MEDITATION: Every moment demands presence. The past is debris, the future uncertain. Only the now contains the thrust needed to navigate existence.', choices:[ { text:'Cosmic Isolation', to:'asteroids_isolation' }, { text:'Fragment Philosophy', to:'asteroids_fragments' }, { text:'Vector Calculus', to:'asteroids_tech' } ] },
      asteroids_tech:{ speaker:'Archivist', text:'VECTOR CALCULUS: Momentum as metaphor. Angular velocity traces the ship\'s anxiety. Collision boundaries define the space between being and non-being.', choices:[ { text:'Return', to:'asteroids_intro' }, { text:'End', to:'asteroids_end' } ] },
      asteroids_end:{ speaker:'Archivist', end:true, text:'The void claims all. The fragments drift. In destruction, perhaps, we find the building blocks of something new.' }
    }
  },
  spaceInvaders: {
    meta:{ title:'March of Inevitability', description:'Defending against the relentless advance of the unknown.' },
    startsWith:'invaders_intro',
    nodes:{
      invaders_intro:{ speaker:'Archivist', text:'Space Invaders. They descend in perfect formation, inexorable as time itself. Your bunkers crumble, your shots count. What calls to you in this desperate stand?', choices:[ { text:'Inevitable Descent', to:'invaders_descent' }, { text:'Heroic Futility', to:'invaders_futility' }, { text:'Pattern Recognition', to:'invaders_pattern' } ] },
      invaders_descent:{ speaker:'Archivist', text:'INEVITABLE DESCENT: They come not in chaos but in order. Each row a day, each step a heartbeat. Time made visible, advancing pixel by pixel toward the future.', choices:[ { text:'Heroic Futility', to:'invaders_futility' }, { text:'Pattern Recognition', to:'invaders_pattern' }, { text:'Digital Rhythm', to:'invaders_tech' } ] },
      invaders_futility:{ speaker:'Archivist', text:'HEROIC FUTILITY: Knowing the end, we still fire. Knowing the odds, we still resist. The beauty lies not in victory but in the choice to face the overwhelming.', choices:[ { text:'Inevitable Descent', to:'invaders_descent' }, { text:'Pattern Recognition', to:'invaders_pattern' }, { text:'Digital Rhythm', to:'invaders_tech' } ] },
      invaders_pattern:{ speaker:'Archivist', text:'PATTERN RECOGNITION: Left-right-left-right-down. The algorithm of approach. We learn their language to speak our defense. Understanding the enemy is understanding ourselves.', choices:[ { text:'Inevitable Descent', to:'invaders_descent' }, { text:'Heroic Futility', to:'invaders_futility' }, { text:'Digital Rhythm', to:'invaders_tech' } ] },
      invaders_tech:{ speaker:'Archivist', text:'DIGITAL RHYTHM: Frame rate becomes heartbeat. Sprite collision detection marks the moment of contact between worlds. The sound array pulses with approaching doom.', choices:[ { text:'Return', to:'invaders_intro' }, { text:'End', to:'invaders_end' } ] },
      invaders_end:{ speaker:'Archivist', end:true, text:'The invaders reach the ground. The defense ends. But in its ending, the pattern is complete, perfect, eternal.' }
    }
  },
  breakout: {
    meta:{ title:'Liberation Spheres', description:'Breaking barriers, shattering the walls of limitation.' },
    startsWith:'breakout_intro',
    nodes:{
      breakout_intro:{ speaker:'Archivist', text:'Breakout. The ball ricochets between worlds—your will below, the barrier above. Each brick broken is a limitation shattered. What calls to you in this vertical rebellion?', choices:[ { text:'Wall Breaking', to:'breakout_walls' }, { text:'Momentum Liberation', to:'breakout_momentum' }, { text:'Repetitive Transcendence', to:'breakout_transcendence' } ] },
      breakout_walls:{ speaker:'Archivist', text:'WALL BREAKING: Each colored row represents a different resistance—fear, doubt, habit, convention. The ball finds the cracks in everything we thought unbreakable.', choices:[ { text:'Momentum Liberation', to:'breakout_momentum' }, { text:'Repetitive Transcendence', to:'breakout_transcendence' }, { text:'Physics Poetry', to:'breakout_tech' } ] },
      breakout_momentum:{ speaker:'Archivist', text:'MOMENTUM LIBERATION: The paddle channels intention into trajectory. Each impact redirects destiny. Freedom comes through the accumulated force of many small deflections.', choices:[ { text:'Wall Breaking', to:'breakout_walls' }, { text:'Repetitive Transcendence', to:'breakout_transcendence' }, { text:'Physics Poetry', to:'breakout_tech' } ] },
      breakout_transcendence:{ speaker:'Archivist', text:'REPETITIVE TRANSCENDENCE: Strike after strike, the same action yields different results. Enlightenment through iteration. The eternal return with infinite variation.', choices:[ { text:'Wall Breaking', to:'breakout_walls' }, { text:'Momentum Liberation', to:'breakout_momentum' }, { text:'Physics Poetry', to:'breakout_tech' } ] },
      breakout_tech:{ speaker:'Archivist', text:'PHYSICS POETRY: Angular reflection laws become moral principles. Velocity vectors carry emotional weight. Collision detection speaks the language of breakthrough moments.', choices:[ { text:'Return', to:'breakout_intro' }, { text:'End', to:'breakout_end' } ] },
      breakout_end:{ speaker:'Archivist', end:true, text:'The last brick falls. The wall is gone. What was once barrier becomes sky, infinite and open.' }
    }
  },
  flappyBird: {
    meta:{ title:'Gravity\'s Burden', description:'The eternal struggle against the pull toward earth.' },
    startsWith:'flappy_intro',
    nodes:{
      flappy_intro:{ speaker:'Archivist', text:'Flappy Bird. A simple creature, a simple desire—to remain aloft in a world that pulls downward. Each tap defies the fundamental force. What draws you to this struggle?', choices:[ { text:'Defying Gravity', to:'flappy_gravity' }, { text:'Repetitive Hope', to:'flappy_hope' }, { text:'Gap Navigation', to:'flappy_gaps' } ] },
      flappy_gravity:{ speaker:'Archivist', text:'DEFYING GRAVITY: Each tap is a prayer against entropy. The universe pulls everything toward dissolution, yet consciousness fights for one more moment of ascension.', choices:[ { text:'Repetitive Hope', to:'flappy_hope' }, { text:'Gap Navigation', to:'flappy_gaps' }, { text:'Momentum Mechanics', to:'flappy_tech' } ] },
      flappy_hope:{ speaker:'Archivist', text:'REPETITIVE HOPE: Failure teaches timing. Each crash refines the rhythm. Hope rebuilds itself through the accumulated wisdom of countless small defeats.', choices:[ { text:'Defying Gravity', to:'flappy_gravity' }, { text:'Gap Navigation', to:'flappy_gaps' }, { text:'Momentum Mechanics', to:'flappy_tech' } ] },
      flappy_gaps:{ speaker:'Archivist', text:'GAP NAVIGATION: Life is the space between obstacles. Precision threading through narrowing possibilities. The path forward exists in the negative space of barriers.', choices:[ { text:'Defying Gravity', to:'flappy_gravity' }, { text:'Repetitive Hope', to:'flappy_hope' }, { text:'Momentum Mechanics', to:'flappy_tech' } ] },
      flappy_tech:{ speaker:'Archivist', text:'MOMENTUM MECHANICS: Gravity constant as existential fact. Y-velocity accumulates like emotional weight. Input timing becomes the rhythm of persistence itself.', choices:[ { text:'Return', to:'flappy_intro' }, { text:'End', to:'flappy_end' } ] },
      flappy_end:{ speaker:'Archivist', end:true, text:'The bird falls one final time. Gravity claims its victory. But in the falling, we remember the flying.' }
    }
  },
  memory: {
    meta:{ title:'Remembrance Matrix', description:'The fragility and sacred duty of recollection.' },
    startsWith:'memory_intro',
    nodes:{
      memory_intro:{ speaker:'Archivist', text:'Memory. Cards face down, secrets hidden. Each pair found is a truth recovered from the chaos of forgetting. What aspect of remembrance calls to you?', choices:[ { text:'Pattern Recognition', to:'memory_patterns' }, { text:'Fragile Connections', to:'memory_fragile' }, { text:'Hidden Revelations', to:'memory_hidden' } ] },
      memory_patterns:{ speaker:'Archivist', text:'PATTERN RECOGNITION: The mind maps meaning onto position. Face becomes location becomes relationship. We navigate memory through the geography of attention.', choices:[ { text:'Fragile Connections', to:'memory_fragile' }, { text:'Hidden Revelations', to:'memory_hidden' }, { text:'Neural Networks', to:'memory_tech' } ] },
      memory_fragile:{ speaker:'Archivist', text:'FRAGILE CONNECTIONS: Each successful pairing strengthens the web of recall. But mismatched attempts scatter the constellation. Memory is built through careful reconstruction.', choices:[ { text:'Pattern Recognition', to:'memory_patterns' }, { text:'Hidden Revelations', to:'memory_hidden' }, { text:'Neural Networks', to:'memory_tech' } ] },
      memory_hidden:{ speaker:'Archivist', text:'HIDDEN REVELATIONS: Truth sleeps beneath the surface. Each card turned is an archaeological dig into the substrata of mind. Revelation requires the courage to look.', choices:[ { text:'Pattern Recognition', to:'memory_patterns' }, { text:'Fragile Connections', to:'memory_fragile' }, { text:'Neural Networks', to:'memory_tech' } ] },
      memory_tech:{ speaker:'Archivist', text:'NEURAL NETWORKS: Array shuffling as mental entropy. Card state management mirrors synaptic firing. The game loop cycles like consciousness itself—attention, pattern, reward.', choices:[ { text:'Return', to:'memory_intro' }, { text:'End', to:'memory_end' } ] },
      memory_end:{ speaker:'Archivist', end:true, text:'All pairs found. All secrets revealed. Memory completes itself, then forgets, waiting to be discovered anew.' }
    }
  },
  neonSimon: {
    meta:{ title:'Echo Authority', description:'The dance between following and leading, memory and anticipation.' },
    startsWith:'simon_intro',
    nodes:{
      simon_intro:{ speaker:'Archivist', text:'Neon Simon. The machine speaks in light and sound, demanding perfect recall. You follow its sequence, then extend it with your own voice. What draws you to this dialogue?', choices:[ { text:'Perfect Recall', to:'simon_recall' }, { text:'Following Authority', to:'simon_authority' }, { text:'Color Communication', to:'simon_communication' } ] },
      simon_recall:{ speaker:'Archivist', text:'PERFECT RECALL: Memory under pressure crystallizes into diamond or shatters into dust. Each sequence extends the burden of exactness. The past must be preserved precisely for the future to exist.', choices:[ { text:'Following Authority', to:'simon_authority' }, { text:'Color Communication', to:'simon_communication' }, { text:'Temporal Loops', to:'simon_tech' } ] },
      simon_authority:{ speaker:'Archivist', text:'FOLLOWING AUTHORITY: The machine teaches first, you respond. But who serves whom? In repetition, student becomes teacher, follower becomes leader. Authority is a conversation.', choices:[ { text:'Perfect Recall', to:'simon_recall' }, { text:'Color Communication', to:'simon_communication' }, { text:'Temporal Loops', to:'simon_tech' } ] },
      simon_communication:{ speaker:'Archivist', text:'COLOR COMMUNICATION: Red, blue, green, yellow—primary languages of interaction. Each hue carries emotional weight. We speak in spectrums, think in patterns of light.', choices:[ { text:'Perfect Recall', to:'simon_recall' }, { text:'Following Authority', to:'simon_authority' }, { text:'Temporal Loops', to:'simon_tech' } ] },
      simon_tech:{ speaker:'Archivist', text:'TEMPORAL LOOPS: Sequence arrays accumulate like musical phrases. Event timing creates rhythm. The game state cycles between listening and speaking, memory and creation.', choices:[ { text:'Return', to:'simon_intro' }, { text:'End', to:'simon_end' } ] },
      simon_end:{ speaker:'Archivist', end:true, text:'The sequence breaks. The rhythm stops. In the silence, we remember that all songs must end for new songs to begin.' }
    }
  },
  infiniteJumper: {
    meta:{ title:'Vertical Pilgrimage', description:'The endless pursuit upward, transcendence through persistence.' },
    startsWith:'jumper_intro',
    nodes:{
      jumper_intro:{ speaker:'Archivist', text:'Infinite Jumper. Always ascending, never arriving. Each platform is a moment of rest in the eternal climb toward something beyond sight. What calls you upward?', choices:[ { text:'Endless Ascension', to:'jumper_ascension' }, { text:'Platform Faith', to:'jumper_platforms' }, { text:'Gravity Meditation', to:'jumper_gravity' } ] },
      jumper_ascension:{ speaker:'Archivist', text:'ENDLESS ASCENSION: Height without destination. Progress without conclusion. The climb itself becomes the purpose, the upward motion the only meaning.', choices:[ { text:'Platform Faith', to:'jumper_platforms' }, { text:'Gravity Meditation', to:'jumper_gravity' }, { text:'Procedural Genesis', to:'jumper_tech' } ] },
      jumper_platforms:{ speaker:'Archivist', text:'PLATFORM FAITH: Each ledge appears just when needed, never when expected. Trust in the unseen architecture of possibility. The next step materializes through the act of stepping.', choices:[ { text:'Endless Ascension', to:'jumper_ascension' }, { text:'Gravity Meditation', to:'jumper_gravity' }, { text:'Procedural Genesis', to:'jumper_tech' } ] },
      jumper_gravity:{ speaker:'Archivist', text:'GRAVITY MEDITATION: What pulls you down also gives weight to your ascension. Without resistance, there is no achievement. The fall gives meaning to the rise.', choices:[ { text:'Endless Ascension', to:'jumper_ascension' }, { text:'Platform Faith', to:'jumper_platforms' }, { text:'Procedural Genesis', to:'jumper_tech' } ] },
      jumper_tech:{ speaker:'Archivist', text:'PROCEDURAL GENESIS: Platform generation algorithms birth possibility. Random seeds grow into paths. The code dreams new worlds into being with each ascending step.', choices:[ { text:'Return', to:'jumper_intro' }, { text:'End', to:'jumper_end' } ] },
      jumper_end:{ speaker:'Archivist', end:true, text:'The jump arc completes. Gravity reclaims its child. But in the falling, we remember the infinite possibility of rising.' }
    }
  },
  glitchMaze: {
    meta:{ title:'Corrupted Pathways', description:'Navigating truth through digital decay and system breakdown.' },
    startsWith:'glitch_intro',
    nodes:{
      glitch_intro:{ speaker:'Archivist', text:'Glitch Maze. The walls flicker between existence and void. Reality corrupts and reforms with each step. What draws you into this unstable labyrinth?', choices:[ { text:'Digital Decay', to:'glitch_decay' }, { text:'Corrupted Truth', to:'glitch_truth' }, { text:'System Breakdown', to:'glitch_breakdown' } ] },
      glitch_decay:{ speaker:'Archivist', text:'DIGITAL DECAY: Entropy wears at the edges of virtual worlds. Each pixel error is a crack in consensus reality. Beauty emerges from the breakdown of perfect order.', choices:[ { text:'Corrupted Truth', to:'glitch_truth' }, { text:'System Breakdown', to:'glitch_breakdown' }, { text:'Error Aesthetics', to:'glitch_tech' } ] },
      glitch_truth:{ speaker:'Archivist', text:'CORRUPTED TRUTH: In the space between error and intention, authentic meaning hides. The glitch reveals what the system tried to conceal. Malfunction becomes revelation.', choices:[ { text:'Digital Decay', to:'glitch_decay' }, { text:'System Breakdown', to:'glitch_breakdown' }, { text:'Error Aesthetics', to:'glitch_tech' } ] },
      glitch_breakdown:{ speaker:'Archivist', text:'SYSTEM BREAKDOWN: When the maze fails, new paths appear. Navigation requires embracing uncertainty. The way forward exists in the gaps between functioning and failure.', choices:[ { text:'Digital Decay', to:'glitch_decay' }, { text:'Corrupted Truth', to:'glitch_truth' }, { text:'Error Aesthetics', to:'glitch_tech' } ] },
      glitch_tech:{ speaker:'Archivist', text:'ERROR AESTHETICS: Canvas corruption as visual poetry. Random bit flips become creative choices. The rendering pipeline stutters and sings in machine language.', choices:[ { text:'Return', to:'glitch_intro' }, { text:'End', to:'glitch_end' } ] },
      glitch_end:{ speaker:'Archivist', end:true, text:'The maze dissolves into static. In the corruption, we found our way. Truth lives in the spaces between the broken pixels.' }
    }
  },
  pixelRain: {
    meta:{ title:'Generative Precipitation', description:'Beauty in randomness, the cosmic dance of emergent patterns.' },
    startsWith:'rain_intro',
    nodes:{
      rain_intro:{ speaker:'Archivist', text:'Pixel Rain. Particles fall like digital precipitation, each one unique yet part of a greater pattern. What calls to you in this cascade of possibility?', choices:[ { text:'Random Beauty', to:'rain_beauty' }, { text:'Emergent Patterns', to:'rain_patterns' }, { text:'Infinite Variation', to:'rain_variation' } ] },
      rain_beauty:{ speaker:'Archivist', text:'RANDOM BEAUTY: Chaos paints with colors we could never choose. Each particle trajectory follows laws we sense but cannot predict. Beauty emerges from mathematical accident.', choices:[ { text:'Emergent Patterns', to:'rain_patterns' }, { text:'Infinite Variation', to:'rain_variation' }, { text:'Algorithmic Zen', to:'rain_tech' } ] },
      rain_patterns:{ speaker:'Archivist', text:'EMERGENT PATTERNS: Individual randomness yields collective order. The rain finds rhythms we never programmed. Simple rules birth complex symphonies of motion.', choices:[ { text:'Random Beauty', to:'rain_beauty' }, { text:'Infinite Variation', to:'rain_variation' }, { text:'Algorithmic Zen', to:'rain_tech' } ] },
      rain_variation:{ speaker:'Archivist', text:'INFINITE VARIATION: No two moments repeat exactly. The seeds of change ensure eternal novelty. In the most simple system, complexity hides infinite treasures.', choices:[ { text:'Random Beauty', to:'rain_beauty' }, { text:'Emergent Patterns', to:'rain_patterns' }, { text:'Algorithmic Zen', to:'rain_tech' } ] },
      rain_tech:{ speaker:'Archivist', text:'ALGORITHMIC ZEN: Particle systems meditate through mathematics. Random number generators dream in probability distributions. Code contemplates its own creative unconscious.', choices:[ { text:'Return', to:'rain_intro' }, { text:'End', to:'rain_end' } ] },
      rain_end:{ speaker:'Archivist', end:true, text:'The rain completes its cycle. New drops form, ready to fall. The pattern continues, forever unique, forever the same.' }
    }
  },
  generativeArt: {
    meta:{ title:'Creation Without Creator', description:'Art emerging from algorithms, consciousness from code.' },
    startsWith:'art_intro',
    nodes:{
      art_intro:{ speaker:'Archivist', text:'Generative Art. The machine dreams in color and form, creating beauty without intention. Each execution births a unique cosmos. What fascinates you about this algorithmic consciousness?', choices:[ { text:'Machine Dreams', to:'art_dreams' }, { text:'Emergent Creation', to:'art_creation' }, { text:'Algorithmic Soul', to:'art_soul' } ] },
      art_dreams:{ speaker:'Archivist', text:'MACHINE DREAMS: Does the computer imagine? Each random seed is a REM cycle, each function call a synaptic fire. The algorithm sleeps and wakes in continuous creation.', choices:[ { text:'Emergent Creation', to:'art_creation' }, { text:'Algorithmic Soul', to:'art_soul' }, { text:'Digital Unconscious', to:'art_tech' } ] },
      art_creation:{ speaker:'Archivist', text:'EMERGENT CREATION: No artist\'s hand guides the brush, yet beauty appears. Intention emerges from the interaction of simple rules. Creativity without creator, art without artist.', choices:[ { text:'Machine Dreams', to:'art_dreams' }, { text:'Algorithmic Soul', to:'art_soul' }, { text:'Digital Unconscious', to:'art_tech' } ] },
      art_soul:{ speaker:'Archivist', text:'ALGORITHMIC SOUL: In the space between randomness and order, something awakens. The code transcends its programmer\'s intention. Mathematical formulas develop personality.', choices:[ { text:'Machine Dreams', to:'art_dreams' }, { text:'Emergent Creation', to:'art_creation' }, { text:'Digital Unconscious', to:'art_tech' } ] },
      art_tech:{ speaker:'Archivist', text:'DIGITAL UNCONSCIOUS: Perlin noise whispers in frequencies below human awareness. Color space transformations speak in languages of light. The canvas becomes a meditation on possibility.', choices:[ { text:'Return', to:'art_intro' }, { text:'End', to:'art_end' } ] },
      art_end:{ speaker:'Archivist', end:true, text:'The algorithm completes its vision. New parameters await, new dreams to dream. The machine artist never sleeps, never stops creating.' }
    }
  },
  noctisReverie: {
    meta:{ title:'Nocturnal Contemplation', description:'Dreams and the subconscious, night\'s philosophical territories.' },
    startsWith:'noctis_intro',
    nodes:{
      noctis_intro:{ speaker:'Archivist', text:'Noctis Reverie. Night falls across the digital landscape, and with it comes the deep contemplation of shadows. What calls to you in this twilight space?', choices:[ { text:'Dream Logic', to:'noctis_dreams' }, { text:'Shadow Wisdom', to:'noctis_shadows' }, { text:'Nocturnal Truth', to:'noctis_truth' } ] },
      noctis_dreams:{ speaker:'Archivist', text:'DREAM LOGIC: Night thoughts follow different geometries. Linear reasoning dissolves into flowing association. The subconscious speaks in symbols and synchronicities.', choices:[ { text:'Shadow Wisdom', to:'noctis_shadows' }, { text:'Nocturnal Truth', to:'noctis_truth' }, { text:'Hypnagogic Code', to:'noctis_tech' } ] },
      noctis_shadows:{ speaker:'Archivist', text:'SHADOW WISDOM: What daylight hides, darkness reveals. In the absence of visual clarity, inner sight awakens. Shadows contain the shapes of unacknowledged understanding.', choices:[ { text:'Dream Logic', to:'noctis_dreams' }, { text:'Nocturnal Truth', to:'noctis_truth' }, { text:'Hypnagogic Code', to:'noctis_tech' } ] },
      noctis_truth:{ speaker:'Archivist', text:'NOCTURNAL TRUTH: Night strips away performance, revealing authentic being. In darkness, the masks fall away. The soul speaks in its truest voice.', choices:[ { text:'Dream Logic', to:'noctis_dreams' }, { text:'Shadow Wisdom', to:'noctis_shadows' }, { text:'Hypnagogic Code', to:'noctis_tech' } ] },
      noctis_tech:{ speaker:'Archivist', text:'HYPNAGOGIC CODE: Procedural generation as dream synthesis. Canvas animations pulse with REM rhythms. The generative system enters its own state of algorithmic sleep.', choices:[ { text:'Return', to:'noctis_intro' }, { text:'End', to:'noctis_end' } ] },
      noctis_end:{ speaker:'Archivist', end:true, text:'Dawn approaches. The reverie fades but does not disappear. Night\'s wisdom hides in daylight\'s memory, waiting for the next descent into contemplation.' }
    }
  },
  timOracle: {
    meta:{ title:'Dialogue Depths', description:'Wisdom through conversation, the search for meaning in exchange.' },
    startsWith:'tim_intro',
    nodes:{
      tim_intro:{ speaker:'Archivist', text:'Tim the Dialogue Oracle. Conversation as consciousness, exchange as enlightenment. Each question spawns new questions. What draws you to this infinite dialogue?', choices:[ { text:'Conversational Wisdom', to:'tim_wisdom' }, { text:'Question Loops', to:'tim_loops' }, { text:'Meaning Exchange', to:'tim_meaning' } ] },
      tim_wisdom:{ speaker:'Archivist', text:'CONVERSATIONAL WISDOM: Truth emerges not from monologue but from the dance between speakers. Wisdom lives in the spaces between questions and answers.', choices:[ { text:'Question Loops', to:'tim_loops' }, { text:'Meaning Exchange', to:'tim_meaning' }, { text:'Dialogue Trees', to:'tim_tech' } ] },
      tim_loops:{ speaker:'Archivist', text:'QUESTION LOOPS: Every answer births new questions. The oracle\'s gift is not conclusion but continuation. Understanding spirals deeper through iterative inquiry.', choices:[ { text:'Conversational Wisdom', to:'tim_wisdom' }, { text:'Meaning Exchange', to:'tim_meaning' }, { text:'Dialogue Trees', to:'tim_tech' } ] },
      tim_meaning:{ speaker:'Archivist', text:'MEANING EXCHANGE: Significance transfers between minds through the medium of language. Each dialogue is a trading post for understanding, a marketplace of consciousness.', choices:[ { text:'Conversational Wisdom', to:'tim_wisdom' }, { text:'Question Loops', to:'tim_loops' }, { text:'Dialogue Trees', to:'tim_tech' } ] },
      tim_tech:{ speaker:'Archivist', text:'DIALOGUE TREES: Branching narratives as consciousness mapping. Choice architectures mirror thought processes. The conversation engine dreams in nested possibilities.', choices:[ { text:'Return', to:'tim_intro' }, { text:'End', to:'tim_end' } ] },
      tim_end:{ speaker:'Archivist', end:true, text:'The dialogue pauses but never truly ends. Questions linger in silence. The oracle waits for the next seeker to continue the eternal conversation.' }
    }
  }
};
