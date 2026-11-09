/**
 * Neighbours who move into the village when you build them a cottage with
 * coins. Each brings three special deliveries (new puzzles in requests.ts)
 * and writes after each one.
 */
export interface Neighbour {
  id: string;
  name: string;
  trade: string;
  cost: number;
  moveIn: string;
  /** What they ask for, one per request. */
  asks: [string, string, string];
  /** Their thank-you after each request. */
  thanks: [string, string, string];
}

export const NEIGHBOURS: Neighbour[] = [
  {
    id: 'mabel', name: 'Mabel Thorne', trade: 'beekeeper', cost: 150,
    moveIn: 'The hives are humming and the kettle’s on. Thank you for the cottage, Pip. Come by when you can; I’ll have a round for you.',
    asks: [
      'First jars of the season. Round the green and home before the bees notice I’m gone.',
      'A swarm has settled on the Grocer’s awning. Deliver quickly while I coax them down.',
      'The garden party is at four. Everything must arrive, and nothing may wobble.',
    ],
    thanks: [
      'Every jar delivered and not a sticky fingerprint. Have a honeycomb on me.',
      'Swarm safely boxed and the town fed. You’re braver than my veil.',
      'The best garden party the green has seen. The queen bee sends her regards.',
    ],
  },
  {
    id: 'bram', name: 'Bram Ashdown', trade: 'clockmaker', cost: 240,
    moveIn: 'My clocks tick in time at last, now there’s a workshop to keep them in. Punctual couriers are my favourite kind.',
    asks: [
      'Every clock in town needs its winding key. Mind you’re home by the hour.',
      'Half past the hour and three parcels late. Can you make up the time?',
      'The town hall chimes at noon. Every part delivered before the first bong, please.',
    ],
    thanks: [
      'Right on time. I may set my watch by you.',
      'Not a minute wasted. Lovely gearwork, that route.',
      'Twelve bongs, twelve cheers. The chimes are mended, and you did it.',
    ],
  },
  {
    id: 'ivy', name: 'Ivy Marsh', trade: 'postmistress', cost: 320,
    moveIn: 'The new post office smells of fresh paint and brown paper. You and I are going to be very busy, Pip.',
    asks: [
      'The second post is heavier than the first. The old lanes, if you please.',
      'Parcels for every crooked corner of the lanes. Some of them twice.',
      'Return to sender: three wrong addresses and a very cross goose.',
    ],
    thanks: [
      'Signed, sealed, delivered. I’ll put the kettle on.',
      'Not a parcel lost in the lanes. That’s a first for this village.',
      'Everything back where it belongs, and the goose has forgiven you.',
    ],
  },
  {
    id: 'felix', name: 'Felix Lund', trade: 'painter', cost: 420,
    moveIn: 'The light by the river is perfect. I’m painting the whole village, and I’d like you in it, bike and all.',
    asks: [
      'Wet paint on half the railings. Deliver without leaning on anything.',
      'I’m painting both banks at dawn. Fetch my supplies from either side.',
      'The exhibition opens tonight. Every painting to its new home, across the river.',
    ],
    thanks: [
      'Not a smudge. You’d make a fine assistant.',
      'Both banks before breakfast. The light was perfect.',
      'Every painting hung. Look for the one with a courier in the corner.',
    ],
  },
];

export const requestId = (who: string, n: number) => `req-${who}-${n}`;
export const REQUEST_IDS: string[] = NEIGHBOURS.flatMap((nb) => [1, 2, 3].map((n) => requestId(nb.id, n)));
export const neighbourOf = (puzzleId: string): Neighbour | undefined => {
  const m = /^req-([a-z]+)-\d$/.exec(puzzleId);
  return m ? NEIGHBOURS.find((nb) => nb.id === m[1]) : undefined;
};
