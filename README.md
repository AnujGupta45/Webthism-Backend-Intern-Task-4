# FeastFlow 🍽️ — Restaurant Booking & Menu Management API

FeastFlow is a modular, secure backend REST API designed for modern dining establishments to manage restaurant profiles, menus, and table reservations. The application acts as a bridge between dining guests looking to book tables and restaurant managers (administrators) organizing daily operations.

I designed and built this backend service as part of the **Webthism Backend Intern Task 4**. The core focus was to build a secure reservation workflow that enforces business rules—such as preventing double bookings and capacity overflows—while preserving clean folder architecture and industry-standard security patterns.

---

## 🚀 Key Features

*   **🔒 Authentication & Role-Based Access Control (RBAC):**
    *   Secure signup and login flows with password hashing via `bcryptjs`.
    *   Stateful route protection using JSON Web Tokens (JWT).
    *   Distinguishes between `user` and `admin` roles, granting administrators exclusive permissions to modify restaurants and menu catalogs.
*   **🍕 Restaurant Catalog Management:**
    *   Full CRUD APIs for managing restaurant details (name, cuisine, hours, rating, and address).
    *   Advanced query support: search by keyword, filter by cuisine type or ratings, sort results, and paginate queries.
    *   Support for restaurant banner photo uploads using `multer`.
*   **📖 Menu Board Management:**
    *   Nested RESTful endpoints under specific restaurant paths (e.g., `/api/restaurants/:restaurantId/menu`).
    *   Enables managers to add, update, list, or delete menu items (with price, categories, and real-time availability toggles).
*   **📅 Table Booking Engine (Smart Constraints):**
    *   **Date Checks:** Restricts reservations from being made on past dates.
    *   **Operational Hours Validation:** Validates that time slots fall within the restaurant's opening and closing hours.
    *   **Double-Booking Protection:** Employs a database-level partial unique index to prevent a user from booking multiple tables at the same slot.
    *   **Capacity Limit Controls:** Automatically caps active reservations to 5 bookings per time slot per restaurant.
*   **🛡️ Production-Grade Security & Sanitization:**
    *   Payload validation with `express-validator` returning clean, readable error logs.
    *   Rate limiting via `express-rate-limit` to guard against DDoS or brute-force requests.
    *   Security headers utilizing `helmet` and NoSQL query sanitization via `express-mongo-sanitize`.
*   **🧪 Automation & Documentation:**
    *   Fully containerized using `Dockerfile` and `docker-compose.yml`.
    *   Complete integration test suite powered by **Jest** and **Supertest** with an in-memory MongoDB environment.
    *   Interactive Swagger OpenAPI documentation served at `/api-docs`.

---

## 🛠️ Technology Stack

*   **Runtime:** Node.js (v18+)
*   **Framework:** Express.js
*   **Database:** MongoDB & Mongoose ODM
*   **Authentication:** JWT (JSON Web Tokens) & BcryptJS
*   **Validation:** Express Validator
*   **File Uploads:** Multer
*   **Security Middlewares:** Helmet, Cors, Express Rate Limit, Mongo Sanitize
*   **Testing Suite:** Jest, Supertest, MongoDB Memory Server
*   **Documentation:** Swagger UI Express & Swagger JSDoc

---

## 📁 Project Architecture

Following MVC design guidelines, the repository is structured as follows:

```text
├── config/
│   ├── db.js                 # MongoDB connection logic
│   └── swagger.js            # Swagger API documentation configuration
├── controllers/
│   ├── authController.js     # User signup and login handlers
│   ├── restaurantController.js # Restaurant profiles management
│   ├── menuController.js       # Menu board items management
│   └── bookingController.js    # Reservation scheduling and validation checks
├── middleware/
│   ├── auth.js               # JWT verification & RBAC authorization
│   ├── errorHandler.js       # Centralized error formatter middleware
│   ├── rateLimiter.js        # API rate limits setup
│   ├── upload.js             # Multer configurations for image uploads
│   └── validation.js         # Result parser for express-validator
├── models/
│   ├── User.js               # User collection model & hashing methods
│   ├── Restaurant.js         # Restaurant collection schema & delete cascades
│   ├── MenuItem.js           # Menu collection schema
│   └── Booking.js            # Reservation collection schema & unique indexes
├── routes/
│   ├── authRoutes.js         # Auth paths (/api/auth)
│   ├── restaurantRoutes.js   # Restaurant paths (/api/restaurants)
│   ├── menuRoutes.js         # Nested menu paths (/api/restaurants/:id/menu)
│   └── bookingRoutes.js      # Booking paths (/api/bookings)
├── tests/
│   ├── setup.js              # Jest configuration and memory-db setup
│   ├── auth.test.js          # Authentication endpoint tests
│   ├── restaurant.test.js    # Restaurant CRUD and parameters tests
│   └── booking.test.js       # Booking engine and capacity checks tests
├── uploads/                  # Temporary image files folder
├── utils/
│   ├── apiFeatures.js        # Search, filtering, pagination, and sorting helper
│   └── validators.js         # express-validator criteria arrays
├── Dockerfile                # Docker build template
├── docker-compose.yml        # Multi-service setup (API + MongoDB)
├── server.js                 # Express application entrypoint
└── README.md                 # Project documentation
```

---

## ⚙️ Environment Variables

Create a `.env` file in the project root:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/feastflow
JWT_SECRET=yoursupersecuresecretkeyhere
JWT_EXPIRE=30d
NODE_ENV=development
```

---

## 🚀 Installation & Local Execution

### Local Development Setup
1. **Clone the repository:**
   ```bash
   git clone https://github.com/AnujGupta45/Webthism-Backend-Intern-Task-4.git
   cd Webthism-Backend-Intern-Task-4
   ```
2. **Install project packages:**
   ```bash
   npm install
   ```
3. **Run database:** Make sure MongoDB is active on your machine.
4. **Boot up in development mode:**
   ```bash
   npm run dev
   ```
   The API will start listening at `http://localhost:5000`.

### Containerized Environment (Docker)
Ensure Docker is installed and running, then compile and start the services:
```bash
docker-compose up --build
```
This automatically boots a local MongoDB container and hooks it with the Express API service.

---

## 🧪 Testing the API

We use **Jest** and **Supertest** for testing. The tests execute inside a localized sandbox utilizing `mongodb-memory-server`—meaning they don't modify your local database, and you do not need MongoDB running to run tests.

Execute the test suites:
```bash
npm run test
```

*All 26 integration tests covering Authentication, Restaurant Profiles, and Reservation limits pass successfully.*

---

## 📊 API Endpoints Reference

### 🔑 Authentication Module
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Registers a new user account | Public |
| `POST` | `/api/auth/login` | Authenticates user & returns JWT | Public |

### 🏨 Restaurant Module
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/restaurants` | List restaurants (supports pagination, search, filter) | Public |
| `POST` | `/api/restaurants` | Add a new restaurant profile (supports image upload) | Admin |
| `GET` | `/api/restaurants/:id` | Get details of a single restaurant + menus | Public |
| `PUT` | `/api/restaurants/:id` | Update restaurant details | Admin |
| `DELETE` | `/api/restaurants/:id` | Delete restaurant (cascade deletes menus & bookings) | Admin |

### 🍔 Menu Module
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/restaurants/:restaurantId/menu` | List menu items for a restaurant | Public |
| `POST` | `/api/restaurants/:restaurantId/menu` | Add a menu item to a restaurant | Admin |
| `PUT` | `/api/restaurants/:restaurantId/menu/:itemId` | Edit menu item specifications | Admin |
| `DELETE` | `/api/restaurants/:restaurantId/menu/:itemId` | Remove menu item from a restaurant | Admin |

### 📅 Booking Module
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/bookings` | Book a dining table (slot & capacity checked) | Private |
| `GET` | `/api/bookings/my-bookings` | List active bookings of the logged-in user | Private |
| `PUT` | `/api/bookings/:id/cancel` | Cancel reservation (marks status as cancelled) | Private |
| `GET` | `/api/bookings` | Retrieve all platform reservations | Admin |

---

## 📚 API Documentation

### Interactive Swagger Docs
Once the local server is running, open your web browser and go to:
```text
http://localhost:5000/api-docs/
```
The Swagger UI is fully interactive—allowing you to authenticate using the `Authorize` (Bearer) lock, structure JSON payloads, and test the endpoints directly from the interface.

---

## 🌐 Production Deployment
The backend service is structured to deploy smoothly on platforms like **Render**, **Railway**, or **Heroku**:
- **Live API Endpoint URL:** `[Your Deployed URL Here]`
- **Documentation Link:** `[Your Deployed URL Here]/api-docs`

*(Ensure that the config variables `MONGODB_URI`, `PORT`, and `JWT_SECRET` are declared inside your cloud provider settings).*

---

## 🎯 Key Learnings & Conclusion

Designing FeastFlow provided several key engineering insights:
1.  **Handling Timezones & Date Queries:** Normalizing date parameters to UTC midnight (`setUTCHours(0,0,0,0)`) was essential. It prevented timezone offsets from shifting dates across database queries, assuring reservation slots matched exactly between tests and database documents.
2.  **Mongoose Query Hooks & Cascades:** Implementing cascading deletes at Mongoose schema-level made data cleanup reliable. Deleting a restaurant automatically clears its bookings and menus, preventing orphaned database files.
3.  **Preventing Concurrency Issues:** Standardizing compound partial indexes helped ensure reservation restrictions were handled at the database level rather than just the application layer, ensuring the booking system remains robust under pressure.

### 🔮 Future Improvements
*   **SMS/Email Notifications:** Incorporate automated booking confirmation and cancellation alerts via Twilio or SendGrid.
*   **Waitlist Queue:** Set up a waitlist queue using Redis for popular time slots that have reached maximum reservation capacity.

---

## 👤 Author

*   **Anuj Gupta**
*   GitHub: [@AnujGupta45](https://github.com/AnujGupta45)
*   Role: Backend Developer Intern (Task Assignment)
