// ============================================================
// Express Application Setup
// ============================================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const { errorHandler, notFoundHandler } = require('./middlewares/error.middleware');

// Import routes
const authRoutes = require('./routes/auth.routes');
const contentRoutes = require('./routes/content.routes');
const approvalRoutes = require('./routes/approval.routes');
const broadcastRoutes = require('./routes/broadcast.routes');

const app = express();

// ---- Security Middleware ----
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ---- Body Parsers ----
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ---- Static Files (uploaded content) ----
app.use('/uploads', express.static(path.join(process.cwd(), process.env.UPLOAD_PATH || 'uploads')));

// ---- Swagger API Docs ----
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Content Broadcasting System - API Docs',
  customCss: '.swagger-ui .topbar { display: none }',
  swaggerOptions: {
    persistAuthorization: true,
  },
}));

// ---- Health Check ----
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Content Broadcasting System is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// ---- API Routes ----
app.use('/api/auth', authRoutes);
app.use('/api/content', broadcastRoutes);   // Public broadcast (must be before content routes to match /live/:id first)
app.use('/api/content', approvalRoutes);    // Principal approval actions
app.use('/api/content', contentRoutes);     // Teacher content management

// ---- Error Handling ----
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
