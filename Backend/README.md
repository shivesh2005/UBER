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

The shared authentication middleware sets both `req.user` and `req.token` for
authenticated user requests; the logout controller uses the token to add it to
the shared blacklist.

## Captain API

Captain routes and handlers are defined in the route, controller, middleware,
service, and model files described below. **They are not currently reachable
through the running app:** [app.js](./app.js) mounts only `/users`, not a
Captain router. Also, the Captain route module imports
`../controllers/captain.controller`, while the controller file in the
repository is named `capatain.controllers.js`. Fix the filename/import mismatch
and mount the router before using these endpoints. The paths below describe
the route declarations assuming the router is mounted at `/captains`.

### Captain registration

```http
POST /captains/register
Content-Type: application/json
```

Creates a Captain account, hashes the password through the model's pre-save
hook, sets an authentication cookie, and returns an authentication token and
Captain data without the password.

#### Request body

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `fullName.firstName` | string | Yes | Trimmed, at least 3 characters |
| `fullName.lastName` | string | Yes | Trimmed, at least 3 characters |
| `email` | string | Yes | Valid email; normalized to lowercase and trimmed |
| `password` | string | Yes | At least 6 characters |
| `vehicle.color` | string | Yes | Trimmed, at least 3 characters |
| `vehicle.plate` | string | Yes | Trimmed, at least 3 characters |
| `vehicle.capacity` | integer | Yes | At least 1 |
| `vehicle.model` | string | Yes | Trimmed, at least 3 characters |
| `vehicle.vehicleType` | string | Yes | One of `car`, `bike`, `van` |

Example:

```json
{
  "fullName": {
    "firstName": "Alex",
    "lastName": "Morgan"
  },
  "email": "alex.morgan@example.com",
  "password": "secure123",
  "vehicle": {
    "color": "Blue",
    "plate": "ABC123",
    "capacity": 4,
    "model": "Sedan",
    "vehicleType": "car"
  }
}
```

#### Responses

| Status | Meaning |
| --- | --- |
| `201 Created` | Captain was created; response includes `message`, `token`, and `captain`. Also sets the `token` cookie. |
| `400 Bad Request` | One or more request fields failed route validation; response contains an `errors` array. |
| `409 Conflict` | Email is already registered. |

Example success response:

```json
{
  "message": "Captain registered successfully",
  "token": "<authentication-token>",
  "captain": {
    "_id": "66f123abc4567890def12345",
    "fullName": {
      "firstName": "Alex",
      "lastName": "Morgan"
    },
    "email": "alex.morgan@example.com",
    "status": "inactive",
    "vehicle": {
      "color": "Blue",
      "plate": "ABC123",
      "capacity": 4,
      "model": "Sedan",
      "vehicleType": "car"
    }
  }
}
```

### Captain login

```http
POST /captains/login
Content-Type: application/json
```

Authenticates by email and password. Email is lowercased and trimmed for the
lookup. A successful login sets the `token` cookie and returns the token and
Captain data without the password.

#### Request body

| Field | Type | Required | Validation |
| --- | --- | --- | --- |
| `email` | string | Yes | Must be a valid email |
| `password` | string | Yes | Must not be empty |

Example:

```json
{
  "email": "alex.morgan@example.com",
  "password": "secure123"
}
```

#### Responses

| Status | Meaning |
| --- | --- |
| `200 OK` | Login succeeded; response includes `message`, `token`, and `captain`; sets the `token` cookie. |
| `400 Bad Request` | Email or password validation failed; response contains an `errors` array. |
| `401 Unauthorized` | Email was not found or password did not match. |

Example invalid-credentials response:

```json
{
  "message": "Invalid email or password"
}
```

### Get Captain profile

```http
GET /captains/profile
Authorization: Bearer <JWT>
```

The JWT may alternatively be supplied in the `token` cookie. No request body
is required. Authentication validates the JWT, rejects blacklisted tokens, and
loads the Captain document.

| Status | Meaning |
| --- | --- |
| `200 OK` | Response contains the authenticated Captain as `captain`, excluding the password. |
| `401 Unauthorized` | Token is missing, invalid, expired, blacklisted, or does not identify an existing Captain. |
| `404 Not Found` | The profile handler could not find the Captain. |

Example response:

```json
{
  "captain": {
    "_id": "66f123abc4567890def12345",
    "fullName": {
      "firstName": "Alex",
      "lastName": "Morgan"
    },
    "email": "alex.morgan@example.com",
    "status": "inactive",
    "vehicle": {
      "color": "Blue",
      "plate": "ABC123",
      "capacity": 4,
      "model": "Sedan",
      "vehicleType": "car"
    }
  }
}
```

### Captain logout

```http
POST /captains/logout
Authorization: Bearer <JWT>
```

The JWT may alternatively be supplied in the `token` cookie. No request body
is required. Logout adds the token to the blacklist and clears the `token`
cookie.

| Status | Meaning |
| --- | --- |
| `200 OK` | Logout succeeded; response is `{"message":"Captain logged out successfully"}`. |
| `401 Unauthorized` | Token is missing, invalid, expired, blacklisted, or does not identify an existing Captain. |

### Authentication and cookies

- Captain registration and login issue a JWT signed with the `JWT_SECRET`
  environment variable, with a one-day expiry.
- Successful registration and login set an HTTP-only `token` cookie with
  `SameSite=Lax` and a 24-hour max age. The cookie's `Secure` flag is enabled
  when `NODE_ENV=production`. The token is also returned in the JSON body.
- Protected endpoints accept `Authorization: Bearer <JWT>` or the `token`
  cookie. If both are provided, the Bearer token takes precedence.
- Missing, invalid, expired, or blacklisted tokens are rejected with `401`.
- `JWT_SECRET` must be configured in the environment for signing and
  verification.

### Captain model and service

The `captain.service.js` service creates a Captain document from `fullName`,
`email`, `password`, and `vehicle`. It requires all four values, persists only
the named fields, and normalizes email by trimming and lowercasing it.

The Mongoose Captain model defines:

| Field | Type | Required | Constraints / defaults |
| --- | --- | --- | --- |
| `fullName.firstName` | string | Yes | At least 3 characters |
| `fullName.lastName` | string | Yes | At least 3 characters |
| `email` | string | Yes | Unique, lowercase, trimmed, and validated as an email |
| `password` | string | Yes | Not selected in queries by default; hashed with bcrypt before saving |
| `socketId` | string | No | Defaults to `null` |
| `status` | string | No | `active` or `inactive`; defaults to `inactive` |
| `vehicle.color` | string | Yes | At least 3 characters |
| `vehicle.plate` | string | Yes | At least 3 characters |
| `vehicle.model` | string | Yes | At least 3 characters |
| `vehicle.capacity` | number | Yes | Minimum 1 |
| `vehicle.vehicleType` | string | Yes | `car`, `bike`, or `van` |
| `location.lat` | number | No | No range validation |
| `location.long` | number | No | No range validation |
| `createdAt`, `updatedAt` | date | Generated | Added by Mongoose timestamps |

The model provides `hashPassword(password)`, `comparePassword(password)`, and
`generateAuthToken()` methods. Generated JWTs contain the Captain document ID
and expire after one day.

### Token blacklist

The shared `BlackListToken` model stores a unique required token and a
`createdAt` timestamp. MongoDB TTL expiration removes blacklist entries after
24 hours, matching the JWT lifetime. Both user and Captain auth middleware
reject tokens found in this collection.

### Source-file responsibilities

| File | Responsibility |
| --- | --- |
| `routes/capatain.routes.js` | Declares registration, login, protected profile, and protected logout routes, including request validators. |
| `controllers/capatain.controllers.js` | Implements registration, login, profile, and logout responses and cookie handling. |
| `middlewares/auth.middleware.js` | Extracts Bearer/cookie tokens, verifies JWT and blacklist status, loads the user/Captain, and attaches identity and token to the request. |
| `service/captain.service.js` | Validates required registration groups and creates normalized Captain records. |
| `models/captain.model.js` | Defines Captain data constraints, password hashing/comparison, and JWT generation. |
| `models/blackListToken.model.js` | Stores revoked tokens and expires them after 24 hours. |

> **Error handling note:** Controller errors are passed to Express with
> `next(error)`. Their final status and response body depend on the app's error
> handling middleware; no custom error handler is defined in the current app.
