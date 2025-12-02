'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            if (response.ok) {
                // SUCCESS: Redirect to login page upon successful creation
                alert("Registration successful! Please log in.");
                router.push('/login');
            } else {
                // Handle 409 Conflict (User exists) or 400 Bad Request
                const data = await response.json();
                setError(data.error || 'Registration failed. Please try again.');
            }
        } catch (err) {
            console.error('Registration error:', err);
            setError('A network error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="w-full max-w-lg bg-white p-8 rounded-xl shadow-2xl border border-gray-100">

                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-blue-600 mb-2 tracking-tight">DRM Register</h1>
                    <p className="text-gray-500">Create an account to contribute resources and report incidents.</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-6">

                    {/* Form Fields: Name, Email, Password, Confirm Password */}
                    {/* ... (Input fields for name, email, password, confirmPassword are omitted for brevity,
                 but should match the previous structure) ... */}

                    {/* Name Input */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <Input id="name" type="text" placeholder="John Doe" required value={name} onChange={(e) => setName(e.target.value)} disabled={loading} className="p-3 border border-gray-300 focus:border-blue-500" />
                    </div>

                    {/* Email Input */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <Input id="email" type="email" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} className="p-3 border border-gray-300 focus:border-blue-500" />
                    </div>

                    {/* Password Input */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <Input id="password" type="password" placeholder="••••••••" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} className="p-3 border border-gray-300 focus:border-blue-500" />
                    </div>

                    {/* Confirm Password Input */}
                    <div>
                        <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                        <Input id="confirm-password" type="password" placeholder="••••••••" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={loading} className="p-3 border border-gray-300 focus:border-blue-500" />
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="text-red-600 text-sm text-center font-medium p-2 bg-red-50 rounded-lg border border-red-200">
                            {error}
                        </div>
                    )}

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        className="w-full py-3 text-lg font-semibold bg-green-600 hover:bg-green-700 transition-colors"
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Register Now'}
                    </Button>

                </form>

                <div className="mt-6 text-center text-sm">
                    <span className="text-gray-500">Already have an account? </span>
                    <Link href="/login" className="text-blue-600 hover:text-blue-800 transition-colors font-medium">
                        Log In here
                    </Link>
                </div>
            </div>
        </main>
    );
}