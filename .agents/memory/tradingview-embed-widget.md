---
name: TradingView embed widget limits
description: Constraints of the free TradingView "Advanced Real-Time Chart" embed widget relevant to any future work touching it.
---

The public/free TradingView embed widget (loaded via `embed-widget-advanced-chart.js` with a
JSON config in the script body) is a one-shot render: it has no JS update API. Any config
change (symbol, interval, color overrides, etc.) requires tearing down the DOM node and
re-injecting a fresh script tag — there is no `widget.setSymbol()`-style call available like
the paid Charting Library exposes.

**Why:** Confirmed via code review during a feature build — the review flagged repeated script
injection as a possible anti-pattern, but a true "no reinjection on config change" fix would
require switching to a completely different (Charting Library) approach, out of scope for a
free/embed integration.

**How to apply:** When editing config-driven behavior for this widget, debounce rebuilds (e.g.
~400ms) so rapid input (typing in a color field, etc.) doesn't cause a rebuild per keystroke,
and always clean up the previous DOM node/pending timers in the effect's cleanup function.
Don't treat "still reinjects on settled config changes" as a bug to keep chasing — it's an
inherent limitation of the embed widget, not a fixable leak.

Also: the embed widget cannot programmatically add third-party community Pine Script
indicators by name/author — those must be added manually through the widget's own Indicators
panel by the end user.
