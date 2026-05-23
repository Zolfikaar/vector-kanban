# 🗺️ UrLabs Kanban - Future Board Roadmap

Track features planned for subsequent architectural phases.

The board layer is now decoupled from column lifecycle: **board edits are title-only**, while **column add / edit / delete** flow through dedicated modals, Pinia actions, and `/api/columns` endpoints. That separation is the foundation for the enhancements below.

---

- [ ] **Board Metadata & Details**:
  - Add a dedicated Board Description field.
  - Display Board Creation Date and Last Updated timestamps.
- [ ] **Collaboration & Access Control**:
  - Introduce Board Members management (Assign roles, view member avatars, and manage access permissions).
- [ ] **Customization & Themes**:
  - Dynamic Board Styling: Ability to set a custom background solid color or pick from high-quality background images.
- [ ] **Audit & History Log**:
  - Implement an Activity Log / Board History ledger to track who moved, edited, or archived tasks and columns.

---

## Related Documentation

- [README.md](./README.md) — Architecture, setup, and API overview
- [PROJECT_ROADMAP.md](./PROJECT_ROADMAP.md) — Phased delivery status (Phases 1–8)
- [PROJECT_PROGRESS.md](./PROJECT_PROGRESS.md) — Granular implementation checklist
