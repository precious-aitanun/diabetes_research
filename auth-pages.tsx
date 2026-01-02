
import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { LoadingSpinner } from './shared-components';
import { Invitation } from './types';

export function InvitationSignUpPage({ token, showNotification, onSignedUp }: { token: string, showNotification: (m: string, t: 'success' | 'error') => void, onSignedUp: () => void }) {
    const [invitation, setInvitation] = useState<Invitation | null>(null);
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchInvitation = async () => {
            const { data, error } = await supabase
                .from('invitations')
                .select('email, role, centerId')
                .eq('token', token)
                .single();

            if (error || !data) {
                setError('This invitation link is invalid or has expired.');
            } else {
                setInvitation(data);
            }
            setLoading(false);
        };
        fetchInvitation();
    }, [token]);

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!invitation) return;

        setLoading(true);
        setError('');

        try {
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                email: invitation.email,
                password: password,
                options: {
                    data: {
                        name: name,
                        role: invitation.role,
                        centerId: invitation.centerId
                    }
                }
            });
            
            if (signUpError) {
                setError(signUpError.message);
                setLoading(false);
                return;
            }

            if (signUpData.user) {
                await supabase.rpc('delete_invitation', { invitation_token: token });
                showNotification('Sign up successful! Please check your email for verification.', 'success');
                onSignedUp();
            }
        } catch (err) {
            setError('An unexpected error occurred.');
            console.error('Sign up error:', err);
        } finally {
            setLoading(false);
        }
    };
    
    if (loading) return <LoadingSpinner />;

    return (
        <div className="auth-container">
            <div className="auth-form">
                <h1>Complete Your Registration</h1>
                {error ? <p className="error-message">{error}</p> : 
                invitation ? (
                <form onSubmit={handleSignUp}>
                    <p>Welcome! Create your account to join the platform.</p>
                     <div className="form-group">
                        <label>Email</label>
                        <input type="email" value={invitation.email} disabled />
                    </div>
                    <div className="form-group">
                        <label htmlFor="name">Full Name</label>
                        <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn" disabled={loading}>
                        {loading ? 'Signing Up...' : 'Sign Up'}
                    </button>
                </form>
                ) : null}
            </div>
        </div>
    );
}

export function ResetPasswordPage({ showNotification }: { showNotification: (msg: string, type: 'success' | 'error') => void }) {
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setIsReady(true);
            } else {
                showNotification('Invalid or expired reset link. Please request a new one.', 'error');
                setTimeout(() => {
                    window.location.hash = '/';
                }, 2000);
            }
        };
        checkSession();
    }, [showNotification]);

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            showNotification('Password must be at least 6 characters', 'error');
            return;
        }
        setLoading(true);
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        setLoading(false);
        if (error) {
            showNotification('Error updating password: ' + error.message, 'error');
        } else {
            showNotification('Password updated successfully!', 'success');
            setTimeout(() => { window.location.hash = '/'; }, 1500);
        }
    };

    if (!isReady) return <LoadingSpinner />;

    return (
        <div className="auth-container">
            <div className="auth-form">
                <form onSubmit={handleUpdatePassword}>
                    <h1>Set New Password</h1>
                    <div className="form-group">
                        <label htmlFor="password">New Password (minimum 6 characters)</label>
                        <input id="password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} />
                    </div>
                    <button type="submit" className="btn" disabled={loading}>{loading ? 'Updating...' : 'Update Password'}</button>
                </form>
            </div>
        </div>
    );
}

export function AuthPage({ hasAdmin, onAdminCreated }: { hasAdmin: boolean, onAdminCreated: () => void }) {
    const [authMode, setAuthMode] = useState<'login' | 'admin_signup' | 'reset'>(hasAdmin ? 'login' : 'admin_signup');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (authMode !== 'reset') setAuthMode(hasAdmin ? 'login' : 'admin_signup');
    }, [hasAdmin]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setError(error.message);
        setLoading(false);
    };

    const handleAdminSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        const { data, error: signUpError } = await supabase.auth.signUp({
            email, password, options: { data: { name, role: 'researcher' } }
        });
        if (signUpError) {
            setError(signUpError.message);
            setLoading(false);
            return;
        }
        if (data.user) {
            const { error: rpcError } = await supabase.rpc('promote_user_to_admin', { user_id: data.user.id });
            if (rpcError) setError(`Failed to set admin role: ${rpcError.message}`);
            else onAdminCreated();
        }
        setLoading(false);
    };

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); setError(''); setMessage('');
        const baseUrl = window.location.origin + window.location.pathname.replace(/\/$/, '');
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${baseUrl}#/reset-password` });
        if (error) setError(error.message);
        else setMessage('Password reset link sent! Check your email.');
        setLoading(false);
    };

    if (authMode === 'reset') {
        return (
            <div className="auth-container">
                <div className="auth-form">
                    <form onSubmit={handlePasswordReset}>
                        <h1>Reset Password</h1>
                        <p>Enter your email to receive a password reset link.</p>
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                        </div>
                        <button type="submit" className="btn" disabled={loading}>{loading ? 'Sending...' : 'Send Reset Link'}</button>
                        <button type="button" className="btn btn-secondary" onClick={() => setAuthMode('login')} style={{marginTop: '0.5rem'}}>Back to Login</button>
                    </form>
                    {error && <p className="error-message">{error}</p>}
                    {message && <p style={{color: 'green', marginTop: '1rem'}}>{message}</p>}
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-form">
                <form onSubmit={authMode === 'admin_signup' ? handleAdminSignUp : handleLogin}>
                    <h1>{authMode === 'admin_signup' ? 'Create Admin Account' : 'Welcome Back'}</h1>
                    <p>{authMode === 'admin_signup' ? 'This is a one-time setup for the first administrator.' : 'Log in to access the research platform.'}</p>
                    {authMode === 'admin_signup' && (
                        <div className="form-group">
                            <label htmlFor="name">Full Name</label>
                            <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} required />
                        </div>
                    )}
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn" disabled={loading}>{loading ? 'Processing...' : (authMode === 'admin_signup' ? 'Create Admin' : 'Log In')}</button>
                    {authMode === 'login' && (
                        <button type="button" onClick={() => setAuthMode('reset')} style={{background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', marginTop: '1rem', textDecoration: 'underline'}}>Forgot Password?</button>
                    )}
                </form>
                {error && <p className="error-message">{error}</p>}
            </div>
        </div>
    );
}
