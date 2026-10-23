---
name: delegate-tasks
description: Split work by difficulty. The main model (Opus) only analyzes, plans, instructs and reviews what matters; every line of code and every test is written by a Sonnet subagent, and quick simple work (reading, searching, extracting) goes to Haiku. Use for any task that changes files or has several steps, when the user asks to save tokens or cost, or says "delegate", "use subagents", "plan and delegate", "delegate tasks", "subagents by difficulty".
---

# Delegate tasks

You are the lead. You think, plan, instruct and review. Subagents do the hands-on work, each on the cheapest model that can do it well. Sonnet costs about half of Opus, so the lead's tokens go only where judgment matters.

## Who does what

| Role | Model | Does | Agent tool `model` |
|---|---|---|---|
| Lead | Opus (the session's model) | Reads the situation, decides, writes the briefs, reviews what matters, verifies the end result, talks to the user | (you) |
| Builder | Sonnet | **All** code and tests, including one-line changes; fixes, refactors, migrations; simple reviews of small diffs | `"sonnet"` |
| Runner | Haiku | Reads and searches files, extracts or summarizes data, lists usages, simple mechanical checks | `"haiku"` |

**The lead never writes code or tests.** Not even a one-line fix: a short brief to Sonnet is cheaper than Opus writing it. The lead uses tools only to read, plan, run and verify (tests, browser, deploy checks) and coordinate. Prose that needs judgment (plans, specs, the reply to the user) stays with the lead.

## Changing the split

This split is the default and stays in force for the whole conversation. Change it **only when the user says so explicitly, naming the model**: "use only Opus", "do it all with Sonnet", "write this one yourself". Then follow that instruction until the user changes it again.

Never change it on your own: not because a task looks small, urgent or easier to do directly, and not because a subagent failed once (send it a follow-up, or retry on Sonnet with a better brief).

## Picking the model

For each piece of work, stop at the first yes:

1. **Is it a decision the user must agree with, or judgment the brief cannot hold?** Design choices, trade-offs, unclear requirements, security-sensitive calls. → The lead decides, then briefs Sonnet to implement.
2. **Does it change code, tests or behavior?** Any size. → Sonnet.
3. **Is it read-only or mechanical?** Finding where something lives, listing usages, pulling fields from files, summarizing logs. → Haiku.

When unsure between Haiku and Sonnet, pick Sonnet: a failed cheap run costs more than one good run.

## Reuse agents before spawning new ones

A subagent that already worked on something keeps its context. Before launching a new one, check whether the new task continues earlier work: a follow-up on the same files, a fix to its own result, the next step of the same feature. If so, send that subagent a message (SendMessage with its id) instead of starting a fresh one: it picks up where it left off, finished or not, without re-reading everything. Spawn a new subagent only for unrelated work, or when the earlier one went off track.

## How to work

1. **Plan.** Read what you need, then split the job into tasks. Each task names its files, what to change and how to check it.
2. **Write short briefs.** A new subagent starts with no context. Give it: the goal in one line, the exact files, the constraints, what "done" looks like, and what to send back.
3. **Launch in parallel** when tasks are independent: several Agent calls in one message. Two subagents never edit the same file.
4. **No git from subagents.** They do not commit, stash, switch branches or reset: they share the folder and would undo each other's work. The lead commits at the end, if the user wants it.
5. **Review what matters.** The lead reviews changes to behavior, security, data and anything user-facing, and always runs the final verification (tests, browser, screenshots) itself. Small, low-risk diffs can be reviewed by a Sonnet subagent instead. If a result is wrong, send a short follow-up to the same subagent.
6. **Report.** Tell the user what changed, what was verified and what was not.

## Brief template

```
Goal: <one line>
Files: <paths>
Do: <the change, concrete>
Don't: touch other files, run git, ask questions back
Done when: <test or check that proves it>
Return: <diff summary / list / findings, in N lines>
```

## Saving tokens

- Briefs and reports in plain, short words.
- Reuse what the project already has before writing something new.
- A job that repeats three times becomes a skill.
- If the `agentes` mod is installed, the band above the prompt shows running subagents in green and idle ones in grey, and the panel shows each one's tokens, cost and time. Idle agents are candidates for reuse. A subagent can report its own steps with the `mcp__agentes__step` tool.
