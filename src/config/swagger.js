// ============================================================
// Swagger Configuration — Auto-generated API documentation
// ============================================================

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Content Broadcasting System API',
      version: '1.0.0',
      description:
        'A backend API for educational content broadcasting. Teachers upload subject-based content, Principals approve/reject, and approved content is broadcasted via public API with scheduling and rotation.',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['principal', 'teacher'] },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Content: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            title: { type: 'string' },
            description: { type: 'string' },
            subject: { type: 'string' },
            file_url: { type: 'string' },
            file_type: { type: 'string' },
            file_size: { type: 'integer' },
            status: { type: 'string', enum: ['uploaded', 'pending', 'approved', 'rejected'] },
            rejection_reason: { type: 'string', nullable: true },
            start_time: { type: 'string', format: 'date-time', nullable: true },
            end_time: { type: 'string', format: 'date-time', nullable: true },
            rotation_duration: { type: 'integer', description: 'Duration in minutes' },
            uploaded_by: { type: 'integer' },
            approved_by: { type: 'integer', nullable: true },
            approved_at: { type: 'string', format: 'date-time', nullable: true },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object', nullable: true },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errors: { type: 'array', items: { type: 'string' } },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
