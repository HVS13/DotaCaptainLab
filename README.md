# DotaCaptain Lab

A free, unofficial DotaCaptain draft and team-comparison calculator. Runs entirely in your browser; no account, subscription, server, or installation is required.

**Open:** [DotaCaptain Lab](https://hvs13.github.io/DotaCaptainLab/)

## Use the calculator

1. **Draft assistant:** enter your lottery side, first-pick side, and actual CM turn. Record confirmed picks and bans. Leave unknown enemy heroes, roles, and strategy axes blank. Recommendations never submit actions to DotaCaptain.
2. **Composition ranking:** browse the pre-tested 120-team reference, filter heroes, sort results, and pin up to four teams. Choose a comparison baseline explicitly; the difference column compares native draft points.
3. **Inspect a team:** see its assigned roles, native default item presets, nearby hero alternatives, strategy settings, and three hypothetical counter lineups.
4. **Test changes:** Find candidate teams gives a native-score shortlist. Benchmark selected batch tests its displayed strategies. Auto optimize screens strategies on training scenarios and evaluates the selected configuration separately. Choose the team count and opponent sample size before running; large jobs take longer and can be cancelled.
5. **Selected matchup:** enter all five enemy heroes. Assign their roles or allow inference. A single-match simulation also needs your side and all six enemy strategy choices. The six-scenario test instead checks both sides and three preset enemy plans.

General ranking deliberately ignores live enemy inputs. Current-draft ranking constrains hypothetical completions to revealed picks and supplied assumptions. General wins and Solo-weighted percentages are simulator benchmarks, **not actual win probabilities**. A rank range shows sensitivity across generated opponent samples, not a confidence interval.

## Accuracy and limitations

The public DotaCaptain client simulator, data, AI score coefficients, and role-default item presets are retained. The default reference has 61,440 scenario results. Unknown enemy roles and lineups are explicit assumptions. Private server settings, ranked profiles, organization modifiers, and account comfort history are unavailable; live-server parity and a global optimum are not established.

See [calculation methodology](docs/methodology.md) and [source URLs and hashes](dist/source-manifest.json). This project is not affiliated with DotaCaptain. Interface workflow inspired by [wuwa_calc](https://riley31415.github.io/wuwa_calc).

## Run locally

From this repository, serve the static files over HTTP:

```sh
python -m http.server 8765 --directory dist
```

Then open http://localhost:8765. Opening the HTML directly as a file does not support the calculation worker.

Run the included calculation checks with Node.js 18 or later:

```sh
node tests/verify.cjs
```

## Publishing

Push to `main` to validate and publish `dist/` with the GitHub Pages workflow. GitHub Pages hosting and standard GitHub Actions runners are free for this public repository. No paid hosting provider or custom domain is required.
