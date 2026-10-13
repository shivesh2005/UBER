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

## Log in a user

Authenticates an existing user using their email address and password. On
success, the endpoint returns an authentication token and the user document.

### Endpoint

```http
POST /users/login
Content-Type: application/json
```

The app mounts user routes at `/users`, making the full path `/users/login`
(plural), rather than `/user/login`.

### Request body

| Field | Type | Required | Requirements |
| --- | --- | --- | --- |
| `email` | string | Yes | Must be a valid email address |
| `password` | string | Yes | At least 6 characters |

Example:

```json
{
  "email": "alex.morgan@example.com",
  "password": "secure123"
}
```

### Status codes

| Status | Meaning |
| --- | --- |
| `200 OK` | Login succeeded; the response contains an authentication token and user. |
| `400 Bad Request` | The email is invalid or the password is shorter than 6 characters. |
| `401 Unauthorized` | The password does not match the account. |
| `404 Not Found` | No account exists for the submitted email address. |

### Example responses

Successful login (`200 OK`):

```json
{
  "token": "<authentication-token>",
  "user": {
    "_id": "66f123abc4567890def12345",
    "fullName": {
      "firstName": "Alex",
      "lastName": "Morgan"
    },
    "email": "alex.morgan@example.com"
  }
}
```

Invalid request (`400 Bad Request`):

```json
{
  "errors": [
    {
      "msg": "Invalid Email",
      "path": "email",
      "location": "body"
    }
  ]
}
```

Unknown email (`404 Not Found`):

```json
{
  "message": "User not found"
}
```

Incorrect password (`401 Unauthorized`):

```json
{
  "message": "Invalid Password"
}
```

> **Implementation note:** The login controller selects the stored password
> hash and returns the user document directly. As currently implemented, the
> response may include that hash; it should be removed from the response before
> exposing this endpoint to clients.

## Get the current user's profile

Returns the authenticated user's profile. Provide the JWT in the
`Authorization` header using the standard scheme-plus-token format shown
below, or store it in the `token` cookie.

### Endpoint

```http
GET /users/profile
Authorization: <Bearer-scheme> <JWT>
```

Alternatively, send the JWT in a `token` cookie. No request body is required.

### Status codes

| Status | Meaning |
| --- | --- |
| `200 OK` | The authenticated user's profile is returned. |
| `401 Unauthorized` | The token is missing or invalid, or the token's user no longer exists. |

### Example response

```json
{
  "_id": "66f123abc4567890def12345",
  "fullName": {
    "firstName": "Alex",
    "lastName": "Morgan"
  },
  "email": "alex.morgan@example.com"
}
```

## Log out a user

Logs out the authenticated user by adding the current token to the token
blacklist and clearing the `token` cookie.

### Endpoint

```http
POST /users/logout
Authorization: <Bearer-scheme> <JWT>
```

Alternatively, send the JWT in a `token` cookie. No request body is required.

### Status codes

| Status | Meaning |
| --- | --- |
| `200 OK` | Logout succeeded; the token cookie is cleared. |
| `401 Unauthorized` | The token is missing or invalid, or the token's user no longer exists. |

### Example response

```json
{
  "message": "Logged out successfully"
}
```

> **Implementation note:** `logoutUser` reads `req.token`, but the current
> authentication middleware does not set that property (it sets `req.user`).
> As a result, token blacklisting may fail until the middleware passes the
> authenticated token to the controller.

## Captain API

### Routes and controller

Captain endpoints are not currently available. The Captain route and controller
files are empty, and the application does not mount a Captain router. Therefore,
there are no Captain URLs, request bodies, or endpoint status codes to document
yet.

### Captain data model

The Captain model describes these fields. These are model requirements, not
the request requirements of an active endpoint:

| Field | Type | Required | Constraints / behavior |
| --- | --- | --- | --- |
| `fullName.firstName` | string | Yes | At least 3 characters |
| `fullName.lastName` | string | Yes | At least 3 characters |
| `email` | string | Yes | Unique, converted to lowercase, and must match an email-like pattern |
| `socketId` | string | No | No additional validation specified |
| `status` | string | No | `active` or `inactive`; defaults to `inactive` |
| `vehicle.color` | string | Yes | At least 3 characters |
| `vehicle.plate` | string | Yes | At least 3 characters |
| `vehicle.model` | string | Yes | At least 3 characters |
| `vehicle.capacity` | number | Yes | Minimum value is 1 |
| `vehicle.vehicleType` | string | Yes | Must be `car`, `bike`, or `van` |
| `location.lat` | number | No | No range validation specified |
| `location.long` | number | No | No range validation specified |

Example document shape based on the model:

```json
{
  "fullName": {
    "firstName": "Alex",
    "lastName": "Morgan"
  },
  "email": "alex.morgan@example.com",
  "status": "inactive",
  "vehicle": {
    "color": "Blue",
    "plate": "ABC123",
    "model": "Sedan",
    "capacity": 4,
    "vehicleType": "car"
  },
  "location": {
    "lat": 37.7749,
    "long": -122.4194
  }
}
```

### Model methods and implementation notes

- `generateAuthTokens()` creates a JWT containing the captain document ID with
  a one-day expiry.
- `comparePassword(password)` is intended to compare a supplied password with
  `this.password` using bcrypt. The current schema does not define a `password`
  field or a password-hashing method, so this method is not usable as written.
- The route and controller files do not define registration, login, profile, or
  logout behavior for captains.
- The model currently has blocking naming/import issues: it imports
  `'/mongoose'` rather than the installed `mongoose` package and registers
  `CaptainSchema` although the schema variable is named `captainSchema`.
- The JWT method currently passes the literal string
  `'process.env.JWT_SECRET'` as its signing secret. It does not read the
  `JWT_SECRET` environment variable as intended.

These implementation issues must be fixed before the documented model methods
can be relied on by Captain endpoints.
