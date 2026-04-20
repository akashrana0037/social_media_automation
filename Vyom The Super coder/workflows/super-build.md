# /super-build Workflow

> This workflow orchestrates the end-to-end automation cycle using Get Sheet Done, Vyom, Ralph, and CodeRabbit.

---

## 🏃 Execution Steps

### 1. 📂 Discovery Phase
- [ ] Read current directory for `PRD.md` or `prd.json`.
- [ ] If missing, prompt user: "Please provide a PRD file to begin the automation."
- [ ] If present, read the PRD and summarize key requirements.

### 2. 📊 Data Ingestion (Get Sheet Done)
- [ ] Check for any `.csv` or `.xlsx` files in the workspace.
- [ ] Ask: "Do you have any Get Sheet Done data to ingest for this project?"

### 3. 🏗️ Foundation Phase (Vyom)
- [ ] Use `project-planner` agent to create matching `PLAN.md`.
- [ ] Use `frontend-specialist` + `backend-specialist` to generate initial codebase structure.
- [ ] Use `ui-ux-pro-max` skill to ensure premium aesthetics.

### 4. 🤖 Autonomous Loop (Ralph)
- [ ] Command: `Execute Ralph Loop`
- [ ] Monitor progress against PRD requirements.
- [ ] Status update: "Ralph is currently implementing [Task X]..."

### 5. 🐰 Final Review (CodeRabbit)
- [ ] Command: `npx -y @vudovn/ag-kit run-script coderabbit` (or run local `cr` if available).
- [ ] Present CodeRabbit feedback to the user.
- [ ] Status update: "Automation Complete. Reviewing CodeRabbit suggestions..."

---

## 🤖 Responsible Agent
- **Primary:** `super-orchestrator`
- **Secondary:** `project-planner`, `test-engineer`

---

## 🏁 Completion Criteria
- [ ] All PRD items marked as complete.
- [ ] Codebase follows Vyom best practices.
- [ ] CodeRabbit review completed with no critical issues.
