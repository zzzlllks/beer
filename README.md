# Act as a beer / 啤酒模拟器 Web MVP

An absurd comedy browser game where the player acts as a beer bottle trying to be bought before expiring, while avoiding falling, breaking, being thrown out by the shop owner, or being taken by the Demon King.

本游戏为虚构搞笑作品。未成年人请勿饮酒，请理性饮酒。

## Current Status

This is a playable Web MVP for testing, recording, sharing, and lightweight platform deployment.

Supported targets:

- Local static web server
- GitHub Pages
- Vercel
- TikTok web/link distribution
- Future TikTok/Douyin mini-game adaptation through `platform.js`

TikTok note: the current version is a browser-first web build. It can be shared or tested as a TikTok web link today. A deeper TikTok/Douyin mini-game wrapper can be added later without rewriting the core game logic.

## Tech Stack

- HTML5
- CSS
- JavaScript
- Phaser 3
- Browser `localStorage`
- Mock rewarded ads, no real ad SDK yet

## Project Structure

```text
index.html
style.css
main.js
platform.js
package.json
vercel.json
terms.html
privacy.html
DEPLOYMENT.md
vendor/
assets/
  beers/
  customers/
  scenes/
  ui/
  decorations/
```

## Run Locally

Use a static server:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

Or use npm:

```bash
npm run dev
```

On Windows PowerShell, if `npm` is blocked, use:

```bash
npm.cmd run dev
```

## Controls

Mobile:

- Tilt phone to roll the beer
- Tap screen to rotate the label

Desktop debug:

- `A / D`: roll left/right
- `W / S`: move forward/back
- `Space`: rotate label
- `1 / 2 / 3`: switch fixed camera angle

## Implemented MVP Features

- 2.5D shelf/freezer view
- Five random scenes
- Mobile tilt and keyboard debug controls
- Label-facing system
- Random customer system
- Demon King danger system
- Invisibility sticker item
- Freezer pile/burial gameplay
- Lightweight arcade collision physics
- Bottle integrity system
- Visible bottle break feedback
- Shop owner throw-out ending
- Three-day expiration timer
- Score, streak, waiting reward, and risk system
- Mock rewarded ads
- Free sticker-style outfit editor
- `localStorage` save data

## Mock Ads

The current version does not connect to a real advertising SDK. Rewarded ad buttons simulate a 1-second delay and then grant rewards.

Mock ad placements:

- Revive after breaking
- Gain invisibility sticker before/while Demon King danger
- Double score on settlement
- Gain points from the main menu/shop button

Ad integration is isolated in:

```text
platform.js
```

Replace the mock implementation there when adding a real TikTok/Douyin/Vercel/web ad integration.

## Deployment

Repository:

[https://github.com/zzzlllks/beer](https://github.com/zzzlllks/beer)

Full deployment notes:

[DEPLOYMENT.md](./DEPLOYMENT.md)

Expected GitHub Pages URL:

```text
https://zzzlllks.github.io/beer/
```

Vercel:

```bash
npm run deploy:vercel
```

GitHub Pages workflow:

```text
.github/workflows/deploy-pages.yml
```

## Legal Pages

- [Terms of Service](./terms.html)
- [Privacy Policy](./privacy.html)

Current privacy behavior:

- No user account system
- No payment system
- No intentional personal information collection
- Gameplay data is saved locally with `localStorage`
- Future versions may add real advertising and update the policies

## Save Data

The game uses `localStorage` for:

- Total points
- Best score
- Best streak
- Win/failure counts
- Customer purchase stats
- Demon dodge count
- Double-score ad count
- Outfit configurations

## Asset Expansion

Recommended folders:

```text
assets/beers/
assets/customers/
assets/scenes/
assets/ui/
assets/decorations/
```

Decoration config:

```text
assets/decorations/decorations.json
```

Future content should be added through assets and config where possible, avoiding rewrites of core gameplay logic.

## Checks

```bash
npm run check
```

or:

```bash
npm.cmd run check
```

## Roadmap

- More complete asset/config loading
- Codex/gallery UI
- More customers and special customers
- More scene events
- Outfit shop and point unlocks
- TikTok/Douyin mini-game platform wrapper
