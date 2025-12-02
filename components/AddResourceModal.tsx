import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const resourceTypes = [
    { value: 'shelter', label: 'Shelter' },
    { value: 'food', label: 'Food Center' },
    { value: 'medical', label: 'Medical Post' },
    { value: 'safe', label: 'Safe Zone' },
];

interface AddResourceModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialLocation?: { lat: number; lng: number; };
}

interface FormState {
    type: string;
    name: string;
    address: string;
    description: string;
    lat: string; // keep as string in the form
    lng: string;
}

export default function AddResourceModal({ isOpen, onClose, initialLocation }: AddResourceModalProps) {
    const [formData, setFormData] = useState<FormState>({
        type: resourceTypes[0].value,
        name: '',
        address: '',
        description: '',
        lat: initialLocation?.lat?.toString() || '',
        lng: initialLocation?.lng?.toString() || '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Sync initialLocation when it changes and reset when modal opens
    useEffect(() => {
        if (isOpen) {
            setFormData({
                type: resourceTypes[0].value,
                name: '',
                address: '',
                description: '',
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

    // TypeScript
// Updated handleSubmit: include credentials so the auth cookie is sent with the POST.
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!formData.name || !formData.address || !formData.type) {
            setError('Please fill in all required fields (Name, Address, Type).');
            setLoading(false);
            return;
        }

        if (formData.lat === '' || formData.lng === '') {
            setError('Please pick a physical location on the map (latitude and longitude).');
            setLoading(false);
            return;
        }

        const numericLat = Number(formData.lat);
        const numericLng = Number(formData.lng);

        if (Number.isNaN(numericLat) || Number.isNaN(numericLng)) {
            setError('Latitude or longitude is not a valid number.');
            setLoading(false);
            return;
        }

        if (numericLat < -90 || numericLat > 90 || numericLng < -180 || numericLng > 180) {
            setError('Latitude or longitude out of valid range.');
            setLoading(false);
            return;
        }

        const payload = {
            type: formData.type,
            name: formData.name,
            address: formData.address,
            description: formData.description,
            lat: numericLat,
            lng: numericLng,
        };

        try {
            const response = await fetch('/api/resources/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin', // <- important: send cookies for same-origin
                // use 'include' instead if your frontend and API are on different origins
                body: JSON.stringify(payload),
            });

            const data = await response.json().catch(() => ({}));

            if (response.ok) {
                setFormData({
                    type: resourceTypes[0].value,
                    name: '',
                    address: '',
                    description: '',
                    lat: '',
                    lng: '',
                });
                onClose();
            } else {
                setError(data.error || 'Failed to submit resource.');
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
                <h2 className="text-2xl font-bold mb-4 border-b pb-2 text-teal-600">Add New Resource Pin</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700">Resource Type</label>
                        <select
                            id="type"
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        >
                            {resourceTypes.map(type => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name / Title</label>
                        <Input id="name" name="name" type="text" placeholder="e.g., St. John's Shelter" value={formData.name} onChange={handleChange} required />
                    </div>

                    <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address (Physical Location)</label>
                        <Input id="address" name="address" type="text" placeholder="Street, City, Pin Code" value={formData.address} onChange={handleChange} required />
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description / Capacity</label>
                        <Textarea id="description" name="description" placeholder="Max capacity, current needs, contact info." value={formData.description} onChange={handleChange} />
                    </div>

                    <div className="text-xs text-gray-500">
                        Lat: {formData.lat || 'N/A'}, Lng: {formData.lng || 'N/A'}
                    </div>

                    {error && <p className="text-red-600 text-sm">{error}</p>}

                    <div className="flex justify-end space-x-3 pt-2">
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-teal-600 hover:bg-teal-700" disabled={loading}>
                            {loading ? 'Submitting...' : 'Submit Resource'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}