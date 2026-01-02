import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { supabase } from './supabaseClient';
import type { User, AuthSession } from '@supabase/supabase-js';

import { 
  UserProfile, 
  NotificationType, 
  Patient, 
  ViewState 
} from './types';

import { 
  LoadingSpinner, 
  Notification, 
  Sidebar, 
  Header 
} from './shared-components';

import { 
  InvitationSignUpPage, 
  ResetPasswordPage, 
  AuthPage 
} from './auth-pages';

import { 
  PatientsPage, 
  DraftsPage, 
  AddPatientPage 
} from './patient-management';

import { 
  UsersPage, 
  CentersPage 
} from './admin-pages';

// --- MODERN LANDING PAGE ---
const LandingPage = ({ onLoginClick, isLoggedIn }: { onLoginClick: () => void, isLoggedIn: boolean }) => {
    return (
        <div className="landing-wrapper">
            <nav className="landing-nav">
                <div className="logo-text">NIDPO</div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn btn-primary" onClick={onLoginClick}>
                        {isLoggedIn ? 'Go to Dashboard' : 'Researcher Portal'}
                    </button>
                </div>
            </nav>

            <header className="hero-section">
                <h1 className="hero-title">Precision Outcomes for <br/>Metabolic Research</h1>
                <p className="hero-subtitle">
                    The Nigeria Inpatient Diabetes Presence & Outcomes (NIDPO) study standardizes diabetes care metrics across Nigeria's tertiary hospitals through a unified registry.
                </p>
                <div className="cta-group" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button className="btn btn-primary" onClick={onLoginClick}>Launch Portal</button>
                    <a href="#pi" className="btn btn-outline">Meet the Lead PI</a>
                </div>
            </header>

            <section id="about" className="section-container">
                <div className="grid-3">
                    <div className="feature-card">
                        <h3>Standardized Data</h3>
                        <p>Consistency across demographics, biochemical markers, and treatment outcomes for multicenter clinical research.</p>
                    </div>
                    <div className="feature-card">
                        <h3>Real-time Tracking</h3>
                        <p>Synchronize findings across Nigeria's tertiary hospitals instantly through our secure cloud infrastructure.</p>
                    </div>
                    <div className="feature-card">
                        <h3>Secure Registry</h3>
                        <p>Enterprise-grade encryption protecting patient anonymity while enabling longitudinal metabolic studies.</p>
                    </div>
                </div>
            </section>

            <section id="pi" className="section-container pi-section">
                <div className="pi-card">
                    <div className="pi-header">
                        <div className="pi-avatar">
                            <span>🔬</span>
                        </div>
                        <div className="pi-info">
                            <span className="badge">Principal Investigator</span>
                            <h2>Dr. Orebowale Oreboka Olugbemide</h2>
                            <p className="pi-title">Consultant Endocrinologist at ISTH</p>
                        </div>
                    </div>
                    <div className="pi-body">
                        <p>
                            Dr. Olugbemide leads the Nigeria Inpatient Diabetes Presence & Outcomes (NIDPO) research network. 
                            He is a Consultant Physician/Endocrinologist at Irrua Specialist Teaching Hospital (ISTH), 
                            dedicated to optimizing glycemic control outcomes through standardized multicenter analytics.
                        </p>
                    </div>
                    <div className="pi-footer">
                        <a href="mailto:oreboka@gmail.com" className="pi-contact-btn">
                           <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                           </svg>
                           <span>Contact PI Office</span>
                        </a>
                        <div className="pi-stats">
                            <div className="stat">
                                <span className="val">ISTH</span>
                                <span className="lbl">Host Site</span>
                            </div>
                            <div className="stat">
                                <span className="val">14+</span>
                                <span className="lbl">Research Centers</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <footer style={{ padding: '5rem 5%', borderTop: '1px solid var(--border)', textAlign: 'center', background: '#fafafa' }}>
                <p style={{ color: 'var(--text-muted)' }}>
                    © 2024 NIDPO Platform. Irrua Specialist Teaching Hospital Research Unit. Edo State, Nigeria.
                </p>
            </footer>
        </div>
    );
};

// --- PRIVATE DASHBOARD ---
const DashboardPage = ({ stats }: { stats: any }) => (
    <div>
        <div style={{ marginBottom: '3rem' }}>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 900 }}>Research Overview</h1>
            <p style={{ color: 'var(--text-muted)' }}>Global summary of clinical registry metrics across the multicenter network.</p>
        </div>
        <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <div style={{ background: 'white', padding: '2.5rem', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1rem' }}>Total Patients Finalized</div>
                <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--primary)' }}>{stats.patients}</div>
            </div>
            <div style={{ background: 'white', padding: '2.5rem', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1rem' }}>Verified Centers</div>
                <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--primary)' }}>{stats.centers}</div>
            </div>
            <div style={{ background: 'white', padding: '2.5rem', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1rem' }}>Research Staff</div>
                <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--primary)' }}>{stats.users}</div>
            </div>
        </div>
    </div>
);

function App() {
    const [session, setSession] = useState<AuthSession | null>(null);
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [showAuthOverlay, setShowAuthOverlay] = useState(false);
    const [currentPage, setCurrentPage] = useState<string>('dashboard');
    const [stats, setStats] = useState({ patients: 0, users: 0, centers: 0 });
    const [notifications, setNotifications] = useState<NotificationType[]>([]);
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [hasAdmin, setHasAdmin] = useState(true);
    const [isAdminCheckInProgress, setIsAdminCheckInProgress] = useState(false);
    
    const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
    const [editingDraft, setEditingDraft] = useState<any | null>(null);

    const showNotification = useCallback((message: string, type: 'success' | 'error') => {
        setNotifications(prev => [...prev, { id: Date.now(), message, type }]);
    }, []);

    const checkAdminExists = useCallback(async () => {
        setIsAdminCheckInProgress(true);
        try {
            // Using RPC to bypass RLS for initial public check
            const { data, error } = await supabase.rpc('has_admin_user');
            
            if (error) {
                console.warn("Admin check RPC failed, trying head query fallback:", error.message || "Unknown error");
                // Fallback head query
                const { data: directData, error: directError } = await supabase
                    .from('profiles')
                    .select('id', { count: 'exact', head: true })
                    .eq('role', 'admin');
                
                if (directError) {
                   console.error("Direct admin check failed:", directError.message || directError);
                   setHasAdmin(true); // Default to true if database is unreachable or strict
                } else {
                   setHasAdmin(!!directData && directData.length > 0);
                }
            } else {
                setHasAdmin(data === true);
            }
        } catch (err: any) {
            console.error("Critical admin check error:", err.message || "Unknown error");
            setHasAdmin(true);
        } finally {
            setIsAdminCheckInProgress(false);
        }
    }, []);

    const fetchProfileAndStats = useCallback(async (user: User) => {
        try {
            const { data: profile } = await supabase.from('profiles').select('*, centers(name)').eq('id', user.id).single();
            if (profile) setCurrentUser(profile as UserProfile);
            
            const [p, u, c] = await Promise.all([
                supabase.from('patients').select('id', { count: 'exact', head: true }),
                supabase.from('profiles').select('id', { count: 'exact', head: true }),
                supabase.from('centers').select('id', { count: 'exact', head: true }),
            ]);
            setStats({ patients: p.count || 0, users: u.count || 0, centers: c.count || 0 });
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                setSession(session);
                fetchProfileAndStats(session.user);
            } else {
                // If no session, don't wait for admin check to show landing page
                setLoading(false);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setSession(session);
            if (session) {
                fetchProfileAndStats(session.user);
                setShowAuthOverlay(false);
            } else {
                setCurrentUser(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, [fetchProfileAndStats]);

    const handlePatientAdded = () => {
        setEditingPatient(null);
        setEditingDraft(null);
        setCurrentPage('patients');
    };

    const handleNavigate = (page: string) => {
        setEditingPatient(null);
        setEditingDraft(null);
        setCurrentPage(page);
    };

    const handleLaunchPortal = async () => {
        if (session) {
            setCurrentPage('dashboard');
        } else {
            // Check if admin exists only when modal is requested
            setShowAuthOverlay(true);
            await checkAdminExists();
        }
    };

    const renderMainContent = () => {
        if (!currentUser) return null;
        switch (currentPage) {
            case 'dashboard': return <DashboardPage stats={stats} />;
            case 'patients': return <PatientsPage currentUser={currentUser} showNotification={showNotification} onEditPatient={(p: Patient) => { setEditingPatient(p); setEditingDraft(null); setCurrentPage('add_patient'); }} />;
            case 'add_patient': return <AddPatientPage showNotification={showNotification} onPatientAdded={handlePatientAdded} currentUser={currentUser} editingPatient={editingPatient} editingDraft={editingDraft} />;
            case 'drafts': return <DraftsPage currentUser={currentUser} showNotification={showNotification} onEditDraft={(d: any) => { setEditingDraft(d); setEditingPatient(null); setCurrentPage('add_patient'); }} />;
            case 'users': return <UsersPage showNotification={showNotification} />;
            case 'centers': return <CentersPage showNotification={showNotification} />;
            default: return <DashboardPage stats={stats} />;
        }
    };

    const hashParts = window.location.hash.split('?');
    const urlParams = new URLSearchParams(hashParts.length > 1 ? hashParts[1] : '');
    const token = urlParams.get('token');

    if (loading) return <LoadingSpinner />;

    if (token) return <InvitationSignUpPage token={token} showNotification={showNotification} onSignedUp={() => window.location.hash = '/'} />;

    if (!session || !currentUser) {
        return (
            <>
                <LandingPage onLoginClick={handleLaunchPortal} isLoggedIn={!!session} />
                {showAuthOverlay && (
                    <div className="auth-overlay" onClick={() => setShowAuthOverlay(false)}>
                        <div className="auth-card" onClick={e => e.stopPropagation()}>
                            <button className="auth-close" onClick={() => setShowAuthOverlay(false)}>&times;</button>
                            {isAdminCheckInProgress ? (
                                <div style={{ textAlign: 'center', padding: '2rem' }}>
                                    <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontWeight: 600 }}>Syncing with Registry Cloud...</p>
                                    <div className="spinner-small" style={{ margin: '0 auto', width: '30px', height: '30px', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                                </div>
                            ) : (
                                <AuthPage hasAdmin={hasAdmin} onAdminCreated={() => {
                                    showNotification('Lead Admin account created. Please verify your email.', 'success');
                                    checkAdminExists();
                                }} />
                            )}
                        </div>
                    </div>
                )}
                {notifications.map(n => <Notification key={n.id} {...n} onClose={() => setNotifications(p => p.filter(i => i.id !== n.id))} />)}
                <style>{`
                    @keyframes spin { to { transform: rotate(360deg); } }
                `}</style>
            </>
        );
    }

    return (
        <div className="app-layout">
            <Sidebar currentPage={currentPage} userRole={currentUser.role} isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} onNavigate={handleNavigate} />
            <main className="main-content">
                <Header currentUser={currentUser} onLogout={() => supabase.auth.signOut()} onMenuClick={() => setSidebarOpen(!isSidebarOpen)} />
                <div className="page-content">{renderMainContent()}</div>
            </main>
            {notifications.map(n => <Notification key={n.id} {...n} onClose={() => setNotifications(p => p.filter(i => i.id !== n.id))} />)}
        </div>
    );
}

const rootElement = document.getElementById('root');
if (rootElement) {
    ReactDOM.createRoot(rootElement).render(<React.StrictMode><App /></React.StrictMode>);
}
