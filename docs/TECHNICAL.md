# How Fluid for YouTube works

[← Back to the README](../README.md)

Created by **xCC**. This guide describes version **1.3.1**, a Firefox WebExtension using Manifest V2. Its manifest targets Firefox 140 or later on desktop and 142 or later on Android to match support for the required data collection declaration. The browser loads its CSS and JavaScript directly from [the source directory](../src/manifest.json). There is no compilation step or background process.

The extension is intended to help older PCs browse YouTube more comfortably. It was tried in everyday use on an Intel Core i3 2nd generation system with 12 GB DDR3 RAM and a SATA SSD. This is a user report, not a controlled benchmark or a performance guarantee.

## 1. Rendering long lists

[Navigation CSS](../src/navigation.css) applies `content-visibility: auto` to supported YouTube card layouts. Firefox decides when it can skip layout and painting for a distant card. `contain-intrinsic-block-size: auto …` reserves an estimated height before the card is first rendered and lets Firefox reuse its measured height afterwards.

The selectors distinguish home cards, search results, recommendations, playlist entries, comment bodies and some Shorts shelves. A hovered card or a card with keyboard focus stops matching the rule. If YouTube changes a component and the selector no longer matches, Firefox uses the site’s normal layout. Video downloads and YouTube’s own JavaScript can continue while a card is off screen.

## 2. Giving visible thumbnails priority

[thumbnails.js](../src/thumbnails.js) runs at `document_start` on the main www.youtube.com page. Once the document has a head, it adds a `preconnect` hint for `https://i.ytimg.com` unless an equivalent hint already exists.

At startup, DOM readiness and the end of an in-site navigation, the script schedules checks at 0, 180, 650, 1600 and 3500 ms. A new schedule cancels outstanding timers. Each check inspects at most the first 28 matching images and skips hidden tabs, loaded images, small images and images outside the viewport. Up to four eligible thumbnails per navigation get `fetchpriority="high"`. A promoted image marked `loading="lazy"` is switched to `eager`.

These are scheduling hints. The browser, network, cache and timing of YouTube’s own requests determine the actual load time. There is no recurring scroll handler or thumbnail proxy.

## 3. Negotiating playback formats

[codecs.js](../src/codecs.js) uses Firefox’s `exportFunction` to wrap two checks in the page context. A blocked type returns an empty string from `HTMLMediaElement.prototype.canPlayType()` and `false` from `MediaSource.isTypeSupported()`. Other requests go to the original Firefox implementation. YouTube chooses from the formats it offers and Firefox reports as supported.

| Default | Behavior |
| --- | --- |
| Codec filter | Enabled |
| Blocked video codecs | VP8, VP9 and AV1 |
| Permitted formats | H.264, Opus and AAC, subject to browser support |
| Frame-rate limit | Off. When enabled, filters video types with an explicit `framerate` above 30. A type without that parameter is passed through the frame-rate check. |

[Preferences](../src/prefs.js) are initialized from shared defaults, then updated from `browser.storage.local` and its change events. The [settings panel](../src/settings.js) prevents blocking all listed video codecs or both listed audio codecs at once. Reloading the video gives the player a fresh opportunity to select a stream. The extension neither transcodes video nor enables a hardware decoder.

The [manifest](../src/manifest.json) scopes navigation optimizations to the top-level `https://www.youtube.com/*` document. The codec filter also runs in matching frames and on `https://www.youtube-nocookie.com/embed/*`. The declared extension permission is `storage`. The manifest declares a unique, stable add-on ID for AMO signing and updates.

## Build and test

From the repository root, run this in PowerShell:

```powershell
./build.ps1
```

The [packaging script](../build.ps1) writes `dist/Fluid-for-YouTube.zip` with `manifest.json` at the archive root. It includes both license notices. Documentation and its images stay outside the installable extension. On systems with the `zip` utility, the equivalent commands are:

```sh
(cd src && zip -r ../Fluid-for-YouTube.zip .)
zip Fluid-for-YouTube.zip LICENSE
```

For local development, load `src/manifest.json` through `about:debugging#/runtime/this-firefox`. After editing, reload the add-on there and refresh YouTube. For permanent installation in standard Firefox, distribute a Mozilla-signed build. [Mozilla submission guide](https://extensionworkshop.com/documentation/publish/submitting-an-add-on/)

| Check | What to look for |
| --- | --- |
| Playlist rendering | On a long playlist, inspect a matching distant row for `content-visibility: auto`. Scroll back and use Tab to focus a link. Its title and menu should remain usable. |
| Thumbnail scheduling | On a fresh search, inspect pending images in the viewport for `fetchpriority="high"`. Cached images may finish before the extension needs to promote them. |
| Playback | Reload a video with the default filter and inspect **Stats for nerds → Codecs**. Repeat with the filter disabled if a resolution is missing. |

In one Firefox comparison on a 16-video playlist, the browser deferred eight rows with version 1.1 and none with 1.0. The first two visible rows kept their dimensions. A separate 1.2 test on live search results found two visible thumbnails loaded and marked high priority. These checks verify the mechanisms. They do not measure an average speedup or a reduction in total page-load time.

## Attribution

The project uses the [MIT License](../LICENSE). The codec adaptation is based on [enhanced-h264ify at commit 16b206e](https://github.com/alextrv/enhanced-h264ify/tree/16b206e49a391c184cc356344387927ee127049f). Keep the [MIT notice for alextrv and erkserkserks](../src/LICENSE-enhanced-h264ify.txt) with redistributed copies.
