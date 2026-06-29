"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!token) {
            setError("Invalid reset link. Please request a new password reset.");
            return;
        }
        
        if (password.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });

            const data = await res.json();

            if (data.success) {
                setSuccessMessage("Your password has been successfully reset! You can now log in.");
                setTimeout(() => {
                    router.push('/login');
                }, 3000);
            } else {
                setError(data.error || "Failed to reset password. The link may have expired.");
            }
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (successMessage) {
        return (
            <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h1 className="text-xl font-bold text-zinc-900 mb-2">Password Reset Successful</h1>
                <p className="text-zinc-500 mb-6">{successMessage}</p>
                <Link href="/login" className="block w-full bg-zinc-900 text-white font-bold py-3 px-4 rounded-lg hover:bg-zinc-800 transition-colors">
                    Go to Login
                </Link>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8 text-center">
                <h1 className="text-2xl font-black tracking-tight text-zinc-900">Choose a new password</h1>
                <p className="text-sm text-zinc-500 mt-2">Make sure it's at least 8 characters long.</p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-medium rounded-lg">
                    {error}
                </div>
            )}

            <form onSubmit={handleReset} className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-zinc-700 mb-2">New Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-3 outline-none"
                        placeholder="••••••••"
                        required
                        disabled={isLoading}
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-zinc-700 mb-2">Confirm Password</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-3 outline-none"
                        placeholder="••••••••"
                        required
                        disabled={isLoading}
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-amber-500 text-amber-950 font-bold py-3 px-4 rounded-lg hover:bg-amber-400 focus:ring-4 focus:ring-amber-200 transition-colors flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.2)] disabled:opacity-70"
                >
                    {isLoading ? "Resetting..." : "Reset Password"}
                </button>
            </form>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 p-4 font-sans relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-amber-200/20 blur-[100px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-orange-200/20 blur-[100px]"></div>
            </div>

            <div className="w-full max-w-[400px] z-10">
                <div className="mb-8 flex justify-center">
                    <div className="h-10 w-auto text-amber-500 flex items-center gap-2">
                        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
                        <span className="text-2xl font-black tracking-tighter text-zinc-900">Castile</span>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-xl border border-zinc-100">
                    <Suspense fallback={<div className="text-center text-zinc-500 py-8">Loading...</div>}>
                        <ResetPasswordForm />
                    </Suspense>
                </div>
                
                <div className="mt-8 text-center text-sm text-zinc-500">
                    Secure Admin Portal &copy; {new Date().getFullYear()} Castile USA
                </div>
            </div>
        </div>
    );
}
