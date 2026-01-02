import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { LoadingSpinner, Modal, IconPlus, IconEdit, IconTrash } from './shared-components';
import { UserProfile, Center } from './types';

export function UsersPage({ showNotification }: any) {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [centers, setCenters] = useState<Center[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        const [u, c] = await Promise.all([
            supabase.from('profiles').select('*, centers(name)'),
            supabase.from('centers').select('*')
        ]);
        setUsers(u.data as UserProfile[] || []);
        setCenters(c.data as Center[] || []);
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    if (loading) return <LoadingSpinner />;

    return (
        <div>
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Personnel Management</h1>
                <p style={{ color: 'var(--text-muted)' }}>Manage access permissions and hospital assignments.</p>
            </div>

            <div className="table-card">
                <div className="table-header">
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{users.length} Active Research Staff</span>
                    <button className="btn btn-primary"><IconPlus /> Invite Staff</button>
                </div>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Research Center</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id}>
                                    <td style={{ fontWeight: 700 }}>{u.name}</td>
                                    <td style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                                    <td>
                                        <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800 }}>
                                            {u.role.toUpperCase()}
                                        </span>
                                    </td>
                                    <td>{u.centers?.name || 'Administrative'}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button className="btn-icon" title="Edit Staff"><IconEdit /></button>
                                            <button className="btn-icon" title="Remove Access" style={{ color: '#ef4444' }}><IconTrash /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export function CentersPage({ showNotification }: any) {
    const [centers, setCenters] = useState<Center[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            const { data } = await supabase.from('centers').select('*');
            setCenters(data as Center[] || []);
            setLoading(false);
        };
        fetch();
    }, []);

    if (loading) return <LoadingSpinner />;

    return (
        <div>
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Research Centers</h1>
                <p style={{ color: 'var(--text-muted)' }}>Nodes participating in the multicenter outcomes study.</p>
            </div>

            <div className="table-card">
                <div className="table-header">
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{centers.length} Verified Institutions</span>
                    <button className="btn btn-primary"><IconPlus /> Add Center</button>
                </div>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Institution Name</th>
                                <th>Location / State</th>
                                <th>Registry Volume</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {centers.map(c => (
                                <tr key={c.id}>
                                    <td style={{ fontWeight: 700 }}>{c.name}</td>
                                    <td>{c.location}</td>
                                    <td style={{ color: 'var(--text-muted)' }}>0</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button className="btn-icon" title="Edit Center"><IconEdit /></button>
                                            <button className="btn-icon" title="Delete Center" style={{ color: '#ef4444' }}><IconTrash /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
