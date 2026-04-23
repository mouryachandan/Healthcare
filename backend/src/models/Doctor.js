import mongoose from 'mongoose';

const daySlotSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    times: [{ type: String, required: true }],
  },
  { _id: false }
);

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    specialization: { type: String, required: true, trim: true },
    experience: { type: Number, default: 0 },
    fees: { type: Number, default: 0 },
    bio: { type: String, default: '' },
    hospital: { type: String, default: '' },
    isVerified: { type: Boolean, default: false },
    city: { type: String, default: '' },
    latitude: { type: Number },
    longitude: { type: Number },
    availability: [daySlotSchema],
  },
  { timestamps: true }
);

doctorSchema.index({ specialization: 1, isVerified: 1 });
doctorSchema.index({ city: 1 });

export const Doctor = mongoose.model('Doctor', doctorSchema);
