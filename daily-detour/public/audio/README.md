# Audio slots

The game synthesises all of its sound, so it works with no files at all. To use
recorded audio instead, put the files in this folder and add `manifest.json`:

```json
{
  "music": "theme.mp3",
  "cues": {
    "step": "step.mp3",
    "erase": "erase.mp3",
    "pickup": "pickup.mp3",
    "deliver": "deliver.mp3",
    "blocked": "blocked.mp3",
    "bell": "bell.mp3",
    "stamp": "stamp.mp3",
    "complete": "complete.mp3",
    "gold": "gold.mp3",
    "coin": "coin.mp3",
    "tap": "tap.mp3"
  }
}
```

Any cue left out keeps its synthesised version. Pickups and deliveries are
played a little higher for each one in the same route, so record them at the
lowest pitch you want to hear. Music loops seamlessly, so export
it with a loop point at the end. Keep cues short (under a second) and mastered
quietly: the game plays several at once.
