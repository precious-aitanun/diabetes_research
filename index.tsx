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

// --- LANDING PAGE COMPONENTS ---

const LandingPage = ({ onLoginClick }: { onLoginClick: () => void }) => {
    return (
        <div className="landing-wrapper">
            <nav className="landing-nav">
                <a href="/" className="logo-text">NIDPO</a>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button className="btn btn-outline" style={{ border: 'none' }} onClick={() => document.getElementById('pi')?.scrollIntoView({ behavior: 'smooth' })}>The PI</button>
                    <button className="btn btn-primary" onClick={onLoginClick}>Portal Login</button>
                </div>
            </nav>

            <header className="hero-section">
                <span className="hero-badge">A Nigerian Endocrine Initiative</span>
                <h1 className="hero-title">Precision Clinical Outcomes for Diabetes Research</h1>
                <p className="hero-subtitle">NIDPO is a secure, multi-center database platform designed to standardize inpatient diabetes care metrics across Nigeria's tertiary hospitals.</p>
                <div className="cta-group">
                    <button className="btn btn-primary" onClick={onLoginClick}>Enter Research Portal</button>
                    <button className="btn btn-outline" onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}>Our Methodology</button>
                </div>
            </header>

            <section id="about" className="section-container">
                <div className="grid-3">
                    <div className="feature-card">
                        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔬</div>
                        <h3 style={{ marginBottom: '0.75rem', color: 'var(--secondary)' }}>Standardized Collection</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>Automated workflows for capturing comprehensive demographic, clinical, and biochemical markers.</p>
                    </div>
                    <div className="feature-card">
                        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📈</div>
                        <h3 style={{ marginBottom: '0.75rem', color: 'var(--secondary)' }}>Outcome Analysis</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>Real-time data synchronization across centers to monitor trends in diabetes-related complications.</p>
                    </div>
                    <div className="feature-card">
                        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>💻</div>
                        <h3 style={{ marginBottom: '0.75rem', color: 'var(--secondary)' }}>Digital Transformation</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>Moving beyond paper-based records to a robust, cloud-native infrastructure for longitudinal study.</p>
                    </div>
                </div>
            </section>

            <section id="pi" className="pi-section">
                <div className="pi-grid">
                    <img src="https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=800&auto=format&fit=crop" alt="Dr. Olugbemide" className="pi-image" />
                    <div className="pi-content">
                        <span className="pi-tag">Principal Investigator</span>
                        <h2 style={{ fontSize: '2.25rem', marginBottom: '1rem' }}>Dr. Orebowale Oreboka Olugbemide</h2>
                        <h4 style={{ color: 'var(--primary)', marginBottom: '1.5rem', fontWeight: 600 }}>Consultant Endocrinologist</h4>
                        <p style={{ fontSize: '1.0625rem', opacity: 0.9, marginBottom: '2.5rem', lineHeight: '1.7' }}>
                            A dedicated Consultant Endocrinologist at the Irrua Specialist Teaching Hospital (ISTH), Dr. Olugbemide leads this initiative to unify metabolic research across Nigeria. Her expertise in clinical outcomes drives the platform's focus on evidence-based healthcare transformation.
                        </p>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)', marginBottom: '0.25rem' }}>Primary Institution</p>
                            <p style={{ fontSize: '1rem' }}>Irrua Specialist Teaching Hospital, Edo State</p>
                        </div>
                        <div style={{ marginTop: '2.5rem' }}>
                            <a href="mailto:olugbemide@isth.gov.ng" className="btn btn-primary">Connect for Collaboration</a>
                        </div>
                    </div>
                </div>
            </section>

            <section className="section-container" style={{ textAlign: 'center', paddingBottom: '8rem' }}>
                <h2 style={{ marginBottom: '1.5rem', color: 'var(--secondary)' }}>Request Researcher Access</h2>
                <p style={{ maxWidth: '600px', margin: '0 auto 2.5rem', color: 'var(--text-muted)' }}>This platform is strictly for authorized medical consultants and research assistants within the NIDPO consortium.</p>
                <button className="btn btn-primary" onClick={onLoginClick}>Sign In to Workspace</button>
            </section>

            <footer style={{ padding: '3rem 5%', borderTop: '1px solid var(--border)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                <p>© 2024 NIDPO Platform. Led by Dr. Orebowale Oreboka Olugbemide. ISTH Research Unit.</p>
            </footer>
        </div>
    );
};

// --- DASHBOARD PAGE ---
const DashboardPage = ({ stats }: { stats: { patients: number, users: number, centers: number } }) => (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div className="page-header" style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.875rem' }}>Clinical Overview</h1>
            <p style={{ color: 'var(--text-muted)' }}>Real-time summary of research data across active centers.</p>
        </div>
        <div className="dashboard-grid">
            <div className="dashboard-card">
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Total Patients</span>
                <div className="metric">{stats.patients}</div>
            </div>
            <div className="dashboard-card">
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Active Centers</span>
                <div className="metric">{stats.centers}</div>
            </div>
            <div className="dashboard-card">
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Network Size</span>
                <div className="metric">{stats.users}</div>
            </div>
        </div>
    </div>
);

function App() {
    const [session, setSession] = useState<AuthSession | null>(null);
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [hasAdmin, setHasAdmin] = useState(true);
    const [showAuthOverlay, setShowAuthOverlay] = useState(false);
    const [currentPage, setCurrentPage] = useState<string>('dashboard');
    const [stats, setStats] = useState({ patients: 0, users: 0, centers: 0 });
    const [notifications, setNotifications] = useState<NotificationType[]>([]);
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
    const [editingDraft, setEditingDraft] = useState<any | null>(null);

    const urlHash = window.location.hash;
    const params = new URLSearchParams(urlHash.substring(urlHash.indexOf('?')));
    const invitationToken = params.get('token');
    const isInitializing = useRef(false);
    const isResetPassword = urlHash.includes('/reset-password') || urlHash.includes('type=recovery');

    const showNotification = useCallback((message: string, type: 'success' | 'error') => {
        setNotifications(prev => [...prev, { id: Date.now(), message, type }]);
    }, []);

    const fetchInitialData = useCallback(async (user: User) => {
        try {
            const { data: profile, error } = await supabase.from('profiles').select('*, centers(name)').eq('id', user.id).single();
            if (error) { 
              showNotification("Could not fetch user profile.", "error"); 
              await supabase.auth.signOut(); 
              return; 
            }
            setCurrentUser(profile as UserProfile);
            
            const [p, u, c] = await Promise.all([
                supabase.from('patients').select('id', { count: 'exact', head: true }),
                supabase.from('profiles').select('id', { count: 'exact', head: true }),
                supabase.from('centers').select('id', { count: 'exact', head: true }),
            ]);
            setStats({ patients: p.count || 0, users: u.count || 0, centers: c.count || 0 });
            setLoading(false);
        } catch (e) { 
          console.error(e); 
          setLoading(false); 
        }
    }, [showNotification]);

    useEffect(() => {
        const initializeSession = async () => {
            if (isInitializing.current) return;
            isInitializing.current = true;
            const { data: { session } } = await supabase.auth.getSession();
            
            const { data } = await supabase.rpc('is_admin_registered');
            setHasAdmin(!!data);

            if (session?.user) {
                setSession(session);
                await fetchInitialData(session.user);
            } else {
                setLoading(false);
            }
            isInitializing.current = false;
        };
        initializeSession();

        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, sess) => {
            if (event === 'PASSWORD_RECOVERY') { 
              setSession(sess); 
              window.location.hash = '#/reset-password'; 
              return; 
            }
            if (event === 'SIGNED_OUT') { 
              setSession(null); 
              setCurrentUser(null); 
              setLoading(false); 
              return; 
            }
            if (event === 'SIGNED_IN' && sess?.user) { 
              setSession(sess); 
              await fetchInitialData(sess.user); 
              setShowAuthOverlay(false); 
            }
        });
        return () => authListener.subscription.unsubscribe();
    }, [fetchInitialData]);

    const renderPage = () => {
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
    
    if (isResetPassword) return <><ResetPasswordPage showNotification={showNotification} />{notifications.map(n => <Notification key={n.id} {...n} onClose={() => setNotifications(p => p.filter(i => i.id !== n.id))} />)}</>;
    if (invitationToken) return <><InvitationSignUpPage token={invitationToken} showNotification={showNotification} onSignedUp={() => window.location.hash = '/'} />{notifications.map(n => <Notification key={n.id} {...n} onClose={() => setNotifications(p => p.filter(i => i.id !== n.id))} />)}</>;

    if (!session || !currentUser) {
        return (
            <>
                <LandingPage onLoginClick={() => setShowAuthOverlay(true)} />
                {showAuthOverlay && (
                    <div className="auth-overlay" onClick={() => setShowAuthOverlay(false)}>
                        <div className="auth-modal" onClick={e => e.stopPropagation()}>
                            <button 
                                style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }} 
                                onClick={() => setShowAuthOverlay(false)}
                            >
                                &times;
                            </button>
                            <AuthPage hasAdmin={hasAdmin} onAdminCreated={() => { showNotification('Admin created! Verify email.', 'success'); setHasAdmin(true); }} />
                        </div>
                    </div>
                )}
                {notifications.map(n => <Notification key={n.id} {...n} onClose={() => setNotifications(p => p.filter(i => i.id !== n.id))} />)}
            </>
        );
    }

    return (
        <div className="app-layout">
            {notifications.map(n => <Notification key={n.id} {...n} onClose={() => setNotifications(p => p.filter(i => i.id !== n.id))} />)}
            <Sidebar currentPage={currentPage} userRole={currentUser.role} isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} onNavigate={(p) => { if (p === 'add_patient') { setEditingPatient(null); setEditingDraft(null); } setCurrentPage(p); }} />
            <main className="main-content">
                <Header currentUser={currentUser} onLogout={() => supabase.auth.signOut()} onMenuClick={() => setSidebarOpen(!isSidebarOpen)} />
                <div className="page-content">{renderPage()}</div>
            </main>
        </div>
    );
}

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);