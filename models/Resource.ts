import mongoose, { Document, Schema } from 'mongoose';

// Define the shape of a single Resource document
export interface IResource extends Document {
    type: 'shelter' | 'food' | 'medical' | 'safe' | 'sos' | 'other';
    name: string;
    address: string;
    description: string;
    location: {
        type: 'Point';
        coordinates: [number, number]; // [longitude, latitude]
    };
    status: 'pending' | 'verified' | 'rejected'; // For moderation
    submittedBy: mongoose.Schema.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const ResourceSchema: Schema = new Schema({
    type: {
        type: String,
        required: true,
        enum: ['shelter', 'food', 'medical', 'safe', 'sos', 'other']
    },
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    description: { type: String, required: false },

    // GeoJSON Point for MongoDB Geospatial Queries
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true,
        },
    },

    status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

}, { timestamps: true });

// Ensure a 2dsphere index for fast geospatial queries
ResourceSchema.index({ location: '2dsphere' });

// Use existing model or create a new one
const Resource = mongoose.models.Resource || mongoose.model<IResource>('Resource', ResourceSchema);

export default Resource;