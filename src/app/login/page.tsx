"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const router = useRouter();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");

        if (email.toLowerCase() === "adrian@castileusa.com" && (password === "admin" || password === "castile2026")) {
            localStorage.setItem("crm_auth", "true");
            router.push("/admin");
        } else {
            setError("Incorrect email or password.");
        }
    };

    const handleForgotPassword = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email) {
            setError("Please enter your email address first.");
            return;
        }

        // Output to console to show we'd be sending an email here
        console.log(`Mock: Sending password reset email to ${email}`);

        setSuccessMessage(`If an account exists for ${email}, a password reset link has been sent.`);
        setIsForgotPassword(false);
        setPassword("");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 border-0 m-0">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-zinc-200 p-10">
                <div className="text-center mb-10">
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Castile ERP</h1>
                    <p className="text-sm text-zinc-500 mt-2 font-medium">
                        {isForgotPassword ? "Reset your password." : "Please sign in to access the business portal."}
                    </p>
                </div>

                {successMessage && (
                    <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm p-4 rounded-lg font-medium">
                        {successMessage}
                    </div>
                )}

                {isForgotPassword ? (
                    <form onSubmit={handleForgotPassword} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-zinc-900 mb-2">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all text-zinc-900 bg-zinc-50"
                                placeholder="adrian@castileusa.com"
                                required
                            />
                        </div>

                        {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

                        <button
                            type="submit"
                            className="w-full bg-zinc-900 text-white font-semibold py-3.5 rounded-lg hover:bg-zinc-800 transition-colors shadow-sm"
                        >
                            Send Reset Link
                        </button>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsForgotPassword(false);
                                    setError("");
                                }}
                                className="text-sm text-zinc-500 hover:text-zinc-800 font-medium"
                            >
                                &larr; Back to Sign In
                            </button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-zinc-900 mb-2">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all text-zinc-900 bg-zinc-50"
                                placeholder="adrian@castileusa.com"
                                required
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-semibold text-zinc-900">Password</label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsForgotPassword(true);
                                        setError("");
                                        setSuccessMessage("");
                                    }}
                                    className="text-xs font-semibold text-amber-600 hover:text-amber-800"
                                >
                                    Forgot password?
                                </button>
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all text-zinc-900 bg-zinc-50"
                                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                                required
                            />
                        </div>

                        {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

                        <button
                            type="submit"
                            className="w-full bg-zinc-900 text-white font-semibold py-3.5 rounded-lg hover:bg-zinc-800 transition-colors shadow-sm"
                        >
                            Sign In &rarr;
                        </button>
                    </form>
                )}

                {!isForgotPassword && (
                    <div className="mt-8 text-center">
                        <a href="/" className="text-sm text-zinc-400 hover:text-zinc-600 transition-colors">Return to public site</a>
                    </div>
                )}
            </div>
        </div>
    );
}
