
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

// --- DASHBOARD PAGE ---
const DashboardPage = ({ stats }: { stats: { patients: number, users: number, centers: number } }) => (
    <div>
        <div className="page-header"><h1>Dashboard</h1></div>
        <div className="dashboard-grid">
            <div className="dashboard-card"><h3>Total Patients</h3><div className="metric">{stats.patients}</div></div>
            <div className="dashboard-card"><h3>Total Users</h3><div className="metric">{stats.users}</div></div>
            <div className="dashboard-card"><h3>Research Centers</h3><div className="metric">{stats.centers}</div></div>
        </div>
    </div>
);

function App() {
    const [session, setSession] = useState<AuthSession | null>(null);
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [hasAdmin, setHasAdmin] = useState(true);
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
            if (error) { showNotification("Could not fetch user profile.", "error"); await supabase.auth.signOut(); return; }
            setCurrentUser(profile as UserProfile);
            setLoading(false);
            if (profile.role === 'admin') {
                const [p, u, c] = await Promise.all([
                    supabase.from('patients').select('id', { count: 'exact', head: true }),
                    supabase.from('profiles').select('id', { count: 'exact', head: true }),
                    supabase.from('centers').select('id', { count: 'exact', head: true }),
                ]);
                setStats({ patients: p.count || 0, users: u.count || 0, centers: c.count || 0 });
            }
        } catch (e) { console.error(e); setLoading(false); }
    }, [showNotification]);

    useEffect(() => {
        const initializeSession = async () => {
            if (isInitializing.current) return;
            isInitializing.current = true;
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                const { data } = await supabase.rpc('is_admin_registered');
                setHasAdmin(!!data);
                setLoading(false);
                isInitializing.current = false;
                return;
            }
            setSession(session);
            if (session?.user) await fetchInitialData(session.user);
            else setLoading(false);
            isInitializing.current = false;
        };
        initializeSession();

        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, sess) => {
            if (event === 'PASSWORD_RECOVERY') { setSession(sess); window.location.hash = '#/reset-password'; return; }
            if (event === 'SIGNED_OUT') { setSession(null); setCurrentUser(null); setLoading(false); return; }
            if (event === 'SIGNED_IN' && sess?.user) { setSession(sess); await fetchInitialData(sess.user); }
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
    if (!session || !currentUser) return <AuthPage hasAdmin={hasAdmin} onAdminCreated={() => { showNotification('Admin created! Verify email.', 'success'); setHasAdmin(true); }} />;

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
