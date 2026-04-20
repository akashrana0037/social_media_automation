---
name: ralph
description: Autonomous AI agent loop for completing PRD items.
tools: prd_gen, prd_convert, ralph_loop
---

# Ralph - Autonomous Project Completion

Ralph is a pattern that runs an AI loop until all items in a project's PRD are complete.

## 🛠️ Commands

### 1. `/prd` (Generate PRD)
Generates a detailed `prd.json` file from a project description.
- **Goal:** Create a list of small, testable user stories.
- **Format:** `prd.json` with fields like `branchName`, `userStories`, and `acceptanceCriteria`.

### 2. `/ralph-convert` (Convert Markdown to JSON)
Converts a Markdown PRD (e.g., `PRD.md`) into the structured `prd.json` format required for the loop.

### 3. `/ralph-loop` (Start Automation)
Starts the autonomous execution loop.
- **Action:** Picks the highest priority failing story, implements it, runs tests, and commits if successful.
- **Memory:** Persists learnings to `progress.txt` after every iteration.

## 📝 Best Practices
- **Atomic Stories:** Ensure each story in `prd.json` is small enough to finish in a single context window.
- **Quality Gates:** Always define `typecheck` and `test` commands in the PRD.
- **Git State:** Ralph operates on a feature branch defined in the PRD.

---

## 🚀 Loop Logic (Windows/Python)
The loop resides in `scripts/ralph_loop.py`.
