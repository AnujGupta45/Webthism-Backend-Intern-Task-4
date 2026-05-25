# Restaurant Booking & Menu Management API

A robust, enterprise-grade backend API built with **Node.js, Express.js, MongoDB (Mongoose)**, and secured with **JWT Authentication**. It features restaurant search and pagination, menu management, reservation limits, double-booking prevention, automated testing with Jest and Supertest, and a Swagger OpenAPI documentation panel.

---

## Features Implemented

1. **Authentication System**
   - User Signup and Password Hashing (using `bcryptjs`)
   - User Login and Token Generation (using `jsonwebtoken`)
   - Protected routes and Role-based Access Control (`user` vs `admin`)

2. **Restaurant Management (CRUD)**
   - Add new restaurants (Admin only, supports image upload via `multer`)
   - Retrieve all restaurants (Public, with regex search, filters, pagination, and sorting)
   - View single restaurant details (Public, with virtual populate of the menu list)
   - Update restaurant details (Admin only, handles replacement of uploaded images)
   - Delete restaurants (Admin only, triggers cascade deletion of menu items and bookings)

3. **Menu Management (CRUD)**
   - Add menu items to a restaurant (Admin only)
   - Retrieve menu items for a specific restaurant (Public)
   - Update menu item details (Admin only)
   - Delete menu items (Admin only)

4. **Booking System (Reservations)**
   - Create table booking (User/Admin)
     - Validates date (cannot be in the past)
     - Validates time slot (must fall within operating hours, supports overnight configurations)
     - Prevents duplicate confirmed bookings for the same user, date, and slot
     - Capacity Check: Limits active reservations to 5 bookings per timeslot per restaurant (prevents overflow)
   - Get user-specific bookings (User/Admin)
   - Cancel bookings (User/Admin, verifies owner or administrative privilege)
   - Get all bookings across the platform (Admin only)

5. **Security & Validation**
   - Centralized validation chains using `express-validator`
   - Express rate limiting to prevent brute force attacks
   - Security headers with `helmet`
   - Data sanitization against NoSQL injection via `express-mongo-sanitize`
   - Global, unified error handler returning clear JSON messages for validation, duplicate values, and database errors

6. **Automated Testing**
   - Full integration tests covering Auth, Restaurants, and Bookings using Jest & Supertest
   - Independent test environment using an in-memory MongoDB server (`mongodb-memory-server`)

7. **Documentation**
   - Interactive Swagger API Documentation exposed at `/api-docs`

8. **Deployment & Containerization**
   - Fully containerized environment with `Dockerfile` and `docker-compose.yml`

---

## Folder Structure

```
├── config/
│   ├── db.js                 # MongoDB connection configuration
│   └── swagger.js            # Swagger specifications configuration
├── controllers/
│   ├── authController.js     # User registration and login flow
│   ├── restaurantController.js # Restaurant CRUD, filters, pagination, and uploads
│   ├── menuController.js       # Menu item CRUD operations
│   └── bookingController.js    # Reservations management and validation constraints
├── middleware/
│   ├── auth.js               # JWT verification & role authorization (Admin check)
│   ├── errorHandler.js       # Global error formatting and handling
│   ├── rateLimiter.js        # API rate-limiting setup
│   ├── upload.js             # Multer setup for image storage
│   └── validation.js         # Result handler adapter for express-validator
├── models/
│   ├── User.js               # User Schema (hashing & password comparisons)
│   ├── Restaurant.js         # Restaurant Schema (opening hours & virtual hooks)
│   ├── MenuItem.js           # Menu Item Schema
│   └── Booking.js            # Booking Schema (unique partial index to prevent duplicates)
├── routes/
│   ├── authRoutes.js         # /api/auth paths
│   ├── restaurantRoutes.js   # /api/restaurants paths (incorporates menu subroutes)
│   ├── menuRoutes.js         # /api/restaurants/:restaurantId/menu nested paths
│   └── bookingRoutes.js      # /api/bookings paths
├── tests/
│   ├── setup.js              # Jest global config (boots MongoMemoryServer)
│   ├── auth.test.js          # Authentication endpoint tests
│   ├── restaurant.test.js    # Restaurant CRUD, search, and admin constraint tests
│   └── booking.test.js       # Table reservations, duplicate checks, and capacity tests
├── uploads/                  # Upload folder destination (ignored, contains gitkeep)
├── utils/
│   ├── apiFeatures.js        # Pagination, sort, search, and filtering utility
│   └── validators.js         # Request validation logic chains
├── .env.example              # Sample environment configuration template
├── .gitignore                # Folder/file git exemption sheet
├── Dockerfile                # Image compilation script
├── docker-compose.yml        # Orchestration script (application & MongoDB)
├── package.json              # Script paths and npm requirements
└── server.js                 # Server configurations and mounting point
```

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/en/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/) (local or cloud instance) or [Docker](https://www.docker.com/)

### Environment Variables Setup
Create a `.env` file in the root directory and configure it as shown:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/restaurant_booking
JWT_SECRET=yoursupersecuresecretkey
JWT_EXPIRE=30d
NODE_ENV=development
```

### Local Setup
1. Clone the repository and navigate into the folder:
   ```bash
   cd restaurant-booking-api
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Start the application in development mode (using Nodemon):
   ```bash
   npm run dev
   ```
4. Start the application in production mode:
   ```bash
   npm start
   ```

### Docker Setup
To boot up the application along with a database container:
```bash
docker-compose up --build
```
The server will start listening at `http://localhost:5000`.

---

## Running Tests

We use **Jest** and **Supertest** with an in-memory MongoDB helper (`mongodb-memory-server`) to keep tests completely isolated. You do not need to have MongoDB running to execute the tests.

Run the test suite:
```bash
npm run test
```

---

## API Endpoints List

### 🔑 Authentication System
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Register a new user | Public |
| `POST` | `/api/auth/login` | Login and retrieve JWT token | Public |

### 🍕 Restaurant Management
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/restaurants` | List all restaurants (supports search, sort, paging) | Public |
| `POST` | `/api/restaurants` | Add a new restaurant (supports image upload) | Admin |
| `GET` | `/api/restaurants/:id` | View a single restaurant details (populates menu) | Public |
| `PUT` | `/api/restaurants/:id` | Update restaurant details (supports image replacement) | Admin |
| `DELETE` | `/api/restaurants/:id` | Delete restaurant (cascade deletes menus & bookings) | Admin |

### 📜 Menu Management
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/restaurants/:restaurantId/menu` | List menu items for a restaurant | Public |
| `POST` | `/api/restaurants/:restaurantId/menu` | Add a menu item to a restaurant | Admin |
| `PUT` | `/api/restaurants/:restaurantId/menu/:itemId` | Update menu item details | Admin |
| `DELETE` | `/api/restaurants/:restaurantId/menu/:itemId` | Delete a menu item | Admin |

### 📅 Booking & Reservations
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/bookings` | Book a table (date, slot, and capacity checks applied) | Private |
| `GET` | `/api/bookings/my-bookings` | List active reservations for the logged-in user | Private |
| `PUT` | `/api/bookings/:id/cancel` | Cancel booking (marks status as 'cancelled') | Private |
| `GET` | `/api/bookings` | List all reservations on the system | Admin |

---

## Documentation

### Swagger UI
After starting the server locally, open your web browser and navigate to:
```
http://localhost:5000/api-docs/
```
The Swagger UI contains live request/response schemas and lets you run commands directly.

### Postman Collection
To import the request collection into Postman:
1. Copy the swagger configuration JSON from `http://localhost:5000/api-docs-json` or export it.
2. In Postman, click **Import** and upload/paste the JSON to generate the request list automatically.
