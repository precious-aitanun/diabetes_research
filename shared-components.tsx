import React, { useEffect } from 'react';
import { UserProfile } from './types';

// --- ICONS ---
export const IconDashboard = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
export const IconPatients = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
export const IconUsers = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 21a6 6 0 006-5.197" /></svg>;
export const IconCenters = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m-1 4h1m5-4h1m-1 4h1m-1-4h1" /></svg>;
export const IconLogout = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
export const IconPlus = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>;
export const IconMenu = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>;
export const IconEdit = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
export const IconTrash = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
export const IconSave = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>;
export const IconDrafts = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;

// --- UI COMPONENTS ---
export const LoadingSpinner = () => (
    <div className="loading-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', width: '100%' }}>
        <svg width="40" height="40" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="var(--primary)">
            <path d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity=".25"/>
            <path d="M10.14,1.16a11,11,0,0,0-9,8.92A1.59,1.59,0,0,0,2.46,12,1.52,1.52,0,0,0,4.11,10.7a8,8,0,0,1,6.66-6.61A1.42,1.42,0,0,0,12,2.69h0A1.57,1.57,0,0,0,10.14,1.16Z">
                <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite"/>
            </path>
        </svg>
    </div>
);

export const Notification = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`notification ${type}`} style={{ 
            position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999,
            padding: '1rem 1.5rem', borderRadius: '8px', color: 'white', fontWeight: 600,
            background: type === 'success' ? '#10b981' : '#ef4444', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.2)'
        }}>
            {message}
        </div>
    );
};

export const Modal = ({ title, children, onClose }: { title: string, children: React.ReactNode, onClose: () => void }) => (
    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={onClose}>
        <div className="modal-content" style={{ background: 'white', borderRadius: '12px', width: '100%', maxWidth: '500px', overflow: 'hidden', boxShadow: 'var(--shadow)' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontWeight: 800, fontSize: '1.1rem' }}>{title}</h3>
                <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}>&times;</button>
            </div>
            <div style={{ padding: '1.5rem' }}>{children}</div>
        </div>
    </div>
);

export const ProgressBar = ({ currentStep, steps, onStepClick }: { currentStep: number, steps: string[], onStepClick: (i: number) => void }) => (
    <div className="progress-bar">
        {steps.map((step, index) => (
            <button key={index} className={`progress-step ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`} onClick={() => onStepClick(index)}>
                <div className="step-number">{index < currentStep ? '✓' : index + 1}</div>
                <div className="step-label">{step.split(' ')[0]}</div>
            </button>
        ))}
    </div>
);

export const Sidebar = ({ currentPage, userRole, isOpen, setIsOpen, onNavigate }: any) => {
    const links = [
        { name: 'Dashboard', icon: <IconDashboard />, page: 'dashboard', roles: ['admin', 'researcher', 'data-entry'] },
        { name: 'Patients', icon: <IconPatients />, page: 'patients', roles: ['admin', 'researcher', 'data-entry'] },
        { name: 'Add Patient', icon: <IconPlus />, page: 'add_patient', roles: ['admin', 'data-entry', 'researcher'] },
        { name: 'Drafts', icon: <IconDrafts />, page: 'drafts', roles: ['admin', 'data-entry', 'researcher'] },
        { name: 'Users', icon: <IconUsers />, page: 'users', roles: ['admin'] },
        { name: 'Centers', icon: <IconCenters />, page: 'centers', roles: ['admin'] },
    ];
    return (
        <nav className={`sidebar ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-header">NIDPO REGISTRY</div>
            <div className="sidebar-links">
                {links.filter(l => l.roles.includes(userRole)).map(l => (
                    <button key={l.name} className={`nav-item ${currentPage === l.page ? 'active' : ''}`} onClick={() => { onNavigate(l.page); setIsOpen(false); }}>
                        {l.icon} <span>{l.name}</span>
                    </button>
                ))}
            </div>
        </nav>
    );
};

export const Header = ({ currentUser, onLogout, onMenuClick }: any) => (
    <header className="header">
        <button className="btn mobile-toggle" onClick={onMenuClick} style={{ border: 'none', background: 'none', padding: '0.5rem' }}>
            <IconMenu />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--secondary)' }}>{currentUser.name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{currentUser.role}</div>
            </div>
            <button className="btn btn-danger" onClick={onLogout} style={{ padding: '0.5rem 0.8rem' }}>
                <IconLogout /> <span style={{ marginLeft: '4px' }}>Sign Out</span>
            </button>
        </div>
    </header>
);
