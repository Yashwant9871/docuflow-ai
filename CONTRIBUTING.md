# Contributing to DocuFlow AI

Thank you for your interest in contributing to DocuFlow AI! We welcome contributions from developers of all skill levels to help improve this enterprise document intelligence platform.

---

## Coding Standards

### Python (Backend)
* We target **Python 3.12** and use standard type hinting.
* Code should conform to **PEP 8** style guidelines.
* Keep controllers thin; place database transactions and business logic in the `services/` layer.
* Use Pydantic schemas for serialization and request validation.

### TypeScript / React (Frontend)
* Use functional React components with hooks.
* Group asynchronous operations inside the `/src/hooks` folder using TanStack React Query.
* Style components using Tailwind CSS utility classes or Shadcn UI components.
* Maintain strict TypeScript types. Do not use `any` unless absolutely unavoidable.

---

## Pull Request Checklist

Before submitting a Pull Request, please ensure:
1. All backend Python files compile successfully (`python -m compileall app`).
2. Frontend Vite application builds successfully with no TypeScript errors (`npm run build`).
3. Database changes include an Alembic migration script.
4. Idempotent seed data checks inside `init_db.py` are preserved.
5. All route logic respects defined RBAC guards.
6. Described changes are added to `CHANGELOG.md`.
