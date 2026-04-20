---
name: rtk
description: Token-saving command proxy for agentic workflows. Use rtk to wrap shell commands and reduce context window usage.
tools: rtk_exec
---

# RTK - Real-Time Toolkit (Token Optimizer)

RTK is used to optimize the output of CLI commands for LLM consumption. It removes noise and reformats data to save up to 90% of tokens.

## 🚀 Usage Strategy

**MANDATORY:** Always wrap high-output commands with `rtk` when running them for information gathering.

| Standard Command | Optimized (RTK) Command |
|------------------|-------------------------|
| `ls -R` | `rtk ls -R` |
| `git status` | `rtk git status` |
| `grep -r "..."` | `rtk grep -r "..."` |
| `cat package.json` | `rtk cat package.json` |
| `docker ps` | `rtk docker ps` |

## 🛠️ Implementation
- **Tool:** `rtk_exec`
- **Action:** Prepends `rtk ` (if installed) to the requested command.

> [!TIP]
> Using RTK prevents "Context Rot" and ensures that the Super-Agent stays fast even in large project directories.
