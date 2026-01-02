
import React, { useEffect } from 'react';
import { UserProfile } from './types';

// --- ICONS ---
export const IconDashboard = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
export const IconPatients = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
export const IconUsers = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 21a6 6 0 006-5.197" /></svg>;
export const IconCenters = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m-1 4h1m5-4h1m-1 4h1m-1-4h1" /></svg>;
export const IconLogout = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
export const IconPlus = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>;
export const IconExport = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;
export const IconMenu = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>;
export const IconEdit = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
export const IconDrafts = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
export const IconTrash = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;

// --- UI COMPONENTS ---
export const LoadingSpinner = () => (
    <div className="loading-container">
        <svg width="40" height="40" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="var(--primary-color)">
            <path d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity=".25"/>
            <path d="M10.72,19.9a8,8,0,0,1-6.5-9.79A7.77,7.77,0,0,1,10.4,4.16a8,8,0,0,1,9.49,6.52A1.54,1.54,0,0,0,21.38,12h.13a1.37,1.37,0,0,0,1.38-1.54,11,11,0,1,0-12.7,12.39A1.54,1.54,0,0,0,12,21.34h0A1.47,1.47,0,0,0,10.72,19.9Z">
                <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
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
        <div className={`notification ${type}`}>
            {message}
        </div>
    );
};

export const Modal = ({ title, children, onClose, onConfirm, confirmText = "Confirm" }: { title: string, children: React.ReactNode, onClose: () => void, onConfirm?: () => void, confirmText?: string }) => {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button onClick={onClose} className="close-btn">&times;</button>
                </div>
                <div className="modal-body">
                    {children}
                </div>
                {onConfirm && (
                    <div className="modal-actions">
                        <button onClick={onClose} className="btn btn-secondary">Cancel</button>
                        <button onClick={onConfirm} className="btn">{confirmText}</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export const ProgressBar = ({ currentStep, steps, onStepClick }: { currentStep: number, steps: string[], onStepClick: (stepIndex: number) => void }) => (
    <div className="progress-bar">
        {steps.map((step, index) => (
            <button
                type="button"
                key={index}
                className={`progress-step ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
                onClick={() => onStepClick(index)}
                aria-label={`Go to step ${index + 1}: ${step}`}
                aria-current={index === currentStep ? 'step' : undefined}
            >
                <div className="step-number">{index < currentStep ? '✓' : index + 1}</div>
                <div className="step-label">{step}</div>
            </button>
        ))}
    </div>
);

// --- LAYOUT COMPONENTS ---
export const Sidebar = ({ currentPage, userRole, isOpen, setIsOpen, onNavigate }: { currentPage: string, userRole: UserProfile['role'], isOpen: boolean, setIsOpen: (o: boolean) => void, onNavigate: (p: string) => void }) => {
    const navLinks = [
        { name: 'Dashboard', icon: <IconDashboard />, page: 'dashboard', roles: ['admin', 'researcher', 'data-entry'] },
        { name: 'Patients', icon: <IconPatients />, page: 'patients', roles: ['admin', 'researcher', 'data-entry'] },
        { name: 'Add Patient', icon: <IconPlus />, page: 'add_patient', roles: ['admin', 'data-entry', 'researcher'] },
        { name: 'Drafts', icon: <IconDrafts />, page: 'drafts', roles: ['admin', 'data-entry', 'researcher'] },
        { name: 'Users', icon: <IconUsers />, page: 'users', roles: ['admin'] },
        { name: 'Centers', icon: <IconCenters />, page: 'centers', roles: ['admin'] },
    ];

    const handleNav = (page: string) => {
        onNavigate(page);
        setIsOpen(false);
    };

    return (
        <nav className={`sidebar ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
                <span className="logo">NIDPO</span>
            </div>
            {navLinks.filter(link => link.roles.includes(userRole)).map(link => (
                <a
                    key={link.name}
                    className={`nav-item ${currentPage === link.page ? 'active' : ''}`}
                    onClick={() => handleNav(link.page)}
                >
                    {link.icon}
                    {link.name}
                </a>
            ))}
        </nav>
    );
};

export const Header = ({ currentUser, onLogout, onMenuClick }: { currentUser: UserProfile, onLogout: () => void, onMenuClick: () => void }) => {
    return (
        <header className="header">
            <button className="mobile-menu-btn" onClick={onMenuClick}>
                <IconMenu />
            </button>
            <div className="user-info">
                <span>Welcome, {currentUser.name}</span>
                <button 
                    onClick={(e) => { e.preventDefault(); onLogout(); }} 
                    className="logout-btn" 
                    aria-label="Logout"
                    type="button"
                >
                    <IconLogout />
                </button>
            </div>
        </header>
    );
};
