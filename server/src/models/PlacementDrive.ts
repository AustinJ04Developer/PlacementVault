import mongoose, { Document, Schema } from 'mongoose';

export interface IPlacementDrive extends Document {
  company: mongoose.Types.ObjectId;
  recruitmentYear: number;
  driveTitle: string;
  jobRoles: string[];
  rounds: string[];
  driveDate?: Date;
  description?: string;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PlacementDriveSchema = new Schema<IPlacementDrive>(
  {
    company: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company reference is required'],
      index: true,
    },
    recruitmentYear: {
      type: Number,
      required: [true, 'Recruitment year is required'],
      min: 2000,
      max: 2100,
    },
    driveTitle: {
      type: String,
      required: [true, 'Drive title is required'],
      trim: true,
      maxlength: 150,
    },
    jobRoles: {
      type: [String],
      default: ['Software Engineer'],
    },
    rounds: {
      type: [String],
      default: ['Online Assessment', 'Technical Interview', 'HR Interview'],
    },
    driveDate: {
      type: Date,
    },
    description: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying drives by company & year
PlacementDriveSchema.index({ company: 1, recruitmentYear: -1 });

export const PlacementDrive = mongoose.model<IPlacementDrive>('PlacementDrive', PlacementDriveSchema);
