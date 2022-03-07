import mongoose from 'mongoose'
import db from '../../connections/dbConnection.js'

const paymentReceiptSchema = new mongoose.Schema({
  _user: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
  paymentIntentId: { type: String, required: true },
  amount: { type: Number, required: true }, // In standard currency denomination.
  currency: { type: String, required: true },
  received: Boolean,
  paymentMethodType: String,
  walletAddress: { type: String, required: true },

  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: { type: Date },
})

const paymentReceipt = db.model('PaymentReceipt', paymentReceiptSchema)

export default paymentReceipt
