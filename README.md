<div align="center">
  <h1>🏢 CoHabit-AI</h1>
  <p><strong>Intelligent Hostel Roommate Allocations using AI & Constraint Programming</strong></p>

  <a href="https://cohabit-ai-2-0.onrender.com/">
    <img src="https://img.shields.io/badge/Live_Demo-Available-0284c7?style=for-the-badge&logo=render" alt="Live Demo" />
  </a>
</div>

<br />

> Random hostel room allocation often creates roommate conflicts. CoHabit-AI automatically interviews students and uses mathematical optimization to recommend highly compatible roommates, saving administrative time and improving student life.

## 🔗 Live Demo
**[Experience CoHabit-AI Live Here](https://cohabit-ai-2-0.onrender.com/)**

---

## ✨ Key Features

- **🤖 Automated AI Interviews:** Students chat with an AI that naturally extracts their living preferences without boring surveys.
- **🧬 Deep Trait Extraction:** Evaluates 5 core dimensions: Sleep Schedule, Study Habits, Cleanliness, Sociability, and Noise Tolerance.
- **⚡ Mathematical Optimization:** Uses Google OR-Tools to solve the complex bin-packing problem of matching hundreds of students simultaneously.
- **📊 Admin Dashboard:** Complete control for university administrators to manage students, view AI interview transcripts, and approve assignments.

## 🛠️ Technology Stack
- **Frontend:** React 18, Tailwind CSS, Lucide Icons
- **Backend:** Python, FastAPI, SQLAlchemy
- **Database:** PostgreSQL
- **AI Engine:** Google Gemini Pro / 2.5 Flash
- **Optimization:** Google OR-Tools (CP-SAT Solver)

---

## 📐 System Design & Architecture

CoHabit-AI solves a complex **NP-hard Capacitated Bin-Packing & Graph Partitioning** problem with multi-occupancy rooms and global utility optimization.

```mermaid
flowchart LR
    A[Student AI Interview] --> B[Gemini Trait Extraction]
    B --> C[Pairwise Compatibility Matrix]
    C --> D[Google OR-Tools CP-SAT Solver]
    D --> E[Optimal Room Assignments]
```

### Key Architectural Highlights
- **Mathematical Optimization via CP-SAT:** Enforces hard constraints (gender segregation, room capacity) and linearizes quadratic cohabitation objectives using boolean auxiliary variables.
- **Symmetry Breaking:** Eliminates $R!$ redundant search paths by constraining room occupancy order ($\sum x_{s,r} \le \sum x_{s,r-1}$).
- **Resilient AI Pipeline:** Pydantic schema validation, value clamping $[0.0, 1.0]$, and a deterministic heuristic fallback if the LLM API throttles.
- **Circular Time Math:** Handles midnight wrap-around for bedtime/wake-up comparisons via $\Delta t = \min(|t_1 - t_2|, 1440 - |t_1 - t_2|)$.
- **Scaling Strategy:** Employs hierarchical partitioning (deterministic slicing $\rightarrow$ spatial clustering) to scale from hundreds to $50,000+$ students without combinatorial solver explosion.

👉 **Read the full [System Design & Architecture Document](docs/SYSTEM_DESIGN.md)** for deep dives into mathematical proofs, asynchronous task queue design, and interview cheat sheets.

---

## 📖 Complete Documentation
- **Architecture & System Design:** [`docs/SYSTEM_DESIGN.md`](docs/SYSTEM_DESIGN.md)
- **Interactive Repository Guide:** Open **`CoHabit-AI_Complete_Guide.html`** in your browser for a deep dive into every file, schema, and API endpoint.

