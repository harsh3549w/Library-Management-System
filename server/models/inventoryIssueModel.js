import mongoose from 'mongoose'

const InventoryIssueSchema = new mongoose.Schema({
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true, index: true },
  status: { type: String, enum: ['missing', 'stolen'], required: true, index: true },
  note: { type: String, default: '' },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  reportedAt: { type: Date, default: Date.now },
  resolved: { type: Boolean, default: false, index: true },
  resolvedAt: { type: Date },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })

export default mongoose.model('InventoryIssue', InventoryIssueSchema)
