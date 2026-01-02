import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { LoadingSpinner, Modal, IconPlus, IconEdit, IconTrash } from './shared-components';
import { UserProfile, Center } from './types';

// --- ADD USER FORM ---
function AddUserForm({ centers, onAddUser, onCancel, showNotification }: any) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<'researcher' | 'data-entry'>('data-entry');
    const [centerId, setCenterId] = useState<number | ''>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !role || !centerId) {
            showNotification('All fields are required.', 'error');
            return;
        }
        setIsSubmitting(true);
        await onAddUser({ name, email, role, centerId: Number(centerId) });
        setIsSubmitting(false);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Dr. Jane Smith" />
            </div>
            <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="jane.smith@hospital.org" />
            </div>
            <div className="form-group">
                <label htmlFor="role">Role</label>
                <select id="role" value={role} onChange={e => setRole(e.target.value as any)} required>
                    <option value="data-entry">Data Entry Personnel</option>
                    <option value="researcher">Researcher / Clinician</option>
                </select>
            </div>
            <div className="form-group">
                <label htmlFor="center">Hospital / Research Center</label>
                <select id="center" value={centerId} onChange={e => setCenterId(Number(e.target.value))} required>
                    <option value="" disabled>Select institution...</option>
                    {centers.map((center: Center) => <option key={center.id} value={center.id}>{center.name}</option>)}
                </select>
            </div>
            <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={onCancel}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Generating...' : 'Invite Staff'}
                </button>
            </div>
        </form>
    );
}

// --- CENTER FORM ---
function CenterForm({ center, onSave, onCancel, showNotification }: any) {
    const [name, setName] = useState(center?.name || '');
    const [location, setLocation] = useState(center?.location || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !location) {
            showNotification('All fields are required', 'error');
            return;
        }
        setIsSubmitting(true);
        await onSave(name, location);
        setIsSubmitting(false);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label htmlFor="name">Institution Name</label>
                <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g., Irrua Specialist Teaching Hospital" />
            </div>
            <div className="form-group">
                <label htmlFor="location">Location / State</label>
                <input id="location" type="text" value={location} onChange={e => setLocation(e.target.value)} required placeholder="e.g., Edo State" />
            </div>
            <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={onCancel}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : center ? 'Update Institution' : 'Add Institution'}
                </button>
            </div>
        </form>
    );
}

// --- USERS PAGE ---
export function UsersPage({ showNotification }: any) {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [centers, setCenters] = useState<Center[]>([]);
    const [loading, setLoading] = useState(true);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [invitationLink, setInvitationLink] = useState('');
    const [showLinkModal, setShowLinkModal] = useState(false);

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

    const handleInviteUser = async (newUserData: any) => {
        const { data, error } = await supabase
            .from('invitations')
            .insert({
                email: newUserData.email,
                role: newUserData.role,
                centerId: newUserData.centerId
            })
            .select()
            .single();

        if (error) {
            showNotification(`Error creating invitation: ${error.message}`, 'error');
            return;
        }

        const baseUrl = window.location.origin + window.location.pathname;
        const link = `${baseUrl}#/?token=${data.token}`;
        setInvitationLink(link);
        setShowInviteModal(false);
        setShowLinkModal(true);
        showNotification('Invitation link generated successfully.', 'success');
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Permanently remove this user? This action cannot be undone.')) return;
        const { error } = await supabase.rpc('delete_user', { user_id: userId });
        if (error) showNotification(`Error deleting user: ${error.message}`, 'error');
        else {
            showNotification('User removed successfully', 'success');
            fetchData();
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div>
            {showInviteModal && (
                <Modal title="Invite Research Staff" onClose={() => setShowInviteModal(false)}>
                    <AddUserForm centers={centers} onAddUser={handleInviteUser} onCancel={() => setShowInviteModal(false)} showNotification={showNotification} />
                </Modal>
            )}

            {showLinkModal && (
                <Modal title="Secure Invitation Link" onClose={() => setShowLinkModal(false)}>
                    <p style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>Send this link to the staff member to complete registration:</p>
                    <input type="text" readOnly value={invitationLink} style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', background: '#f8fafc', fontWeight: 700 }} />
                    <div className="modal-actions">
                        <button className="btn btn-primary" onClick={() => { navigator.clipboard.writeText(invitationLink); showNotification('Link copied!', 'success'); }}>Copy Link</button>
                    </div>
                </Modal>
            )}

            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Personnel Management</h1>
                <p style={{ color: 'var(--text-muted)' }}>Manage access permissions and hospital assignments.</p>
            </div>

            <div className="table-card">
                <div className="table-header">
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{users.length} Active Staff</span>
                    <button className="btn btn-primary" onClick={() => setShowInviteModal(true)}><IconPlus /> Invite Staff</button>
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
                                            <button className="btn-icon" title="Remove Access" style={{ color: '#ef4444' }} onClick={() => handleDeleteUser(u.id)}><IconTrash /></button>
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

// --- CENTERS PAGE ---
export function CentersPage({ showNotification }: any) {
    const [centers, setCenters] = useState<Center[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingCenter, setEditingCenter] = useState<Center | null>(null);

    const fetchCenters = async () => {
        setLoading(true);
        const { data } = await supabase.from('centers').select('*');
        setCenters(data as Center[] || []);
        setLoading(false);
    };

    useEffect(() => { fetchCenters(); }, []);

    const handleSaveCenter = async (name: string, location: string) => {
        const { error } = editingCenter 
            ? await supabase.from('centers').update({ name, location }).eq('id', editingCenter.id)
            : await supabase.from('centers').insert({ name, location });

        if (error) showNotification(`Error: ${error.message}`, 'error');
        else {
            showNotification('Center updated successfully', 'success');
            setShowAddModal(false);
            setShowEditModal(false);
            setEditingCenter(null);
            fetchCenters();
        }
    };

    const handleDeleteCenter = async (id: number) => {
        if (!confirm('Remove this research center? Warning: Patients assigned to this center may lose association.')) return;
        const { error } = await supabase.from('centers').delete().eq('id', id);
        if (error) showNotification(`Error: ${error.message}`, 'error');
        else fetchCenters();
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div>
            {(showAddModal || showEditModal) && (
                <Modal title={editingCenter ? "Edit Institution" : "Add Research Institution"} onClose={() => { setShowAddModal(false); setShowEditModal(false); setEditingCenter(null); }}>
                    <CenterForm center={editingCenter} onSave={handleSaveCenter} onCancel={() => { setShowAddModal(false); setShowEditModal(false); setEditingCenter(null); }} showNotification={showNotification} />
                </Modal>
            )}

            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Research Centers</h1>
                <p style={{ color: 'var(--text-muted)' }}>Nodes participating in the multicenter outcomes study.</p>
            </div>

            <div className="table-card">
                <div className="table-header">
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{centers.length} Verified Institutions</span>
                    <button className="btn btn-primary" onClick={() => setShowAddModal(true)}><IconPlus /> Add Center</button>
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
                                            <button className="btn-icon" title="Edit Center" onClick={() => { setEditingCenter(c); setShowEditModal(true); }}><IconEdit /></button>
                                            <button className="btn-icon" title="Delete Center" style={{ color: '#ef4444' }} onClick={() => handleDeleteCenter(c.id)}><IconTrash /></button>
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
