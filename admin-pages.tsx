
import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { LoadingSpinner, Modal, IconPlus, IconEdit, IconTrash } from './shared-components';
// Removed non-existent AddUserFormData import
import { UserProfile, Center } from './types';

// Helper Form Components
function AddUserForm({ centers, onAddUser, onCancel, showNotification }: { centers: Center[], onAddUser: (u: any) => Promise<void>, onCancel: () => void, showNotification: (m: string, t: 'success' | 'error') => void }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<'researcher' | 'data-entry'>('data-entry');
    const [centerId, setCenterId] = useState<number | ''>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !role || !centerId) { showNotification('All fields are required.', 'error'); return; }
        setIsSubmitting(true);
        await onAddUser({ name, email, role, centerId: Number(centerId) });
        setIsSubmitting(false);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
                <label htmlFor="role">Role</label>
                <select id="role" value={role} onChange={e => setRole(e.target.value as any)} required>
                    <option value="data-entry">Data Entry</option>
                    <option value="researcher">Researcher</option>
                </select>
            </div>
            <div className="form-group">
                <label htmlFor="center">Research Center</label>
                <select id="center" value={centerId} onChange={e => setCenterId(Number(e.target.value))} required>
                    <option value="" disabled>Select a center</option>
                    {centers.map(center => <option key={center.id} value={center.id}>{center.name}</option>)}
                </select>
            </div>
            <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
                <button type="submit" className="btn" disabled={isSubmitting}>{isSubmitting ? 'Sending...' : 'Send Invitation'}</button>
            </div>
        </form>
    );
}

function EditUserForm({ user, centers, onSave, onCancel, showNotification }: { user: UserProfile, centers: Center[], onSave: (d: any) => Promise<void>, onCancel: () => void, showNotification: (m: string, t: 'success' | 'error') => void }) {
    const [role, setRole] = useState<UserProfile['role']>(user.role);
    const [centerId, setCenterId] = useState<number>(user.centerId || 0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!centerId && role !== 'admin') { showNotification('Please select a center', 'error'); return; }
        setIsSubmitting(true);
        await onSave({ role, centerId });
        setIsSubmitting(false);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label htmlFor="role">Role</label>
                <select id="role" value={role} onChange={e => setRole(e.target.value as UserProfile['role'])} required>
                    <option value="admin">Admin</option>
                    <option value="researcher">Researcher</option>
                    <option value="data-entry">Data Entry</option>
                </select>
            </div>
            {role !== 'admin' && (
                <div className="form-group">
                    <label htmlFor="center">Research Center</label>
                    <select id="center" value={centerId} onChange={e => setCenterId(Number(e.target.value))} required>
                        <option value={0} disabled>Select a center</option>
                        {centers.map(center => <option key={center.id} value={center.id}>{center.name}</option>)}
                    </select>
                </div>
            )}
            <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
                <button type="submit" className="btn" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Changes'}</button>
            </div>
        </form>
    );
}

export function UsersPage({ showNotification }: { showNotification: (m: string, t: 'success' | 'error') => void }) {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [centers, setCenters] = useState<Center[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [showEditUserModal, setShowEditUserModal] = useState(false);
    const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
    const [invitationLink, setInvitationLink] = useState('');
    const [showLinkModal, setShowLinkModal] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        const [usersRes, centersRes] = await Promise.all([
            supabase.from('profiles').select('*, centers(name)'),
            supabase.from('centers').select('*')
        ]);
        if (usersRes.error) showNotification('Error fetching users: ' + usersRes.error.message, 'error');
        else setUsers(usersRes.data as UserProfile[]);
        if (centersRes.error) showNotification('Error fetching centers: ' + centersRes.error.message, 'error');
        else setCenters(centersRes.data as Center[]);
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    const handleInviteUser = async (newUserData: any) => {
        const { data, error } = await supabase.from('invitations').insert({
            email: newUserData.email, role: newUserData.role, centerId: newUserData.centerId
        }).select().single();
        if (error) { showNotification(`Error creating invitation: ${error.message}`, 'error'); return; }
        const baseUrl = window.location.origin + window.location.pathname;
        setInvitationLink(`${baseUrl}#/?token=${data.token}`);
        setShowAddUserModal(false); setShowLinkModal(true);
        showNotification('Invitation link generated successfully.', 'success');
    };

    const handleEditUser = async (updatedData: any) => {
        if (!editingUser) return;
        const { error } = await supabase.from('profiles').update({ role: updatedData.role, centerId: updatedData.centerId }).eq('id', editingUser.id);
        if (error) showNotification(`Error updating user: ${error.message}`, 'error');
        else { showNotification('User updated successfully', 'success'); setShowEditUserModal(false); setEditingUser(null); fetchData(); }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user?')) return;
        const { error } = await supabase.rpc('delete_user', { user_id: userId });
        if (error) showNotification(`Error deleting user: ${error.message}`, 'error');
        else { showNotification('User deleted successfully', 'success'); fetchData(); }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div>
            {showAddUserModal && <Modal title="Invite New User" onClose={() => setShowAddUserModal(false)}><AddUserForm centers={centers} onAddUser={handleInviteUser} onCancel={() => setShowAddUserModal(false)} showNotification={showNotification} /></Modal>}
            {showEditUserModal && editingUser && <Modal title="Edit User" onClose={() => { setShowEditUserModal(false); setEditingUser(null); }}><EditUserForm user={editingUser} centers={centers} onSave={handleEditUser} onCancel={() => { setShowEditUserModal(false); setEditingUser(null); }} showNotification={showNotification} /></Modal>}
            {showLinkModal && <Modal title="Invitation Link" onClose={() => setShowLinkModal(false)}>
                <p>Share this link with the new user to complete their registration:</p>
                <input type="text" readOnly value={invitationLink} style={{width: '100%', padding: '0.5rem', marginTop: '1rem'}} />
                <div className="modal-actions"><button className="btn" onClick={() => { navigator.clipboard.writeText(invitationLink); showNotification('Link copied to clipboard!', 'success'); }}>Copy Link</button></div>
            </Modal>}
            <div className="page-header"><h1>User Management</h1></div>
            <div className="table-container">
                <div className="table-controls">
                    <p className="table-description">Manage user roles and center assignments.</p>
                    <div className="table-actions"><button className="btn" onClick={() => setShowAddUserModal(true)}><IconPlus /> Add User</button></div>
                </div>
                <div className="table-wrapper">
                    <table>
                        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Center</th><th>Actions</th></tr></thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td>{user.name}</td><td>{user.email}</td><td>{user.role}</td><td>{user.centers?.name || 'N/A'}</td>
                                    <td className="actions-cell">
                                        <button onClick={() => { setEditingUser(user); setShowEditUserModal(true); }} className="btn-icon" title="Edit User"><IconEdit /></button>
                                        <button onClick={() => handleDeleteUser(user.id)} className="btn-icon" title="Delete User" style={{ color: '#dc3545' }}><IconTrash /></button>
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

function CenterForm({ center, onSave, onCancel, showNotification }: { center?: Center, onSave: (n: string, l: string) => Promise<void>, onCancel: () => void, showNotification: (m: string, t: 'success' | 'error') => void }) {
    const [name, setName] = useState(center?.name || '');
    const [location, setLocation] = useState(center?.location || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !location) { showNotification('All fields are required', 'error'); return; }
        setIsSubmitting(true); await onSave(name, location); setIsSubmitting(false);
    };
    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group"><label htmlFor="name">Center Name</label><input id="name" type="text" value={name} onChange={e => setName(e.target.value)} required /></div>
            <div className="form-group"><label htmlFor="location">Location</label><input id="location" type="text" value={location} onChange={e => setLocation(e.target.value)} required /></div>
            <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
                <button type="submit" className="btn" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : center ? 'Update Center' : 'Add Center'}</button>
            </div>
        </form>
    );
}

export function CentersPage({ showNotification }: { showNotification: (m: string, t: 'success' | 'error') => void }) {
    const [centers, setCenters] = useState<Center[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingCenter, setEditingCenter] = useState<Center | null>(null);

    const fetchCenters = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('centers').select('*');
        if (error) showNotification('Error fetching centers: ' + error.message, 'error');
        else setCenters(data as Center[]);
        setLoading(false);
    };

    useEffect(() => { fetchCenters(); }, []);

    const handleAddCenter = async (name: string, location: string) => {
        const { error } = await supabase.from('centers').insert({ name, location });
        if (error) showNotification(`Error adding center: ${error.message}`, 'error');
        else { showNotification('Center added successfully', 'success'); setShowAddModal(false); fetchCenters(); }
    };

    const handleEditCenter = async (id: number, name: string, location: string) => {
        const { error } = await supabase.from('centers').update({ name, location }).eq('id', id);
        if (error) showNotification(`Error updating center: ${error.message}`, 'error');
        else { showNotification('Center updated successfully', 'success'); setShowEditModal(false); setEditingCenter(null); fetchCenters(); }
    };

    const handleDeleteCenter = async (id: number) => {
        if (!confirm('Are you sure you want to delete this center?')) return;
        const { error } = await supabase.from('centers').delete().eq('id', id);
        if (error) showNotification(`Error deleting center: ${error.message}`, 'error');
        else { showNotification('Center deleted successfully', 'success'); fetchCenters(); }
    };
    
    if (loading) return <LoadingSpinner />;

    return (
        <div>
            {showAddModal && <Modal title="Add Research Center" onClose={() => setShowAddModal(false)}><CenterForm onSave={handleAddCenter} onCancel={() => setShowAddModal(false)} showNotification={showNotification} /></Modal>}
            {showEditModal && editingCenter && <Modal title="Edit Research Center" onClose={() => { setShowEditModal(false); setEditingCenter(null); }}><CenterForm center={editingCenter} onSave={(n, l) => handleEditCenter(editingCenter.id, n, l)} onCancel={() => { setShowEditModal(false); setEditingCenter(null); }} showNotification={showNotification} /></Modal>}
            <div className="page-header"><h1>Research Centers</h1></div>
            <div className="table-container">
                <div className="table-controls">
                    <p className="table-description">Manage research centers.</p>
                    <div className="table-actions"><button className="btn" onClick={() => setShowAddModal(true)}><IconPlus /> Add Center</button></div>
                </div>
                <div className="table-wrapper">
                    <table>
                        <thead><tr><th>Name</th><th>Location</th><th>Actions</th></tr></thead>
                        <tbody>
                            {centers.map(center => (
                                <tr key={center.id}>
                                    <td>{center.name}</td><td>{center.location}</td>
                                    <td className="actions-cell">
                                        <button onClick={() => { setEditingCenter(center); setShowEditModal(true); }} className="btn-icon" title="Edit Center"><IconEdit /></button>
                                        <button onClick={() => handleDeleteCenter(center.id)} className="btn-icon" title="Delete Center" style={{ color: '#dc3545' }}><IconTrash /></button>
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
