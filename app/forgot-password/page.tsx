'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleResetRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        // --- API Call to Next.js Endpoint ---
        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('If an account with that email exists, a password reset link has been sent.');
            } else {
                // We typically return a generic success message even for non-existent emails
                // for security reasons, but here we show an API error if non-200.
                setError(data.error || 'Failed to send reset email. Please try again.');
            }
        } catch (err) {
            setError('An unexpected error occurred. Check your network.');
        } finally {
            setLoading(false);
        }
        // ------------------------------------
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl border border-gray-100">

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold text-red-500 mb-2 tracking-tight">
                        Forgot Password?
                    </h1>
                    <p className="text-gray-500">
                        Enter your email to receive a password reset link.
                    </p>
                </div>

                <form onSubmit={handleResetRequest} className="space-y-6">

                    {/* Email Input */}
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Email Address
                        </label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                            className="p-3 border border-gray-300 focus:border-red-500"
                        />
                    </div>

                    {/* Messages */}
                    {error && (
                        <div className="text-red-600 text-sm text-center font-medium p-2 bg-red-50 rounded-lg border border-red-200">
                            {error}
                        </div>
                    )}
                    {message && (
                        <div className="text-green-600 text-sm text-center font-medium p-2 bg-green-50 rounded-lg border border-green-200">
                            {message}
                        </div>
                    )}


                    {/* Submit Button */}
                    <Button
                        type="submit"
                        className="w-full py-3 text-lg font-semibold bg-red-500 hover:bg-red-600 transition-colors"
                        disabled={loading}
                    >
                        {loading ? 'Sending Request...' : 'Send Reset Link'}
                    </Button>

                </form>

                <div className="mt-6 text-center text-sm">
                    <Link href="/login" className="text-blue-600 hover:text-blue-800 transition-colors font-medium">
                        Remembered your password? Log In
                    </Link>
                </div>
            </div>
        </main>
    );
}