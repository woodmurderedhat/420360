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
  }
};
