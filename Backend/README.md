# Backend API

## Register a user

Registers a new user account with a first name, email address, and password.

### Endpoint

```http
POST /users/register
Content-Type: application/json
```

The application mounts the user routes at `/users`, so the full path is
`/users/register` (plural), not `/user/register`.

### Request body

| Field | Type | Required | Requirements |
| --- | --- | --- | --- |
| `fullName.firstName` | string | Yes | At least 3 characters |
| `fullName.lastName` | string | No | If provided, at least 3 characters |
| `email` | string | Yes | Must be a valid email address |
| `password` | string | Yes | At least 6 characters |

Example:

```json
{
  "fullName": {
    "firstName": "Alex",
    "lastName": "Morgan"
  },
  "email": "alex.morgan@example.com",
  "password": "secure123"
}
```

`lastName` may be omitted. The first name must be nested under `fullName`; a
top-level `firstName` does not match the user model.

### Status codes

The following are the expected responses for a completed registration handler:

| Status | Meaning |
| --- | --- |
| `201 Created` | The account was created successfully. |
| `400 Bad Request` | A required field is missing or the request data is invalid. |
| `409 Conflict` | An account already exists with the submitted email address. |
| `500 Internal Server Error` | An unexpected server error prevented registration. |

### Example responses

Successful registration (`201 Created`):

```json
{
  "message": "User registered successfully",
  "user": {
    "id": "66f123abc4567890def12345",
    "fullName": {
      "firstName": "Alex",
      "lastName": "Morgan"
    },
    "email": "alex.morgan@example.com"
  },
  "token": "<authentication-token>"
}
```

Invalid request (`400 Bad Request`):

```json
{
  "errors": [
    {
      "msg": "Please enter a valid email",
      "path": "email"
    }
  ]
}
```

> These examples illustrate a possible response format; the current controller
> does not define a response body.

> **Implementation note:** The current `registerUser` controller is empty, so
> this endpoint does not yet implement these responses or complete registration.
