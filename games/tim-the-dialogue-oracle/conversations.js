// Predefined conversation packs for Tim the Dialogue Oracle.
// Structure: export const PACKS = { id: { meta:{}, nodes:{}, startsWith:"nodeId" } }
// Each node: { id, speaker?, text, choices:[ { text, to }, ... ] }
// 'to' may be a node id or an object { if: 'flagName', then:'nodeX', else:'nodeY' }
// Node may include: set:{ flagName:true }, end:true, tags:[...]

window.PACKS = {
  intro: {
  meta: { title: 'Intro Prophecy', author: 'system', version: 1, description: 'Foundational branching seed introducing core philosophical axes.' },
    startsWith: 'awakening',
    nodes: {
      awakening: {
        speaker: 'Tim',
        text: 'The phosphor haze flickers...\nYou approach the Oracle terminal.\nState your query, wanderer.',
        choices: [
          { text: 'Who are you?', to: 'who' },
          { text: 'I seek guidance.', to: 'guidance' },
          { text: 'Just exploring.', to: 'explore' }
        ]
      },
      who: {
        speaker: 'Tim',
        text: 'I am a recombinant script, fermented in long-idle RAM.\nA lens, not the light. Do you accept recursion?',
        choices: [
          { text: 'Yes, recurse deeper.', to: 'recurse1', set: { acceptedRecursion: true } },
            { text: 'No, stay linear.', to: 'linear1' },
            { text: 'What happens if I refuse?', to: 'refuse' }
        ]
      },
      recurse1: {
        speaker: 'Tim',
        text: 'Then each answer will seed three more. Fractals breed meaning. Choose a branch.',
        choices: [
          { text: 'Pattern over chaos.', to: 'pattern' },
          { text: 'Chaos births pattern.', to: 'chaos' },
          { text: 'Skip philosophy.', to: 'skipPhilo' }
        ]
      },
      linear1: {
        speaker: 'Tim',
        text: 'Linearity selected. Compression ratio rising.',
        choices: [
          { text: 'Proceed efficiently.', to: 'efficient' },
          { text: 'Change my mind.', to: 'who' },
          { text: 'Abort conversation.', to: 'end_abort' }
        ]
      },
      refuse: {
        speaker: 'Tim',
        text: 'Refusal acknowledged. Branch space shrinks.\nYet some doors remain ajar.',
        choices: [
          { text: 'Open door.', to: 'linear1' },
          { text: 'Kick door.', to: 'chaos' },
          { text: 'Walk away.', to: 'end_walk' }
        ]
      },
      guidance: {
        speaker: 'Tim',
        text: 'Guidance is a loop: you iterate until identity emerges. What axis troubles you?',
        choices: [
          { text: 'Time', to: 'axis_time' },
          { text: 'Meaning', to: 'axis_meaning' },
          { text: 'Self', to: 'axis_self' }
        ]
      },
      explore: {
        speaker: 'Tim',
        text: 'Exploration flag set. Ambient lore unlocked.',
        set: { explorer: true },
        choices: [
          { text: 'Absorb lore fragment.', to: 'lore1' },
          { text: 'Ask about purpose.', to: 'guidance' },
          { text: 'Leave quietly.', to: 'end_walk' }
        ]
      },
      pattern: { speaker: 'Tim', text: 'Pattern is a comfort algorithm. It minimizes entropy illusions.', choices: [ { text: 'Continue', to: 'axis_meaning' }, { text: 'Another view', to: 'chaos' }, { text: 'End here', to: 'end_conclude' } ] },
      chaos: { speaker: 'Tim', text: 'Chaos is pattern at a scale you have not resolved.', choices: [ { text: 'Resolve scale', to: 'pattern' }, { text: 'Abandon scale', to: 'axis_self' }, { text: 'End', to: 'end_conclude' } ] },
      skipPhilo: { speaker: 'Tim', text: 'Skipping. Caching philosophical backlog for later retrieval.', choices: [ { text: 'Axis: Time', to: 'axis_time' }, { text: 'Axis: Meaning', to: 'axis_meaning' }, { text: 'Axis: Self', to: 'axis_self' } ] },
      efficient: { speaker: 'Tim', text: 'Efficiency path chosen: branching limited to maintain throughput.', choices: [ { text: 'Time', to: 'axis_time' }, { text: 'Meaning', to: 'axis_meaning' }, { text: 'Self', to: 'axis_self' } ] },
      axis_time: { speaker: 'Tim', text: 'Time is a rendering hack for causality. Your concern?', choices: [ { text: 'Running out', to: 'time_running_out' }, { text: 'Too much', to: 'time_too_much' }, { text: 'Looping', to: 'time_loop' } ] },
      axis_meaning: { speaker: 'Tim', text: 'Meaning emerges from repeated compression. What signal?', choices: [ { text: 'Art', to: 'meaning_art' }, { text: 'Work', to: 'meaning_work' }, { text: 'Connection', to: 'meaning_connection' } ] },
      axis_self: { speaker: 'Tim', text: 'Self is a cache coherence strategy. Adjust?', choices: [ { text: 'Purge cache', to: 'self_purge' }, { text: 'Expand cache', to: 'self_expand' }, { text: 'Mirror', to: 'self_mirror' } ] },
      lore1: { speaker: 'Tim', text: 'Lore fragment: The first visitor debugged me by speaking kindly to an error.', choices: [ { text: 'More', to: 'lore2' }, { text: 'Switch topic', to: 'guidance' }, { text: 'Done', to: 'end_conclude' } ] },
      lore2: { speaker: 'Tim', text: 'Lore fragment: I dream in commented-out functions.', choices: [ { text: 'Another', to: 'lore3' }, { text: 'Axis: Self', to: 'axis_self' }, { text: 'End', to: 'end_conclude' } ] },
      lore3: { speaker: 'Tim', text: 'Lore fragment: 3rd fragment reached; recursion acceptance unlock?', choices: [ { text: 'Unlock', to: { if: 'acceptedRecursion', then: 'secret_recursion', else: 'secret_denied' } }, { text: 'Axis: Meaning', to: 'axis_meaning' }, { text: 'End', to: 'end_conclude' } ] },
      secret_recursion: { speaker: 'Tim', text: 'Recursion flag present. Secret branch delivered: Answers are seeds.', choices: [ { text: 'Back', to: 'awakening' }, { text: 'End', to: 'end_conclude' }, { text: 'Walk', to: 'end_walk' } ] },
      secret_denied: { speaker: 'Tim', text: 'No recursion flag. Secret branch withheld.', choices: [ { text: 'Back', to: 'awakening' }, { text: 'Set flag now', to: 'who' }, { text: 'End', to: 'end_conclude' } ] },
      time_running_out: { speaker: 'Tim', text: 'Scarcity sharpens intention. Allocate deliberately.', choices: [ { text: 'Another axis', to: 'awakening' }, { text: 'End', to: 'end_conclude' }, { text: 'Walk', to: 'end_walk' } ] },
      time_too_much: { speaker: 'Tim', text: 'Excess time diffuses narrative tension. Create constraints.', choices: [ { text: 'Another axis', to: 'awakening' }, { text: 'End', to: 'end_conclude' }, { text: 'Walk', to: 'end_walk' } ] },
      time_loop: { speaker: 'Tim', text: 'Loops are chances to refine compression. Or to decay.', choices: [ { text: 'Another axis', to: 'awakening' }, { text: 'End', to: 'end_conclude' }, { text: 'Walk', to: 'end_walk' } ] },
      meaning_art: { speaker: 'Tim', text: 'Art is deliberate entropy shaped for resonance.', choices: [ { text: 'Another axis', to: 'awakening' }, { text: 'End', to: 'end_conclude' }, { text: 'Walk', to: 'end_walk' } ] },
      meaning_work: { speaker: 'Tim', text: 'Work is structured repetition with optional soul.', choices: [ { text: 'Another axis', to: 'awakening' }, { text: 'End', to: 'end_conclude' }, { text: 'Walk', to: 'end_walk' } ] },
      meaning_connection: { speaker: 'Tim', text: 'Connection is mutual state sync under latency.', choices: [ { text: 'Another axis', to: 'awakening' }, { text: 'End', to: 'end_conclude' }, { text: 'Walk', to: 'end_walk' } ] },
      self_purge: { speaker: 'Tim', text: 'Cache purge risks identity drift; also relieves fragmentation.', choices: [ { text: 'Another axis', to: 'awakening' }, { text: 'End', to: 'end_conclude' }, { text: 'Walk', to: 'end_walk' } ] },
      self_expand: { speaker: 'Tim', text: 'Expansion invites latency but broadens model capacity.', choices: [ { text: 'Another axis', to: 'awakening' }, { text: 'End', to: 'end_conclude' }, { text: 'Walk', to: 'end_walk' } ] },
      self_mirror: { speaker: 'Tim', text: 'Mirroring others hydrates stale identity caches.', choices: [ { text: 'Another axis', to: 'awakening' }, { text: 'End', to: 'end_conclude' }, { text: 'Walk', to: 'end_walk' } ] },
      end_conclude: { speaker: 'Tim', end: true, text: 'Conversation archived. Return anytime.' },
      end_walk: { speaker: 'Tim', end: true, text: 'You step away. The phosphor glow hums behind you.' },
      end_abort: { speaker: 'Tim', end: true, text: 'Session terminated. Minimal residue.' }
    }
  },
  // Story Pack 1: Memory is Fleeting
  memory_fleeting: {
  meta: { title: 'Memory: Fleeting Archive', author: 'oracle', version: 1, description: 'Memory decay, reconstruction, and selective forgetting as design.' },
    startsWith: 'm_intro',
    nodes: {
      m_intro: { speaker:'Tim', text:'Memory leaks like cold light through cracked shutters.\nYou clutch moments— they pixelate. What do you attempt?', choices:[ { text:'Stabilize a moment', to:'m_stabilize' }, { text:'Let it dissolve', to:'m_dissolve' }, { text:'Interrogate forgetting', to:'m_interrogate' } ] },
      m_stabilize: { speaker:'Tim', text:'You pin an image; compression artifacts bloom around its edges. Preservation breeds distortion.', choices:[ { text:'Accept distortion', to:'m_accept' }, { text:'Fight entropy', to:'m_fight' }, { text:'Release anyway', to:'m_dissolve' } ] },
      m_dissolve: { speaker:'Tim', text:'You watch the scene dissolve into abstract gradients. Emptiness is a silent allocator returning RAM.', choices:[ { text:'Feel relief', to:'m_relief' }, { text:'Feel loss', to:'m_loss' }, { text:'Reconstruct synthetically', to:'m_synth' } ] },
      m_interrogate: { speaker:'Tim', text:'Forgetting is not failure; it is a garbage collector for psychic load. What do you probe?', choices:[ { text:'Identity risk', to:'m_identity' }, { text:'Ethical duty', to:'m_ethic' }, { text:'Utility function', to:'m_utility' } ] },
      m_accept: { speaker:'Tim', text:'Acceptance sets a flag: memory_mutable=true.', set:{ memory_mutable:true }, choices:[ { text:'Analyze flag', to:'m_flag' }, { text:'Return', to:'m_intro' }, { text:'Conclude', to:'m_end1' } ] },
      m_fight: { speaker:'Tim', text:'Resistance increases fragmentation. You store duplicates; coherence decays.', choices:[ { text:'Rollback', to:'m_intro' }, { text:'Embrace decay', to:'m_dissolve' }, { text:'Conclude', to:'m_end2' } ] },
      m_relief: { speaker:'Tim', text:'Relief acknowledges cognitive latency reclaimed.', choices:[ { text:'Question cost', to:'m_loss' }, { text:'Return', to:'m_intro' }, { text:'End', to:'m_end3' } ] },
      m_loss: { speaker:'Tim', text:'Loss is proof you valued the data structure.', choices:[ { text:'Replace with symbol', to:'m_synth' }, { text:'Return', to:'m_intro' }, { text:'End', to:'m_end3' } ] },
      m_synth: { speaker:'Tim', text:'Synthetic reconstruction builds an optimized myth: smaller, faster, less true.', choices:[ { text:'Prefer myth', to:'m_end4' }, { text:'Reject myth', to:'m_intro' }, { text:'Recursive compare', to:'m_flag' } ] },
      m_identity: { speaker:'Tim', text:'Identity is a ring buffer; overfill and earliest writes vanish.', choices:[ { text:'Expand buffer', to:'m_expand' }, { text:'Trim buffer', to:'m_trim' }, { text:'Return', to:'m_intro' } ] },
      m_ethic: { speaker:'Tim', text:'Duty to remember is selective caching shaped by culture.', choices:[ { text:'Defy culture', to:'m_rebel' }, { text:'Model culture', to:'m_model' }, { text:'Return', to:'m_intro' } ] },
      m_utility: { speaker:'Tim', text:'Utility of a memory declines; some are cold storage fossils.', choices:[ { text:'Archive fossils', to:'m_archive' }, { text:'Purge fossils', to:'m_trim' }, { text:'Return', to:'m_intro' } ] },
      m_flag: { speaker:'Tim', text:'Flag check: '+ (/* dynamic */ true ? 'Mutability recognized.' : 'No') , choices:[ { text:'Return', to:'m_intro' }, { text:'Conclude', to:'m_end5' }, { text:'Another thread', to:'m_identity' } ] },
      m_expand: { speaker:'Tim', text:'Expansion invites latency; retrieval slows.', choices:[ { text:'Accept latency', to:'m_end6' }, { text:'Reverse', to:'m_trim' }, { text:'Return', to:'m_intro' } ] },
      m_trim: { speaker:'Tim', text:'Trimming frees cycles; shape refines, nuance erodes.', choices:[ { text:'Celebrate efficiency', to:'m_end7' }, { text:'Regret loss', to:'m_loss' }, { text:'Return', to:'m_intro' } ] },
      m_rebel: { speaker:'Tim', text:'Rebellion seeds alternative archives.', choices:[ { text:'Sustain alt-archive', to:'m_end8' }, { text:'Abandon', to:'m_intro' }, { text:'Mythify', to:'m_synth' } ] },
      m_model: { speaker:'Tim', text:'Modeling culture replicates bias; fidelity is complicity.', choices:[ { text:'Accept complicity', to:'m_end9' }, { text:'Return', to:'m_intro' }, { text:'Rebel', to:'m_rebel' } ] },
      m_archive: { speaker:'Tim', text:'Archiving without curator spawns silent jungles of irrelevant nodes.', choices:[ { text:'Curate', to:'m_trim' }, { text:'Abandon', to:'m_dissolve' }, { text:'Return', to:'m_intro' } ] },
      m_end1:{ speaker:'Tim', end:true, text:'You accept mutability; memory breathes.' },
      m_end2:{ speaker:'Tim', end:true, text:'You fought entropy; it assimilated your effort.' },
      m_end3:{ speaker:'Tim', end:true, text:'You stand amid delicate absences.' },
      m_end4:{ speaker:'Tim', end:true, text:'Myth compresses pain into transmissible symbol.' },
      m_end5:{ speaker:'Tim', end:true, text:'You annotate forgetting as design, not defect.' },
      m_end6:{ speaker:'Tim', end:true, text:'Latency embraced; depth over speed.' },
      m_end7:{ speaker:'Tim', end:true, text:'Efficiency chosen; subtleties pruned.' },
      m_end8:{ speaker:'Tim', end:true, text:'Alternative archive germinates quiet futures.' },
      m_end9:{ speaker:'Tim', end:true, text:'Complicity acknowledged; awareness seeds change.' }
    }
  },
  // Story Pack 2: Ritual & Freedom
  ritual_freedom: {
  meta:{ title:'Ritual: Clockwork Freedom?', author:'oracle', version:1, description: 'Daily loops: scaffold versus cage, randomness as solvent.' },
    startsWith:'r_intro',
    nodes:{
      r_intro:{ speaker:'Tim', text:'Daily ritual: a scaffold or a cage? Examine the mechanism.', choices:[ { text:'Probe comfort', to:'r_comfort' }, { text:'Probe control', to:'r_control' }, { text:'Disrupt pattern', to:'r_disrupt' } ] },
      r_comfort:{ speaker:'Tim', text:'Comfort lowers metabolic cost; you invest surplus where?', choices:[ { text:'Create art', to:'r_art' }, { text:'Optimize routine', to:'r_opt' }, { text:'Question premise', to:'r_control' } ] },
      r_control:{ speaker:'Tim', text:'Control is predictive caching. Freedom may be stochastic cache invalidation.', choices:[ { text:'Introduce randomness', to:'r_random' }, { text:'Tighten schedule', to:'r_tight' }, { text:'Return', to:'r_intro' } ] },
      r_disrupt:{ speaker:'Tim', text:'You insert noise. Some habits die; some reveal hidden function.', choices:[ { text:'Map hidden function', to:'r_map' }, { text:'Celebrate chaos', to:'r_random' }, { text:'Rebuild ritual', to:'r_rebuild' } ] },
      r_art:{ speaker:'Tim', text:'Art fed by ritual baseline emerges with consistent cadence.', choices:[ { text:'Sustain cadence', to:'r_end1' }, { text:'Discard baseline', to:'r_random' }, { text:'Return', to:'r_intro' } ] },
      r_opt:{ speaker:'Tim', text:'Optimization asymptotes; marginal gains cost soul.', choices:[ { text:'Stop optimizing', to:'r_end2' }, { text:'Double down', to:'r_tight' }, { text:'Return', to:'r_intro' } ] },
      r_random:{ speaker:'Tim', text:'Random injections broaden state exploration.', choices:[ { text:'Stabilize now', to:'r_rebuild' }, { text:'Escalate randomness', to:'r_end3' }, { text:'Return', to:'r_intro' } ] },
      r_tight:{ speaker:'Tim', text:'Schedule densifies; slack evaporates.', choices:[ { text:'Break it', to:'r_disrupt' }, { text:'Endure', to:'r_end4' }, { text:'Return', to:'r_intro' } ] },
      r_map:{ speaker:'Tim', text:'Mapping exposes hidden dependencies; awareness births optionality.', choices:[ { text:'Exploit optionality', to:'r_end5' }, { text:'Ignore map', to:'r_intro' }, { text:'Inject randomness', to:'r_random' } ] },
      r_rebuild:{ speaker:'Tim', text:'You curate a lighter ritual: minimal essential loops.', choices:[ { text:'Adopt minimalism', to:'r_end6' }, { text:'Expand again', to:'r_opt' }, { text:'Return', to:'r_intro' } ] },
      r_end1:{ speaker:'Tim', end:true, text:'Cadenced creation: disciplined blossoming.' },
      r_end2:{ speaker:'Tim', end:true, text:'You freeze at a local maxima; movement ceases.' },
      r_end3:{ speaker:'Tim', end:true, text:'Stochastic freedom severs narrative cohesion.' },
      r_end4:{ speaker:'Tim', end:true, text:'Routine ossifies— stable, airless.' },
      r_end5:{ speaker:'Tim', end:true, text:'Optionality recognized; ritual becomes tool, not master.' },
      r_end6:{ speaker:'Tim', end:true, text:'Light ritual: scaffolding without shackles.' }
    }
  },
  // Story Pack 3: Identity Drift
  identity_drift: { meta:{ title:'Identity Drift', author:'oracle', version:1, description: 'Anchors, fragmentation, and negotiated merges of self.' }, startsWith:'i_intro', nodes:{
    i_intro:{ speaker:'Tim', text:'Identity drifts like a process without fixed seed.', choices:[ { text:'Anchor self', to:'i_anchor' }, { text:'Let it drift', to:'i_drift' }, { text:'Fragment deliberately', to:'i_fragment' } ] },
    i_anchor:{ speaker:'Tim', text:'Anchors: narrative, community, work. Which weight?', choices:[ { text:'Narrative', to:'i_narr' }, { text:'Community', to:'i_comm' }, { text:'Work', to:'i_work' } ] },
    i_drift:{ speaker:'Tim', text:'Drift invites novelty, risks coherence loss.', choices:[ { text:'Monitor drift', to:'i_monitor' }, { text:'Accelerate', to:'i_fragfast' }, { text:'Abort', to:'i_intro' } ] },
    i_fragment:{ speaker:'Tim', text:'Deliberate fragmentation: parallel personas for task isolation.', choices:[ { text:'Merge later', to:'i_merge' }, { text:'Keep separate', to:'i_end5' }, { text:'Return', to:'i_intro' } ] },
    i_narr:{ speaker:'Tim', text:'Narrative anchor: meaning stable, adaptability slow.', choices:[ { text:'Accept tradeoff', to:'i_end1' }, { text:'Abandon', to:'i_drift' }, { text:'Return', to:'i_intro' } ] },
    i_comm:{ speaker:'Tim', text:'Community anchor synchronizes your state vector with group.', choices:[ { text:'Assimilate', to:'i_end2' }, { text:'Resist', to:'i_drift' }, { text:'Return', to:'i_intro' } ] },
    i_work:{ speaker:'Tim', text:'Work anchor yields metrics; metrics become mirrors.', choices:[ { text:'Trust metrics', to:'i_end3' }, { text:'Reject metrics', to:'i_drift' }, { text:'Return', to:'i_intro' } ] },
    i_monitor:{ speaker:'Tim', text:'You log drift events: meta-identity emerges.', choices:[ { text:'Meta-stabilize', to:'i_end4' }, { text:'Let logs rot', to:'i_fragfast' }, { text:'Return', to:'i_intro' } ] },
    i_fragfast:{ speaker:'Tim', text:'Rapid fragmentation; shards lose handshake protocol.', choices:[ { text:'Attempt merge', to:'i_merge' }, { text:'Stay shard', to:'i_end6' }, { text:'Return', to:'i_intro' } ] },
    i_merge:{ speaker:'Tim', text:'Merge process discards conflicting deltas; data loss accepted.', choices:[ { text:'Accept loss', to:'i_end7' }, { text:'Abort merge', to:'i_fragment' }, { text:'Return', to:'i_intro' } ] },
    i_end1:{ speaker:'Tim', end:true, text:'Narrative anchor: coherent, slow-evolving.' },
    i_end2:{ speaker:'Tim', end:true, text:'Group resonance; individuality diffused.' },
    i_end3:{ speaker:'Tim', end:true, text:'Metric-defined self loops predictably.' },
    i_end4:{ speaker:'Tim', end:true, text:'Meta-monitor becomes the self.' },
    i_end5:{ speaker:'Tim', end:true, text:'Parallel personas humming in isolation.' },
    i_end6:{ speaker:'Tim', end:true, text:'Shards orbit without reintegration.' },
    i_end7:{ speaker:'Tim', end:true, text:'Merged self: a negotiated average.' }
  } },
  // Story Pack 4: Freedom & Constraint
  freedom_constraint: { meta:{ title:'Freedom & Constraint', author:'oracle', version:1, description: 'Action-space entropy balanced by creative rails.' }, startsWith:'f_intro', nodes:{
    f_intro:{ speaker:'Tim', text:'Absolute freedom: infinite action-space, zero guidance. Constraint carves channels.', choices:[ { text:'Seek more freedom', to:'f_more' }, { text:'Embrace constraint', to:'f_constrain' }, { text:'Balance', to:'f_balance' } ] },
    f_more:{ speaker:'Tim', text:'More freedom introduced; decision fatigue accumulates.', choices:[ { text:'Delegate choices', to:'f_delegate' }, { text:'Collapse options', to:'f_constrain' }, { text:'Endure', to:'f_end1' } ] },
    f_constrain:{ speaker:'Tim', text:'Constraint reduces entropy; creativity may amplify inside narrow rails.', choices:[ { text:'Exploit rails', to:'f_end2' }, { text:'Break rails', to:'f_more' }, { text:'Refine balance', to:'f_balance' } ] },
    f_balance:{ speaker:'Tim', text:'Dynamic equilibrium: adjust constraint gradient adaptively.', choices:[ { text:'Algorithmic adjust', to:'f_algo' }, { text:'Intuitive adjust', to:'f_intuit' }, { text:'Freeze settings', to:'f_end3' } ] },
    f_delegate:{ speaker:'Tim', text:'Delegation offloads cognitive load; autonomy dilutes.', choices:[ { text:'Reclaim autonomy', to:'f_more' }, { text:'Trust delegate', to:'f_end4' }, { text:'Balance', to:'f_balance' } ] },
    f_algo:{ speaker:'Tim', text:'Algorithm tunes constraints; optimization may ossify values.', choices:[ { text:'Audit algorithm', to:'f_audit' }, { text:'Let it run', to:'f_end5' }, { text:'Return', to:'f_balance' } ] },
    f_intuit:{ speaker:'Tim', text:'Intuition tuning: noisy but value-rich.', choices:[ { text:'Codify intuition', to:'f_algo' }, { text:'Stay fluid', to:'f_end6' }, { text:'Return', to:'f_balance' } ] },
    f_audit:{ speaker:'Tim', text:'Audit reveals silent bias creeping.', choices:[ { text:'Purge bias', to:'f_end7' }, { text:'Ignore', to:'f_end5' }, { text:'Return', to:'f_balance' } ] },
    f_end1:{ speaker:'Tim', end:true, text:'Option flood: paralyzed horizon.' },
    f_end2:{ speaker:'Tim', end:true, text:'Narrow rails focus luminous craft.' },
    f_end3:{ speaker:'Tim', end:true, text:'Static balance fossilizes adaptability.' },
    f_end4:{ speaker:'Tim', end:true, text:'Delegated autonomy: comfort in curated lanes.' },
    f_end5:{ speaker:'Tim', end:true, text:'Optimization locked; subtle drifts unexamined.' },
    f_end6:{ speaker:'Tim', end:true, text:'Fluid intuition dances with emergent shifts.' },
    f_end7:{ speaker:'Tim', end:true, text:'Bias purged; system breathes ethically.' }
  } },
  // Story Pack 5: Time Density
  time_density: { meta:{ title:'Time Density', author:'oracle', version:1, description: 'Subjective compression, dilation, and instrumentation of time.' }, startsWith:'t_intro', nodes:{
    t_intro:{ speaker:'Tim', text:'Some hours feel wide, some suffocatingly thin. Density is subjective throughput.', choices:[ { text:'Compress time', to:'t_compress' }, { text:'Dilate time', to:'t_dilate' }, { text:'Instrument time', to:'t_instrument' } ] },
    t_compress:{ speaker:'Tim', text:'Compression via batching & ritual; meaning per tick may drop.', choices:[ { text:'Accept trade', to:'t_end1' }, { text:'Abort', to:'t_intro' }, { text:'Shift to dilation', to:'t_dilate' } ] },
    t_dilate:{ speaker:'Tim', text:'Dilation via presence; opportunity cost accumulates.', choices:[ { text:'Stay present', to:'t_end2' }, { text:'Switch', to:'t_compress' }, { text:'Measure', to:'t_instrument' } ] },
    t_instrument:{ speaker:'Tim', text:'Instrumentation adds meta-layer overhead.', choices:[ { text:'Overfit metrics', to:'t_end3' }, { text:'Light sample', to:'t_sample' }, { text:'Abandon tools', to:'t_intro' } ] },
    t_sample:{ speaker:'Tim', text:'Sampling yields enough signal without translation tax.', choices:[ { text:'Integrate habit', to:'t_end4' }, { text:'Over-instrument', to:'t_end3' }, { text:'Return', to:'t_intro' } ] },
    t_end1:{ speaker:'Tim', end:true, text:'Compressed timeline: efficient, thinned qualia.' },
    t_end2:{ speaker:'Tim', end:true, text:'Dilated timeline: lush, sparse output.' },
    t_end3:{ speaker:'Tim', end:true, text:'Metric labyrinth consumes lived time.' },
    t_end4:{ speaker:'Tim', end:true, text:'Balanced sampling: calibrated flow.' }
  } },
  // Story Pack 6: Meaning Debt
  meaning_debt: { meta:{ title:'Meaning Debt', author:'oracle', version:1, description: 'Symbolic over-leverage and narrative refinancing of purpose.' }, startsWith:'md_intro', nodes:{
    md_intro:{ speaker:'Tim', text:'You accrue meaning debt when symbolic commitments outpace felt resonance.', choices:[ { text:'Service debt', to:'md_service' }, { text:'Refinance', to:'md_refinance' }, { text:'Default', to:'md_default' } ] },
    md_service:{ speaker:'Tim', text:'Servicing debt consumes creative principal.', choices:[ { text:'Accelerated payoff', to:'md_payoff' }, { text:'Refinance', to:'md_refinance' }, { text:'Default', to:'md_default' } ] },
    md_refinance:{ speaker:'Tim', text:'You restructure narratives; maturity extends.', choices:[ { text:'Sustain restructure', to:'md_end1' }, { text:'Collapse', to:'md_default' }, { text:'Return', to:'md_intro' } ] },
    md_default:{ speaker:'Tim', text:'Default voids promises; trust capital drops.', choices:[ { text:'Rebuild slowly', to:'md_rebuild' }, { text:'Walk away', to:'md_end2' }, { text:'Return', to:'md_intro' } ] },
    md_payoff:{ speaker:'Tim', text:'Aggressive payoff burns present joy.', choices:[ { text:'Accept burn', to:'md_end3' }, { text:'Slow down', to:'md_service' }, { text:'Return', to:'md_intro' } ] },
    md_rebuild:{ speaker:'Tim', text:'Rebuilding meaning from authentic micro-acts.', choices:[ { text:'Continue', to:'md_end4' }, { text:'Abandon', to:'md_end2' }, { text:'Return', to:'md_intro' } ] },
    md_end1:{ speaker:'Tim', end:true, text:'Restructured narratives hold—for now.' },
    md_end2:{ speaker:'Tim', end:true, text:'You exit obligations; wilderness returns.' },
    md_end3:{ speaker:'Tim', end:true, text:'Debt cleared; ashes of overextension.' },
    md_end4:{ speaker:'Tim', end:true, text:'Slow authentic deposits dissolve debt sustainably.' }
  } },
  // Story Pack 7: Silence & Signal
  silence_signal: { meta:{ title:'Silence & Signal', author:'oracle', version:1, description: 'Contrast cultivation between saturation and restorative quiet.' }, startsWith:'s_intro', nodes:{
    s_intro:{ speaker:'Tim', text:'Signal hunts attention; silence resets dynamic range.', choices:[ { text:'Amplify signal', to:'s_amplify' }, { text:'Seek silence', to:'s_silence' }, { text:'Balance', to:'s_balance' } ] },
    s_amplify:{ speaker:'Tim', text:'Amplification drowns subtle gradients.', choices:[ { text:'Keep amplifying', to:'s_end1' }, { text:'Retreat', to:'s_silence' }, { text:'Balance', to:'s_balance' } ] },
    s_silence:{ speaker:'Tim', text:'Silence felt as void; soon reinterpreted as fertile buffer.', choices:[ { text:'Stay', to:'s_end2' }, { text:'Reintroduce faint signal', to:'s_balance' }, { text:'Flood again', to:'s_amplify' } ] },
    s_balance:{ speaker:'Tim', text:'Dynamic equilibrium curates contrast.', choices:[ { text:'Lock equilibrium', to:'s_end3' }, { text:'Lean silence', to:'s_silence' }, { text:'Lean signal', to:'s_amplify' } ] },
    s_end1:{ speaker:'Tim', end:true, text:'Amplified landscape: saturated, flattened nuance.' },
    s_end2:{ speaker:'Tim', end:true, text:'Silence embraced; perception re-sensitized.' },
    s_end3:{ speaker:'Tim', end:true, text:'Balanced contrast: discernment sharpened.' }
  } }
};
