# Changelog

All notable changes to the DocuFlow AI project will be documented in this file.

---

## [1.0.0] - 2026-06-28
### Added
* **OCR Text Reader**: Added digital PDF extraction using `pypdf` and fallback scanned image parsing simulation with banners.
* **9 Business Validation Rules**: Configured checks for vendors, PO limit matches, duplicate checks, core fields, positive amounts, and future invoice dates.
* **Human Review Exceptions Workflow**: Integrated inline editing on extracted fields, reviewer complete action modals, and custom reviewer comments sections.
* **Role Enforcements**: Backend RBAC endpoints decorations and frontend UI buttons permissions boundaries.
* **Database Migrations**: Initialized Alembic database migration revisions.
* **Modular Services/Hooks**: Decoupled TanStack query/mutation hooks from pages and organized endpoints into distinct service files.

## [0.1.0] - 2026-06-15
### Added
* Initial project structure with mocked TanStack Start pages.
* FastAPI app boilerplate and security dependency filters.
* Initial Docker Compose configurations.
