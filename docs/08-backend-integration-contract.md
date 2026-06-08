# 08 - Backend Integration Contract

## Purpose
This document outlines the strict data structures and constraints the backend MUST adhere to, regardless of whether the final implementation is REST, GraphQL, or gRPC. 
The contract is more important than the API style.

## Immutable Rules
1. **API Agnosticism**: The frontend service layer is built with generic async promises. The backend must simply return the JSON payload exactly as the frontend expects it.
2. **Stateless Auth**: The frontend expects a JWT-style session token. Session persistence is the frontend's responsibility.
3. **Canonical Class IDs**: The backend MUST respond with canonical numeric class levels (e.g., `11`) and never Roman numerals (`XI`). The frontend handles all display conversions.

## Core Payloads

### User Object
Must include `role`, `linkedEntityId`, and `active` status.

### Student Entity
Must include `classId` (format: `class-{level}{section}`) and `admissionNo`.

### Timetable Entity
Must be returned as a nested structure or flat list filterable by `classId` or `teacherId`.

*(For detailed Schema configurations and exact field names, refer to `02-technical-reference.md` and `04-database-architecture.md`).*
