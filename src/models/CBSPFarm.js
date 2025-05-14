const mongoose = require('mongoose');

const CBSPFarmSchema = new mongoose.Schema({
  userId:     { type: String, required: true, unique: true },
  castleName: { type: String, required: true },
  coords:     { type: String, required: true },
  joinedAt:   { type: Date,   default: Date.now },
  lastCleaned:{ type: Date },
  pushRequests: [
    {
      building:   String,
      amount:     String,
      status:     { type: String, enum: ['pending','active','completed'], default: 'pending' },
      requestedAt:{ type: Date,   default: Date.now },
      activatedAt:{ type: Date },
      completedAt:{ type: Date }
    }
  ]
});

module.exports = mongoose.model('CBSPFarm', CBSPFarmSchema);