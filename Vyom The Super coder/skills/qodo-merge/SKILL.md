---
name: qodo-merge
description: Code review and PR management using Qodo Merge (PR-Agent). Native Windows alternative to CodeRabbit.
tools: pr_review, pr_improve, pr_describe
---

# Qodo Merge - Automated Code Review

Qodo Merge (formerly PR-Agent) provides AI-powered feedback on local changes and pull requests.

## 🛠️ Commands

### 1. `pr-agent review`
Performs an automated review of the current changes. It looks for bugs, security issues, and style improvements.

### 2. `pr-agent improve`
Suggests specific code patches to improve the current changes.

### 3. `pr-agent describe`
Generates a detailed summary of the changes, perfect for commit messages or PR descriptions.

## 🚀 Quality Gate Strategy
In the Super-Agent loop, Qodo Merge is the final step. 
1. Ralph finishes a task.
2. Qodo Merge reviews the diff.
3. If Qodo Merge finds critical issues, Ralph iterates again to fix them.

> [!IMPORTANT]
> Install with: `pip install pr-agent` and configure your API key (OpenAI/Anthropic) in the environment.
