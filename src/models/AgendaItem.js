
const mongoose = require('mongoose');

const agendaSchema = new mongoose.Schema({
  agendaId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  assignedTo: { type: String, required: true },
  createdBy: { type: String, required: true },
  dueDate: { type: Date },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  status: { type: String, enum: ['Open', 'In Progress', 'Done'], default: 'Open' },
  category: { type: String },
  lastUpdated: { type: Date, default: Date.now },
  history: [{
    action: String,
    from: String,
    to: String,
    by: String,
    time: { type: Date, default: Date.now }
  }],
  comments: [{
    by: String,
    comment: String,
    time: { type: Date, default: Date.now }
  }]
});

module.exports = mongoose.model('AgendaItem', agendaSchema);
