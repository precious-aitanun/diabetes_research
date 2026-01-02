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
                <h1>Complete Registration</h1>
                {error ? <div className="error-message">{error}</div> : 
                invitation ? (
                <form onSubmit={handleSignUp}>
                    <p>Welcome! Please complete your profile details to join the NIDPO research network.</p>
                     <div className="form-group">
                        <label>Assigned Email</label>
                        <input type="email" value={invitation.email} disabled />
                    </div>
                    <div className="form-group">
                        <label htmlFor="name">Full Name</label>
                        <input id="name" type="text" placeholder="Dr. John Doe" value={name} onChange={e => setName(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Create Password</label>
                        <input id="password" type="password" placeholder="Minimum 6 characters" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', height: '48px' }} disabled={loading}>
                        {loading ? 'Creating Account...' : 'Complete Account Setup'}
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
                    <p>Ensure your new password is secure and at least 6 characters long.</p>
                    <div className="form-group">
                        <label htmlFor="password">New Password</label>
                        <input id="password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', height: '48px' }} disabled={loading}>
                        {loading ? 'Updating...' : 'Save New Password'}
                    </button>
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
            // Updated parameter name to p_user_id to match corrected SQL function
            const { error: rpcError } = await supabase.rpc('promote_user_to_admin', { p_user_id: data.user.id });
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
        else setMessage('Check your email for the reset link.');
        setLoading(false);
    };

    if (authMode === 'reset') {
        return (
            <div className="auth-container">
                <div className="auth-form">
                    <form onSubmit={handlePasswordReset}>
                        <h1>Reset Password</h1>
                        <p>Enter the email address associated with your research account.</p>
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input id="email" type="email" placeholder="name@hospital.org" value={email} onChange={e => setEmail(e.target.value)} required />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', height: '48px' }} disabled={loading}>
                            {loading ? 'Sending...' : 'Send Reset Instructions'}
                        </button>
                        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                            <button type="button" className="btn btn-outline" onClick={() => setAuthMode('login')} style={{ border: 'none' }}>
                                Back to Login
                            </button>
                        </div>
                    </form>
                    {error && <div className="error-message">{error}</div>}
                    {message && <div style={{ color: 'var(--primary)', backgroundColor: 'var(--primary-light)', padding: '1rem', borderRadius: '8px', marginTop: '1rem', fontSize: '0.85rem', fontWeight: 600 }}>{message}</div>}
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-form">
                <form onSubmit={authMode === 'admin_signup' ? handleAdminSignUp : handleLogin}>
                    <h1>{authMode === 'admin_signup' ? 'Create Admin Account' : 'Researcher Access'}</h1>
                    <p>{authMode === 'admin_signup' ? 'First-time setup for the Lead PI / Administrator.' : 'Secure access for NIDPO study personnel.'}</p>
                    {authMode === 'admin_signup' && (
                        <div className="form-group">
                            <label htmlFor="name">Full Name</label>
                            <input id="name" type="text" placeholder="Lead Researcher Name" value={name} onChange={e => setName(e.target.value)} required />
                        </div>
                    )}
                    <div className="form-group">
                        <label htmlFor="email">Work Email</label>
                        <input id="email" type="email" placeholder="name@hospital.edu.ng" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', height: '48px', marginTop: '1rem' }} disabled={loading}>
                        {loading ? 'Authenticating...' : (authMode === 'admin_signup' ? 'Initialize Admin Account' : 'Secure Login')}
                    </button>
                    {authMode === 'login' && (
                        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                            <button type="button" onClick={() => setAuthMode('reset')} style={{background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none'}}>
                                Trouble signing in?
                            </button>
                        </div>
                    )}
                </form>
                {error && <div className="error-message">{error}</div>}
            </div>
        </div>
    );
}
