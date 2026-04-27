// ============================================================
// Models Index — Initialize and associate all models
// ============================================================

const sequelize = require('../config/database');
const User = require('./user.model');
const Content = require('./content.model');
const ContentSlot = require('./contentSlot.model');
const ContentSchedule = require('./contentSchedule.model');

// ---- Associations ----

// User → Content (one-to-many: teacher uploads)
User.hasMany(Content, {
  foreignKey: 'uploaded_by',
  as: 'uploadedContent',
});
Content.belongsTo(User, {
  foreignKey: 'uploaded_by',
  as: 'uploader',
});

// User → Content (one-to-many: principal approvals)
User.hasMany(Content, {
  foreignKey: 'approved_by',
  as: 'approvedContent',
});
Content.belongsTo(User, {
  foreignKey: 'approved_by',
  as: 'approver',
});

// ContentSlot → ContentSchedule (one-to-many)
ContentSlot.hasMany(ContentSchedule, {
  foreignKey: 'slot_id',
  as: 'schedules',
});
ContentSchedule.belongsTo(ContentSlot, {
  foreignKey: 'slot_id',
  as: 'slot',
});

// Content → ContentSchedule (one-to-many)
Content.hasMany(ContentSchedule, {
  foreignKey: 'content_id',
  as: 'schedules',
});
ContentSchedule.belongsTo(Content, {
  foreignKey: 'content_id',
  as: 'content',
});

module.exports = {
  sequelize,
  User,
  Content,
  ContentSlot,
  ContentSchedule,
};
