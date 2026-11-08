/**
 * The story told through letters. Each chapter's letters unlock as routes in it are
 * delivered, and finishing a chapter leaves a keepsake in the village.
 */
export interface Letter { at: number; from: string; text: string }
export interface ChapterStory { title: string; letters: Letter[]; keepsake: { id: string; label: string } }

export const STORY: Record<string, ChapterStory> = {
  classic: {
    title: 'Pip’s first round',
    letters: [
      { at: 1, from: 'Mr Fennick', text: 'The round is yours now, Pip. Mind the potholes, and never skip Mrs Pennyworth. She counts.' },
      { at: 7, from: 'Mrs Pennyworth', text: 'On time three days running. I’ve told the whole row about you.' },
      { at: 14, from: 'Old Albert', text: 'This village used to buzz. With you riding about, it’s starting to again.' },
      { at: 20, from: 'Mr Fennick', text: 'Every route on my old map, delivered. My bicycle is leaning by the green. It’s yours.' },
    ],
    keepsake: { id: 'bicycle', label: 'Mr Fennick’s old bicycle' },
  },
  'market-town': {
    title: 'The bakery’s hours',
    letters: [
      { at: 1, from: 'Rosa Bianchi', text: 'I’m reopening the old bakery, but only once the first batch is out. Come when the sign says.' },
      { at: 8, from: 'Signora Conti', text: 'The market keeps its own hours. You’ve learned them faster than my husband ever did.' },
      { at: 16, from: 'Rosa Bianchi', text: 'A queue round the corner this morning. Half of them came because you told them.' },
      { at: 24, from: 'Rosa Bianchi', text: 'Market Town is on the map again. The bread cart is parked in your village, for keeps.' },
    ],
    keepsake: { id: 'breadcart', label: 'Rosa’s bread cart' },
  },
  'round-the-green': {
    title: 'Open gates',
    letters: [
      { at: 1, from: 'Miss Thistlewood', text: 'Bring my seeds first and you may cut through my garden. I don’t offer that to just anyone.' },
      { at: 8, from: 'Dr Amari', text: 'Half the green leaves their gates on the latch for you now.' },
      { at: 16, from: 'Wen and Lucy', text: 'We painted every gate on the green blue. It’s so you can spot the shortcuts.' },
      { at: 24, from: 'Miss Thistlewood', text: 'The gardens open to everyone this Sunday. You started that. A blue gate is waiting at home.' },
    ],
    keepsake: { id: 'gates', label: 'a blue garden gate' },
  },
  'old-quarter': {
    title: 'A wedding on the cobbles',
    letters: [
      { at: 1, from: 'Tobias the tailor', text: 'My daughter is getting married in the Old Quarter. Everything breakable, every street cobbled. Help.' },
      { at: 8, from: 'Mrs Quigley', text: 'Not a single cracked egg all week. The Quarter has noticed.' },
      { at: 16, from: 'Tobias the tailor', text: 'The cake arrived whole. The bride cried. The cake did not.' },
      { at: 24, from: 'Pastor Lyle', text: 'The whole Quarter came to the wedding. They’ve sent the flower arch to your village green.' },
    ],
    keepsake: { id: 'arch', label: 'the wedding arch' },
  },
  riverside: {
    title: 'Both banks',
    letters: [
      { at: 1, from: 'Captain Moss', text: 'Two banks, two bridges, one courier. That river has split this town for years.' },
      { at: 8, from: 'Fergus', text: 'Folk on the far bank say they’ve never had service like it.' },
      { at: 16, from: 'Captain Moss', text: 'I’ve got the old ferry running again. Couldn’t let you do all the work.' },
      { at: 24, from: 'Captain Moss', text: 'Both banks, one town. The little ferry is moored by your village now.' },
    ],
    keepsake: { id: 'ferry', label: 'the little ferry' },
  },
  'high-street': {
    title: 'The great fete',
    letters: [
      { at: 1, from: 'Mr Abernathy', text: 'The High Street hasn’t had a fete in twenty years. We’d need a very good courier.' },
      { at: 8, from: 'Auntie Dot', text: 'Every shop on the street is joining in. Even the grocer, and he never joins in.' },
      { at: 16, from: 'Professor Vane', text: 'I’ve calculated your routes. They’re better than mine. I’m annoyed and impressed.' },
      { at: 24, from: 'Everyone', text: 'The best fete in living memory. Three cheers for Pip! The bunting is going up in your village.' },
    ],
    keepsake: { id: 'streamers', label: 'fete streamers' },
  },
};

/** Letters unlocked for a chapter given how many of its routes are delivered. */
export function lettersFor(chapterId: string, delivered: number): Letter[] {
  return (STORY[chapterId]?.letters ?? []).filter((l) => delivered >= l.at);
}

/** Keepsakes from finished chapters. */
export function chapterKeepsakes(progress: Record<string, { delivered: number; total: number }>): string[] {
  return Object.entries(STORY).filter(([id]) => progress[id] && progress[id].delivered >= progress[id].total).map(([, s]) => s.keepsake.id);
}
