import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipcode: { type: String, required: true }, // ✅ String recommended
  country: { type: String, required: true },
  phone: { type: String, required: true },
  isDefault: { type: Boolean, default: false }
}, {
  timestamps: true
});

const Address = mongoose.model('Address', addressSchema);
export default Address;