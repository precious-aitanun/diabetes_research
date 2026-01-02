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

            <section id="pi" className="section-container pi-section" style={{ background: 'var(--secondary)', color: 'white', display: 'flex', gap: '4rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div className="pi-image-placeholder" style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '3rem' }}>🔬</span>
                </div>
                <div className="pi-content" style={{ flex: 1, minWidth: '300px' }}>
                    <span className="pi-badge" style={{ background: 'var(--primary)', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, marginBottom: '1rem', display: 'inline-block' }}>Principal Investigator</span>
                    <h2>Dr. Orebowale Oreboka Olugbemide</h2>
                    <p style={{ fontSize: '1.1rem', marginBottom: '2rem', opacity: 0.85, maxWidth: '600px' }}>
                        Consultant Endocrinologist at Irrua Specialist Teaching Hospital (ISTH). 
                        Leading the digital transformation of diabetes research in West Africa through standardized registries.
                    </p>
                    <div style={{ display: 'flex', gap: '3rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2.5rem' }}>
                        <div>
                            <div style={{ fontSize: '1.75rem', fontWeight: 900 }}>ISTH</div>
                            <div style={{ opacity: 0.6, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Lead Hospital</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '1.75rem', fontWeight: 900 }}>14+</div>
                            <div style={{ opacity: 0.6, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Research Sites</div>
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
            <p style={{ color: 'var(--text-muted)' }}>Global summary of clinical registry metrics.</p>
        </div>
        <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <div style={{ background: 'white', padding: '2.5rem', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1rem' }}>Total Patients</div>
                <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--primary)' }}>{stats.patients}</div>
            </div>
            <div style={{ background: 'white', padding: '2.5rem', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1rem' }}>Active Centers</div>
                <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--primary)' }}>{stats.centers}</div>
            </div>
            <div style={{ background: 'white', padding: '2.5rem', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1rem' }}>Network Size</div>
                <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--primary)' }}>{stats.users}</div>
            </div>
        </div>
    </div>
);

function App() {
    const [session, setSession] = useState<AuthSession | null>(null);
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [authChecking, setAuthChecking] = useState(true);
    const [showAuthOverlay, setShowAuthOverlay] = useState(false);
    const [currentPage, setCurrentPage] = useState<string>('dashboard');
    const [stats, setStats] = useState({ patients: 0, users: 0, centers: 0 });
    const [notifications, setNotifications] = useState<NotificationType[]>([]);
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    
    // Form Edit States
    const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
    const [editingDraft, setEditingDraft] = useState<any | null>(null);

    const showNotification = useCallback((message: string, type: 'success' | 'error') => {
        setNotifications(prev => [...prev, { id: Date.now(), message, type }]);
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
        } catch (e) {
            console.error(e);
        } finally {
            setAuthChecking(false);
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                setSession(session);
                fetchProfileAndStats(session.user);
            } else {
                setAuthChecking(false);
                setLoading(false);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session) {
                fetchProfileAndStats(session.user);
                setShowAuthOverlay(false);
            } else {
                setCurrentUser(null);
                setAuthChecking(false);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, [fetchProfileAndStats]);

    const renderMainContent = () => {
        if (!currentUser) return null;
        switch (currentPage) {
            case 'dashboard': return <DashboardPage stats={stats} />;
            case 'patients': return <PatientsPage currentUser={currentUser} showNotification={showNotification} onEditPatient={(p) => { setEditingPatient(p); setCurrentPage('add_patient'); }} />;
            case 'add_patient': return <AddPatientPage showNotification={showNotification} onPatientAdded={() => setCurrentPage('patients')} currentUser={currentUser} editingPatient={editingPatient} editingDraft={editingDraft} isReconnecting={false} />;
            case 'drafts': return <DraftsPage currentUser={currentUser} showNotification={showNotification} onEditDraft={(d) => { setEditingDraft(d); setCurrentPage('add_patient'); }} />;
            case 'users': return currentUser.role === 'admin' ? <UsersPage showNotification={showNotification} /> : <DashboardPage stats={stats} />;
            case 'centers': return currentUser.role === 'admin' ? <CentersPage showNotification={showNotification} /> : <DashboardPage stats={stats} />;
            default: return <DashboardPage stats={stats} />;
        }
    };

    if (loading) return <LoadingSpinner />;

    if (!session || !currentUser) {
        return (
            <>
                <LandingPage onLoginClick={() => setShowAuthOverlay(true)} isLoggedIn={!!session} />
                
                {showAuthOverlay && (
                    <div className="auth-overlay" onClick={() => setShowAuthOverlay(false)}>
                        <div className="auth-card" onClick={e => e.stopPropagation()}>
                            <button 
                                className="auth-close"
                                onClick={() => setShowAuthOverlay(false)} 
                            >
                                &times;
                            </button>
                            <AuthPage hasAdmin={true} onAdminCreated={() => {}} />
                        </div>
                    </div>
                )}

                {notifications.map(n => <Notification key={n.id} {...n} onClose={() => setNotifications(p => p.filter(i => i.id !== n.id))} />)}
            </>
        );
    }

    return (
        <div className="app-layout">
            <Sidebar 
                currentPage={currentPage} 
                userRole={currentUser.role} 
                isOpen={isSidebarOpen} 
                setIsOpen={setSidebarOpen} 
                onNavigate={(p) => { 
                    if (p === 'add_patient') { setEditingPatient(null); setEditingDraft(null); }
                    setCurrentPage(p); 
                }} 
            />
            <main className="main-content">
                <Header 
                    currentUser={currentUser} 
                    onLogout={() => supabase.auth.signOut()} 
                    onMenuClick={() => setSidebarOpen(!isSidebarOpen)} 
                />
                <div className="page-content">
                    {renderMainContent()}
                </div>
            </main>
            {notifications.map(n => <Notification key={n.id} {...n} onClose={() => setNotifications(p => p.filter(i => i.id !== n.id))} />)}
        </div>
    );
}

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
