---
name: gh-fix-ci
description: Debug and fix failing GitHub PR checks in GitHub Actions using gh to inspect checks, fetch logs, summarize failures, plan fixes, and implement after approval.
---

## Overview

Use `gh` to locate failing PR checks, fetch GitHub Actions logs for actionable failures, summarize the failure snippet, then propose a fix plan and implement after explicit approval.

Prereq: authenticate with GitHub CLI (`gh auth login` with repo + workflow scopes).

## Quick Start

```
python ".opencode/skills/gh-fix-ci/scripts/inspect_pr_checks.py" --repo "." --pr "<number-or-url>"
```

Add `--json` for machine-friendly output.

## Workflow

1. **Verify gh auth** — run `gh auth status` in repo; if unauthenticated, ask user to run `gh auth login`.
2. **Resolve PR** — `gh pr view --json number,url` or use the provided PR number/URL.
3. **Inspect failing checks** (GitHub Actions only):
   - Preferred: run `python ".opencode/skills/gh-fix-ci/scripts/inspect_pr_checks.py" --repo "." --pr "<number>"` (handles field drift and log fallbacks)
   - Manual fallback: `gh pr checks <pr> --json name,state,bucket,link,startedAt,completedAt,workflow`, then `gh run view <run_id> --log` for each failure
4. **Scope non-GitHub Actions checks** — if `detailsUrl` is not a GH Actions run, label external and report URL only.
5. **Summarize failures** — failing check name, run URL, concise log snippet.
6. **Draft a plan** — propose fix, request approval.
7. **Implement after approval** — apply fix, summarize diffs/tests, ask about opening PR.
8. **Recheck** — re-run relevant tests and `gh pr checks` to confirm.
