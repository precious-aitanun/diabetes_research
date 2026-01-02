import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { LoadingSpinner, IconEdit, IconTrash, ProgressBar, IconSave } from './shared-components';
import { UserProfile, Patient, FormField } from './types';
import { formStructure } from './constants';

export function AddPatientPage({ showNotification, onPatientAdded, currentUser, editingPatient }: any) {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState<any>(editingPatient?.formData || {});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSaveDraft = () => {
        localStorage.setItem('nidpo_draft_' + currentUser.id, JSON.stringify(formData));
        showNotification('Form progress saved to local storage.', 'success');
    };

    const handleInputChange = (id: string, value: any) => {
        setFormData({ ...formData, [id]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = {
                patientId: formData.serialNumber,
                age: formData.age || 0,
                sex: formData.sex || 'Unknown',
                centerId: currentUser.centerId || 1,
                formData: formData
            };
            const { error } = editingPatient 
                ? await supabase.from('patients').update(payload).eq('id', editingPatient.id)
                : await supabase.from('patients').insert([payload]);
            
            if (error) throw error;
            showNotification('Patient record successfully uploaded to registry.', 'success');
            localStorage.removeItem('nidpo_draft_' + currentUser.id);
            onPatientAdded();
        } catch (e: any) {
            showNotification(e.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderField = (field: FormField) => {
        if (field.condition && !field.condition(formData)) return null;
        return (
            <div key={field.id} className="form-group">
                <label>{field.label}</label>
                {field.type === 'radio' ? (
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', padding: '0.5rem 0' }}>
                        {field.options?.map(opt => (
                            <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
                                <input type="radio" value={opt} checked={formData[field.id] === opt} onChange={() => handleInputChange(field.id, opt)} style={{ width: '16px', height: '16px' }} /> {opt}
                            </label>
                        ))}
                    </div>
                ) : (
                    <input 
                        type={field.type === 'number' ? 'number' : 'text'} 
                        placeholder={field.helpText}
                        value={formData[field.id] || ''} 
                        onChange={e => handleInputChange(field.id, e.target.value)} 
                    />
                )}
            </div>
        );
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Clinical Entry Registry</h1>
                <p style={{ color: 'var(--text-muted)' }}>Multicenter standardized data collection form.</p>
            </div>

            <ProgressBar currentStep={currentStep} steps={formStructure.map(s => s.title)} onStepClick={setCurrentStep} />

            <div className="table-card" style={{ padding: '2rem', marginTop: '1.5rem' }}>
                <div style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>{formStructure[currentStep].title}</h2>
                    {formStructure[currentStep].description && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{formStructure[currentStep].description}</p>}
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                        {formStructure[currentStep].fields.map(renderField)}
                    </div>

                    <div className="form-footer">
                        <button type="button" className="btn btn-outline" onClick={handleSaveDraft}>
                            <IconSave /> Save Progress
                        </button>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button type="button" className="btn btn-outline" disabled={currentStep === 0} onClick={() => setCurrentStep(s => s - 1)}>Back</button>
                            {currentStep < formStructure.length - 1 ? (
                                <button type="button" className="btn btn-primary" onClick={() => setCurrentStep(s => s + 1)}>Save & Continue</button>
                            ) : (
                                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Syncing...' : 'Final Submission'}</button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export function PatientsPage({ currentUser, onEditPatient }: any) {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            const { data } = await supabase.from('patients').select('*, centers(name)').order('dateAdded', { ascending: false });
            setPatients(data as Patient[] || []);
            setLoading(false);
        };
        fetch();
    }, []);

    if (loading) return <LoadingSpinner />;

    return (
        <div>
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Patient Registry</h1>
                <p style={{ color: 'var(--text-muted)' }}>Standardized outcomes database across all centers.</p>
            </div>
            <div className="table-card">
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Patient ID</th>
                                <th>Bio Data</th>
                                <th>Institution</th>
                                <th>Registration Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {patients.map(p => (
                                <tr key={p.id}>
                                    <td style={{ fontWeight: 800, color: 'var(--secondary)' }}>{p.patientId}</td>
                                    <td style={{ fontSize: '0.85rem' }}>{p.age}Y • {p.sex}</td>
                                    <td>{p.centers?.name}</td>
                                    <td style={{ color: 'var(--text-muted)' }}>{new Date(p.dateAdded).toLocaleDateString()}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button className="btn-icon" title="Edit Patient" onClick={() => onEditPatient(p)}><IconEdit /></button>
                                            <button className="btn-icon" title="Delete Entry" style={{ color: '#ef4444' }}><IconTrash /></button>
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

export function DraftsPage({ currentUser, showNotification, onEditDraft }: any) {
    return (
        <div style={{ textAlign: 'center', padding: '5rem', background: 'white', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
            <h2 style={{ fontWeight: 800 }}>Draft Management</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0.5rem auto 1.5rem' }}>
                Drafts are currently saved locally to your browser to prevent data loss during long entries.
            </p>
            <button className="btn btn-outline" onClick={() => window.location.reload()}>Refresh Sessions</button>
        </div>
    );
}
