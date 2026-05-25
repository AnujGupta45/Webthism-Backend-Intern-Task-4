const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Restaurant Booking & Menu Management API',
      version: '1.0.0',
      description: 'A complete Node.js/Express.js/MongoDB API for managing restaurant information, menus, user authentication, and table reservations.',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Local development server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token in the format: Bearer <token>',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '60c72b2f9b1d8b22c8y739a1' },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', example: 'john@example.com' },
            role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
          },
        },
        Restaurant: {
          type: 'object',
          required: ['name', 'description', 'address', 'cuisineType', 'openingHours'],
          properties: {
            id: { type: 'string', example: '60c72b2f9b1d8b22c8y739a2' },
            name: { type: 'string', example: 'Bella Italia' },
            description: { type: 'string', example: 'Cozy Italian bistro with authentic wood-fired pizzas.' },
            address: { type: 'string', example: '123 Main St, London' },
            cuisineType: { type: 'string', example: 'Italian' },
            ratings: { type: 'number', minimum: 0, maximum: 5, example: 4.5 },
            openingHours: {
              type: 'object',
              properties: {
                open: { type: 'string', example: '12:00' },
                close: { type: 'string', example: '23:00' },
              },
            },
            image: { type: 'string', example: 'uploads/image-1623671239871.png' },
          },
        },
        MenuItem: {
          type: 'object',
          required: ['itemName', 'price', 'category'],
          properties: {
            id: { type: 'string', example: '60c72b2f9b1d8b22c8y739a3' },
            restaurant: { type: 'string', example: '60c72b2f9b1d8b22c8y739a2' },
            itemName: { type: 'string', example: 'Margherita Pizza' },
            price: { type: 'number', example: 12.99 },
            category: { type: 'string', example: 'Main' },
            availability: { type: 'boolean', example: true },
            description: { type: 'string', example: 'Tomato sauce, fresh mozzarella, and fresh basil.' },
          },
        },
        Booking: {
          type: 'object',
          required: ['restaurant', 'bookingDate', 'timeSlot', 'numberOfGuests'],
          properties: {
            id: { type: 'string', example: '60c72b2f9b1d8b22c8y739a4' },
            user: { type: 'string', example: '60c72b2f9b1d8b22c8y739a1' },
            restaurant: { type: 'string', example: '60c72b2f9b1d8b22c8y739a2' },
            bookingDate: { type: 'string', format: 'date', example: '2026-06-01' },
            timeSlot: { type: 'string', example: '19:30' },
            numberOfGuests: { type: 'number', example: 4 },
            bookingStatus: { type: 'string', enum: ['pending', 'confirmed', 'cancelled'], example: 'confirmed' },
          },
        },
      },
    },
    paths: {
      '/api/auth/signup': {
        post: {
          tags: ['Authentication'],
          summary: 'Register a new user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'password'],
                  properties: {
                    name: { type: 'string', example: 'John Doe' },
                    email: { type: 'string', example: 'john@example.com' },
                    password: { type: 'string', example: 'secret123' },
                    role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: 'User registered successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsIn...' },
                      user: { $ref: '#/components/schemas/User' },
                    },
                  },
                },
              },
            },
            400: { description: 'Bad request (validation error / email taken)' },
          },
        },
      },
      '/api/auth/login': {
        post: {
          tags: ['Authentication'],
          summary: 'Login an existing user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', example: 'john@example.com' },
                    password: { type: 'string', example: 'secret123' },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'User logged in successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsIn...' },
                      user: { $ref: '#/components/schemas/User' },
                    },
                  },
                },
              },
            },
            400: { description: 'Bad request (validation error)' },
            401: { description: 'Invalid credentials' },
          },
        },
      },
      '/api/restaurants': {
        get: {
          tags: ['Restaurants'],
          summary: 'Get all restaurants with search/pagination',
          description: 'Allows sorting, paging, cuisine filters, and ratings searches.',
          parameters: [
            { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search term for name, cuisine, address' },
            { name: 'cuisineType', in: 'query', schema: { type: 'string' }, description: 'Filter by exact cuisine type' },
            { name: 'ratings[gte]', in: 'query', schema: { type: 'number' }, description: 'Filter by minimum ratings' },
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
            { name: 'sort', in: 'query', schema: { type: 'string' }, description: 'Sort criteria (e.g. ratings or -name)' },
          ],
          responses: {
            200: {
              description: 'A paginated list of restaurants',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      count: { type: 'integer', example: 1 },
                      pagination: {
                        type: 'object',
                        properties: {
                          page: { type: 'integer', example: 1 },
                          limit: { type: 'integer', example: 10 },
                          totalPages: { type: 'integer', example: 1 },
                          totalResults: { type: 'integer', example: 1 },
                        },
                      },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Restaurant' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ['Restaurants'],
          summary: 'Create a new restaurant (Admin only)',
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  required: ['name', 'description', 'address', 'cuisineType', 'openingHours'],
                  properties: {
                    name: { type: 'string', example: 'Bella Italia' },
                    description: { type: 'string', example: 'Cozy Italian bistro' },
                    address: { type: 'string', example: '123 Main St, London' },
                    cuisineType: { type: 'string', example: 'Italian' },
                    ratings: { type: 'number', example: 4.5 },
                    openingHours: {
                      type: 'string',
                      description: 'JSON string of opening hours',
                      example: '{"open": "12:00", "close": "23:00"}',
                    },
                    image: {
                      type: 'string',
                      format: 'binary',
                      description: 'Upload restaurant photo (JPEG/JPG/PNG)',
                    },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Restaurant created successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/Restaurant' },
                    },
                  },
                },
              },
            },
            400: { description: 'Bad request / Invalid fields' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden (Not an Admin)' },
          },
        },
      },
      '/api/restaurants/{id}': {
        get: {
          tags: ['Restaurants'],
          summary: 'Get details of a single restaurant, including its menu',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: {
            200: {
              description: 'Restaurant details with menu list populated',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        allOf: [
                          { $ref: '#/components/schemas/Restaurant' },
                          {
                            type: 'object',
                            properties: {
                              menu: {
                                type: 'array',
                                items: { $ref: '#/components/schemas/MenuItem' },
                              },
                            },
                          },
                        ],
                      },
                    },
                  },
                },
              },
            },
            404: { description: 'Restaurant not found' },
          },
        },
        put: {
          tags: ['Restaurants'],
          summary: 'Update restaurant details (Admin only)',
          security: [{ BearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          ],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string', example: 'Bella Italia New Name' },
                    description: { type: 'string', example: 'Cozy Italian bistro with new kitchen.' },
                    address: { type: 'string', example: '123 Main St, London' },
                    cuisineType: { type: 'string', example: 'Italian-French Fusion' },
                    openingHours: {
                      type: 'string',
                      description: 'JSON string of opening hours',
                      example: '{"open": "11:30", "close": "22:30"}',
                    },
                    image: {
                      type: 'string',
                      format: 'binary',
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Restaurant updated successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/Restaurant' },
                    },
                  },
                },
              },
            },
            400: { description: 'Bad request / Invalid fields' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden' },
            404: { description: 'Restaurant not found' },
          },
        },
        delete: {
          tags: ['Restaurants'],
          summary: 'Delete a restaurant (Admin only)',
          description: 'This will cascade delete all associated menu items and bookings.',
          security: [{ BearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: {
            200: {
              description: 'Restaurant deleted successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { type: 'object', example: {} },
                    },
                  },
                },
              },
            },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden' },
            404: { description: 'Restaurant not found' },
          },
        },
      },
      '/api/restaurants/{restaurantId}/menu': {
        get: {
          tags: ['Menus'],
          summary: 'Get menu items for a specific restaurant',
          parameters: [
            { name: 'restaurantId', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: {
            200: {
              description: 'A list of menu items',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      count: { type: 'integer', example: 2 },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/MenuItem' },
                      },
                    },
                  },
                },
              },
            },
            404: { description: 'Restaurant not found' },
          },
        },
        post: {
          tags: ['Menus'],
          summary: 'Add a new menu item to a restaurant (Admin only)',
          security: [{ BearerAuth: [] }],
          parameters: [
            { name: 'restaurantId', in: 'path', required: true, schema: { type: 'string' } },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['itemName', 'price', 'category'],
                  properties: {
                    itemName: { type: 'string', example: 'Garlic Bread' },
                    price: { type: 'number', example: 4.99 },
                    category: { type: 'string', example: 'Starter' },
                    availability: { type: 'boolean', example: true },
                    description: { type: 'string', example: 'Toasted baguette with garlic butter and fresh parsley.' },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Menu item created successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/MenuItem' },
                    },
                  },
                },
              },
            },
            400: { description: 'Bad request (validation error)' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden' },
            404: { description: 'Restaurant not found' },
          },
        },
      },
      '/api/restaurants/{restaurantId}/menu/{itemId}': {
        put: {
          tags: ['Menus'],
          summary: 'Update menu item details (Admin only)',
          security: [{ BearerAuth: [] }],
          parameters: [
            { name: 'restaurantId', in: 'path', required: true, schema: { type: 'string' } },
            { name: 'itemId', in: 'path', required: true, schema: { type: 'string' } },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    itemName: { type: 'string', example: 'Garlic Bread with Cheese' },
                    price: { type: 'number', example: 5.99 },
                    availability: { type: 'boolean', example: true },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Menu item updated successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/MenuItem' },
                    },
                  },
                },
              },
            },
            400: { description: 'Bad request' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden' },
            404: { description: 'Menu item / Restaurant not found' },
          },
        },
        delete: {
          tags: ['Menus'],
          summary: 'Delete a menu item (Admin only)',
          security: [{ BearerAuth: [] }],
          parameters: [
            { name: 'restaurantId', in: 'path', required: true, schema: { type: 'string' } },
            { name: 'itemId', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: {
            200: {
              description: 'Menu item deleted successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { type: 'object', example: {} },
                    },
                  },
                },
              },
            },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden' },
            404: { description: 'Menu item not found' },
          },
        },
      },
      '/api/bookings': {
        get: {
          tags: ['Bookings'],
          summary: 'Get all bookings (Admin only)',
          security: [{ BearerAuth: [] }],
          responses: {
            200: {
              description: 'List of all bookings across all restaurants and users',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      count: { type: 'integer', example: 1 },
                      data: {
                        type: 'array',
                        items: {
                          allOf: [
                            { $ref: '#/components/schemas/Booking' },
                            {
                              type: 'object',
                              properties: {
                                user: {
                                  type: 'object',
                                  properties: {
                                    name: { type: 'string', example: 'John Doe' },
                                    email: { type: 'string', example: 'john@example.com' },
                                  },
                                },
                                restaurant: {
                                  type: 'object',
                                  properties: {
                                    name: { type: 'string', example: 'Bella Italia' },
                                    cuisineType: { type: 'string', example: 'Italian' },
                                  },
                                },
                              },
                            },
                          ],
                        },
                      },
                    },
                  },
                },
              },
            },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden' },
          },
        },
        post: {
          tags: ['Bookings'],
          summary: 'Create a new table booking (Authenticated user)',
          description: 'Verifies booking date (cannot be in the past), slot is within restaurant operating hours, prevents double-booking for the user at the same slot, and verifies restaurant slot capacity.',
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['restaurant', 'bookingDate', 'timeSlot', 'numberOfGuests'],
                  properties: {
                    restaurant: { type: 'string', example: '60c72b2f9b1d8b22c8y739a2' },
                    bookingDate: { type: 'string', format: 'date', example: '2026-06-01' },
                    timeSlot: { type: 'string', example: '19:30' },
                    numberOfGuests: { type: 'integer', example: 4 },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Booking created successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/Booking' },
                    },
                  },
                },
              },
            },
            400: { description: 'Bad request (e.g. past date, outside hours, double booking, capacity exceeded)' },
            401: { description: 'Unauthorized' },
            404: { description: 'Restaurant not found' },
          },
        },
      },
      '/api/bookings/my-bookings': {
        get: {
          tags: ['Bookings'],
          summary: "Get current user's bookings",
          security: [{ BearerAuth: [] }],
          responses: {
            200: {
              description: 'List of reservations for the logged-in user',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      count: { type: 'integer', example: 1 },
                      data: {
                        type: 'array',
                        items: {
                          allOf: [
                            { $ref: '#/components/schemas/Booking' },
                            {
                              type: 'object',
                              properties: {
                                restaurant: {
                                  type: 'object',
                                  properties: {
                                    name: { type: 'string', example: 'Bella Italia' },
                                    address: { type: 'string', example: '123 Main St, London' },
                                    cuisineType: { type: 'string', example: 'Italian' },
                                  },
                                },
                              },
                            },
                          ],
                        },
                      },
                    },
                  },
                },
              },
            },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/api/bookings/{id}/cancel': {
        put: {
          tags: ['Bookings'],
          summary: 'Cancel an existing booking (User who booked or Admin)',
          description: "Marks bookingStatus as 'cancelled'",
          security: [{ BearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: {
            200: {
              description: 'Booking cancelled successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/Booking' },
                    },
                  },
                },
              },
            },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden (Not authorized to cancel this booking)' },
            404: { description: 'Booking not found' },
          },
        },
      },
    },
  },
  apis: [], // We are providing the complete configuration object, so no need to scan route files
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
