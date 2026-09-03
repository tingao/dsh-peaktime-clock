# dsh-whale-clock

A corner clock for the DeepSeek Harness web GUI that tells you, at a glance,
whether DeepSeek API calls are currently **peak-priced** or **off-peak** —
without leaving your chat window.

An animated DeepSeek whale floats in the bottom-right corner of the harness UI.
The whale and the pill behind it turn **red during peak-price windows** and
**green during off-peak windows**, and the pill shows a live **countdown to the
next window boundary** plus a local-time readout.

## Price windows

DeepSeek's official pricing windows are defined in UTC:

| State | UTC window |
| --- | --- |
| Peak (full price) | 01:00–04:00 |
| Off-peak (discounted) | 04:00–06:00 |
| Peak (full price) | 06:00–10:00 |
| Off-peak (discounted) | 10:00–01:00 (next day) |

The widget **classifies the current moment in UTC** (so it is always correct)
and **renders local time and the countdown in your machine's timezone**
(via the browser's local time, DST-aware). No configuration needed.

## Install

```sh
dsh plugin --profile web add dsh-whale-clock
```

Restart DeepSeek Harness after installation, and the whale appears in the
bottom-right corner of the web UI.

> The package is listed on the 1024 Store; when it is published to npm the
> store shows the install command above. Until then you can install the
> bundle from this repository with
> `dsh plugin --profile web add github:tingao/dsh-whale-clock` or add the
> folder as a `file:` dependency in your profile's `package.json`.

## What it shows

- **Whale color / badge** — red `PEAK` or green `OFF-PEAK`, live.
- **Countdown** — time until the next pricing-window boundary (for example
  `1h 23m` or `04m 12s`).
- **Tooltip** — current window, its UTC range, the fixed daily schedule, and
  the exact local date/time with your UTC offset.

Everything runs locally in the browser; no network calls, no telemetry.

## Layout

```
dsh-whale-clock/
├── cordis.patch.yml   # composes the bundle row into the harness
├── client/client.js   # the browser widget (React via slots + timer)
└── lib/index.js       # empty host half (the widget is client-side)
```

## Credits

The whale artwork is the official DeepSeek logo vector from
[lobe-icons](https://github.com/lobehub/lobe-icons)
(`packages/static-svg/icons/deepseek-color.svg`), recolored per pricing state.

## License

MIT
