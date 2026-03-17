import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const incidentTypes = [
    { value: 'flood', label: 'Flood' },
    { value: 'fire', label: 'Fire' },
    { value: 'earthquake', label: 'Earthquake' },
    { value: 'storm', label: 'Storm' },
    { value: 'other', label: 'Other' },
];

const severityLevels = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
];

interface ReportIncidentModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialLocation?: { lat: number; lng: number; };
}

interface FormState {
    type: string;
    description: string;
    severity: string;
    lat: string;
    lng: string;
}

export default function ReportIncidentModal({ isOpen, onClose, initialLocation }: ReportIncidentModalProps) {
    const [formData, setFormData] = useState<FormState>({
        type: incidentTypes[0].value,
        description: '',
        severity: 'medium',
        lat: initialLocation?.lat?.toString() || '',
        lng: initialLocation?.lng?.toString() || '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setFormData({
                type: incidentTypes[0].value,
                description: '',
                severity: 'medium',
                lat: initialLocation?.lat?.toString() || '',
                lng: initialLocation?.lng?.toString() || '',
            });
            setError('');
        }
    }, [isOpen, initialLocation]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!formData.description || !formData.type) {
            setError('Please fill in all required fields (Type, Description).');
            setLoading(false);
            return;
        }

        if (formData.lat === '' || formData.lng === '') {
            setError('Please pick a physical location on the map.');
            setLoading(false);
            return;
        }

        const numericLat = Number(formData.lat);
        const numericLng = Number(formData.lng);

        const payload = {
            type: formData.type,
            description: formData.description,
            severity: formData.severity,
            lat: numericLat,
            lng: numericLng,
        };

        try {
            const response = await fetch('/api/incidents/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify(payload),
            });

            const data = await response.json().catch(() => ({}));

            if (response.ok) {
                onClose();
            } else {
                setError(data.error || 'Failed to report incident.');
            }
        } catch {
            setError('A network error occurred.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4 border-b pb-2 text-orange-600">Report Emergency Incident</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700">Incident Type</label>
                        <select
                            id="type"
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        >
                            {incidentTypes.map(type => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="severity" className="block text-sm font-medium text-gray-700">Severity</label>
                        <select
                            id="severity"
                            name="severity"
                            value={formData.severity}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        >
                            {severityLevels.map(level => (
                                <option key={level.value} value={level.value}>{level.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description of the Situation</label>
                        <Textarea id="description" name="description" placeholder="Describe what is happening..." value={formData.description} onChange={handleChange} required />
                    </div>

                    <div className="text-xs text-gray-500">
                        Lat: {formData.lat || 'N/A'}, Lng: {formData.lng || 'N/A'}
                    </div>

                    {error && <p className="text-red-600 text-sm">{error}</p>}

                    <div className="flex justify-end space-x-3 pt-2">
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white" disabled={loading}>
                            {loading ? 'Submitting...' : 'Report Incident'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
