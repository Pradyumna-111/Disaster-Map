import mongoose, { Document, Schema } from 'mongoose';

export interface IIncident extends Document {
    type: 'flood' | 'fire' | 'earthquake' | 'storm' | 'other';
    description: string;
    location: {
        type: 'Point';
        coordinates: [number, number]; // [longitude, latitude]
    };
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: 'active' | 'resolved' | 'verified';
    reportedBy: mongoose.Schema.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const IncidentSchema: Schema = new Schema({
    type: {
        type: String,
        required: true,
        enum: ['flood', 'fire', 'earthquake', 'storm', 'other']
    },
    description: { type: String, required: true },
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
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    status: { type: String, enum: ['active', 'resolved', 'verified'], default: 'active' },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

}, { timestamps: true });

IncidentSchema.index({ location: '2dsphere' });

const Incident = mongoose.models.Incident || mongoose.model<IIncident>('Incident', IncidentSchema);

export default Incident;
