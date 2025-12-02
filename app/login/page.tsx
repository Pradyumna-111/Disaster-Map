'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                // SUCCESS: Backend set the HttpOnly cookie. Redirect to the main page.
                router.push('/');
            } else {
                // Handle 401 Unauthorized or other login failures
                const data = await response.json();
                // Display generic message to align with security best practices
                setError(data.error || 'Login failed. Please check your credentials.');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('A network error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl border border-gray-100">

                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-blue-600 mb-2 tracking-tight">DRM Login</h1>
                    <p className="text-gray-500">Access the Disaster Relief Management dashboard.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">

                    {/* Email Input */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                            className="p-3 border border-gray-300 focus:border-blue-500"
                        />
                    </div>

                    {/* Password Input */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            className="p-3 border border-gray-300 focus:border-blue-500"
                        />
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
                        className="w-full py-3 text-lg font-semibold bg-blue-600 hover:bg-blue-700 transition-colors"
                        disabled={loading}
                    >
                        {loading ? 'Logging In...' : 'Log In Securely'}
                    </Button>

                </form>

                <div className="mt-6 text-center text-sm">
                    <Link href="/forgot-password" className="text-blue-600 hover:text-blue-800 transition-colors mr-4">
                        Forgot Password?
                    </Link>
                    <span className="text-gray-400">|</span>
                    <Link href="/register" className="text-blue-600 hover:text-blue-800 transition-colors ml-4">
                        Need an account? Register
                    </Link>
                </div>
            </div>
        </main>
    );
}