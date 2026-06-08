# 10 - Backend Migration Roadmap

## The Current State
- **Framework**: React 18
- **Data Access**: `src/services/*` calls `MockDB`.
- **Database**: Everything lives in `localStorage` via `src/persistence/*`.

## The Future State
- **Framework**: React 18
- **Data Access**: `src/services/*` calls `API Provider` (`axios` or `fetch`).
- **Backend**: Node Backend (e.g. Express/NestJS)
- **Database**: PostgreSQL

## What Changes?
**ONLY THE PROVIDER & SERVICE LAYER.**
The migration strategy is explicitly designed to be painless. Backend developers will love this setup because the frontend is completely decoupled from the data layer.

1. Remove `src/mockDB/` entirely.
2. In `src/services/*`, replace `return MockDB.students.all()` with `return axios.get('/api/students')`.

## What Doesn't Change?
- **Components**: UI components remain 100% untouched.
- **Contexts**: Global state managers remain exactly as they are.
- **Pages**: Routing and page-level container logic stays identical.
- **Schemas**: The expected JSON shapes of data flowing into the components must remain identical to the mock database schemas defined in `02-technical-reference.md`.
