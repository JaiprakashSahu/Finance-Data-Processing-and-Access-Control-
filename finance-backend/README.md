# Finance Backend

## User & Role System

### Roles Defined
- viewer
- analyst
- admin

### RBAC Enforcement
- RBAC is enforced in middleware through `authorize(roles)`.
- Protected routes:
  - `GET /users` is admin-only.
  - `PATCH /users/:id/role` is admin-only.
- `POST /users` is available to authenticated users in this assignment setup.

### Authentication Strategy
- Authentication is simulated for assignment scope.
- `mockAuth` sets `req.user` in middleware.
- Role can be tested with request header: `x-user-role` (`admin`, `analyst`, `viewer`).
- This project focuses on RBAC behavior, not token/session auth.

### Validation and Security Assumptions
- Passwords are hashed before persistence.
- Passwords are excluded from API responses.
- Email must be valid format.
- Password must have a minimum length of 8.
- API responses follow a consistent structure:

```json
{
  "message": "Success",
  "data": {},
  "error": null
}
```
