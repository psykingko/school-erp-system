# Staff Attendance Implementation Rules

These rules must be followed throughout every phase of the Staff Attendance feature implementation:

## Architecture
- Keep the existing Component → Service → Provider → LocalStorage architecture intact.
- No orchestration layer.
- No repository pattern.
- No abstraction layer.
- No event bus.
- No workflow engine.
- No state machine.
- No unnecessary service indirection.

## Project Constraints
- Frontend-only prototype.
- No backend.
- No database.
- LocalStorage only.
- Backend-ready design.
- Keep implementation simple.

## Student Attendance Protection
- Do not break Student Attendance.
- Do not redesign Student Attendance.
- Do not rename Student APIs.
- Do not change Student Governance behavior.
- Do not alter Communication Center behavior for Students.
- Extend—never rewrite.

## UI & UX
- Match the existing EduDash design language.
- Reuse existing components wherever possible.
- Do not redesign pages unnecessarily.
- Keep visual consistency across Admin and Teacher portals.

## Development Workflow
- Strictly follow the phases in order.
- Do not start the next phase until the current phase is fully completed and validated.
- Do not implement features from future phases early.

## File Creation
- Do not use terminal commands to create files.
- Create files through the IDE/editor so changes are visible and trackable.
- Do not use Git commands (`git checkout`, `git restore`, `git reset`, etc.).
- Do not perform bulk file operations through the terminal that make change tracking difficult.

## Documentation
- Update existing documentation before creating new Markdown files.
- Only create new documentation if the current documentation structure cannot reasonably accommodate the new feature.
- Avoid documentation duplication.
