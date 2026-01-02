import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { LoadingSpinner, IconEdit, IconTrash, ProgressBar, IconSave, IconExport } from './shared-components';
import { MonitoringTable } from './shared-components';
import { UserProfile, Patient, FormField } from './types';
import { formStructure } from './constants';

export function AddPatientPage({ showNotification, onPatientAdded, currentUser, editingPatient, editingDraft }: any) {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState<any>(editingPatient?.formData || editingDraft?.form_data || {});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [draftId, setDraftId] = useState<number | null>(editingDraft?.id || null);

    // Backup restore from LocalStorage
    useEffect(() => {
        if (!editingPatient && !editingDraft) {
            const backup = localStorage.getItem('nidpo_form_backup');
            if (backup) {
                try {
                    const parsed = JSON.parse(backup);
                    if (parsed.userId === currentUser.id && Object.keys(parsed.formData).length > 2) {
                        const restore = window.confirm(`Found an unsaved form from ${new Date(parsed.timestamp).toLocaleString()}. Restore it?`);
                        if (restore) setFormData(parsed.formData);
                        else localStorage.removeItem('nidpo_form_backup');
                    }
                } catch (e) { console.error(e); }
            }
        }
    }, [currentUser.id, editingPatient, editingDraft]);

    const handleInputChange = (id: string, value: any) => {
        const updated = { ...formData, [id]: value };
        setFormData(updated);
        localStorage.setItem('nidpo_form_backup', JSON.stringify({ formData: updated, timestamp: new Date().toISOString(), userId: currentUser.id }));
    };

    const handleCheckboxChange = (fieldId: string, option: string, checked: boolean) => {
        const current = formData[fieldId] || [];
        const next = checked ? [...current, option] : current.filter((i: string) => i !== option);
        handleInputChange(fieldId, next);
    };

    const validateMonitoringTable = () => {
        let total = 0;
        for (let d = 1; d <= 14; d++) {
            ['morning', 'afternoon', 'night'].forEach(t => {
                if (formData[`glucose_day${d}_${t}`]?.trim()) total++;
            });
        }
        return total >= 42;
    };

    const handleSaveDraft = async () => {
        if (!formData.serialNumber) {
            showNotification('Institutional Code is required to save a draft.', 'error');
            return;
        }
        setIsSaving(true);
        try {
            const draftData = {
                user_id: currentUser.id,
                center_id: currentUser.centerId,
                patient_id: formData.serialNumber,
                form_data: formData,
                updated_at: new Date().toISOString()
            };
            const { data, error } = await supabase.from('drafts').upsert(draftData, { onConflict: 'user_id,patient_id,center_id' }).select().single();
            if (error) throw error;
            setDraftId(data.id);
            showNotification('Progress synced with registry cloud.', 'success');
        } catch (e: any) {
            showNotification(`Error: ${e.message}`, 'error');
        } finally { setIsSaving(false); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.serialNumber || !formData.age || !formData.sex) {
            showNotification('Missing mandatory Bio Data fields.', 'error');
            return;
        }
        
        // Monitoring table is mandatory for final submission
        if (!validateMonitoringTable()) {
            showNotification('Standard protocols require all 42 glucose readings (14 days x 3) for valid multicenter data.', 'error');
            // If we are not on the monitoring step, move there
            const monitoringIdx = formStructure.findIndex(s => s.fields.some(f => f.type === 'monitoring_table'));
            if (monitoringIdx !== -1) setCurrentStep(monitoringIdx);
            return;
        }

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
            if (draftId) await supabase.from('drafts').delete().eq('id', draftId);
            localStorage.removeItem('nidpo_form_backup');
            showNotification('Patient record successfully finalized and uploaded.', 'success');
            onPatientAdded();
        } catch (e: any) {
            showNotification(e.message, 'error');
        } finally { setIsSubmitting(false); }
    };

    const renderField = (field: FormField) => {
        if (field.condition && !field.condition(formData)) return null;
        return (
            <div key={field.id} className={`form-group ${field.type === 'monitoring_table' ? 'full-width' : ''}`}>
                <label>{field.label}</label>
                {field.type === 'radio' ? (
                    <div className="radio-group">
                        {field.options?.map(opt => (
                            <label key={opt}>
                                <input type="radio" value={opt} checked={formData[field.id] === opt} onChange={() => handleInputChange(field.id, opt)} /> {opt}
                            </label>
                        ))}
                    </div>
                ) : field.type === 'checkbox' ? (
                    <div className="checkbox-group">
                        {field.options?.map(opt => (
                            <label key={opt}>
                                <input type="checkbox" checked={formData[field.id]?.includes(opt)} onChange={e => handleCheckboxChange(field.id, opt, e.target.checked)} /> {opt}
                            </label>
                        ))}
                    </div>
                ) : field.type === 'monitoring_table' ? (
                    <MonitoringTable formData={formData} handleInputChange={handleInputChange} />
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
                        <button type="button" className="btn btn-outline" onClick={handleSaveDraft} disabled={isSaving}>
                            <IconSave /> {isSaving ? 'Syncing...' : 'Save Draft'}
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

export function PatientsPage({ currentUser, onEditPatient, showNotification }: any) {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPatients = async () => {
        setLoading(true);
        let query = supabase.from('patients').select('*, centers(name)').order('dateAdded', { ascending: false });
        if (currentUser.role !== 'admin') query = query.eq('centerId', currentUser.centerId);
        const { data } = await query;
        setPatients(data as Patient[] || []);
        setLoading(false);
    };

    useEffect(() => { fetchPatients(); }, []);

    const exportToCsv = () => {
        const fields: string[] = [];
        formStructure.forEach(s => s.fields.forEach(f => {
            if (f.type === 'monitoring_table') {
                for (let d = 1; d <= 14; d++) ['morning', 'afternoon', 'night'].forEach(t => fields.push(`glucose_day${d}_${t}`));
            } else fields.push(f.id);
        }));

        const headers = ['Serial Number', 'Age', 'Sex', 'Center', 'Date Added', ...fields];
        const rows = patients.map(p => {
            const base = [p.patientId, p.age, p.sex, p.centers?.name, p.dateAdded];
            const dynamic = fields.map(f => {
                const val = p.formData?.[f];
                return Array.isArray(val) ? val.join('; ') : val || '';
            });
            return [...base, ...dynamic].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
        });

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const link = document.createElement('a');
        link.setAttribute('href', encodeURI(csvContent));
        link.setAttribute('download', `NIDPO_Registry_Export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showNotification('Multicenter outcomes data exported to CSV.', 'success');
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Permanently delete this patient record?')) return;
        const { error } = await supabase.from('patients').delete().eq('id', id);
        if (error) showNotification(error.message, 'error');
        else fetchPatients();
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Patient Registry</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Standardized outcomes database across all centers.</p>
                </div>
                <button className="btn btn-outline" onClick={exportToCsv}><IconExport /> Export Multi-Center CSV</button>
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
                                            <button className="btn-icon" title="Delete Entry" style={{ color: '#ef4444' }} onClick={() => handleDelete(p.id)}><IconTrash /></button>
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
    const [drafts, setDrafts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchDrafts = async () => {
        setLoading(true);
        let query = supabase.from('drafts').select('*').order('updated_at', { ascending: false });
        if (currentUser.role !== 'admin') query = query.eq('user_id', currentUser.id);
        const { data } = await query;
        setDrafts(data || []);
        setLoading(false);
    };

    useEffect(() => { fetchDrafts(); }, []);

    const handleDelete = async (id: number) => {
        if (!confirm('Discard this draft?')) return;
        await supabase.from('drafts').delete().eq('id', id);
        fetchDrafts();
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div>
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Draft Entries</h1>
                <p style={{ color: 'var(--text-muted)' }}>In-progress registry forms synced to your research session.</p>
            </div>
            {drafts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '5rem', background: 'white', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
                    <h2 style={{ fontWeight: 800 }}>No Active Drafts</h2>
                    <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0.5rem auto' }}>Use the "Save Draft" button in the Patient Form to store your progress.</p>
                </div>
            ) : (
                <div className="table-card">
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Patient ID</th>
                                    <th>Bio Info</th>
                                    <th>Last Updated</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {drafts.map(d => (
                                    <tr key={d.id}>
                                        <td style={{ fontWeight: 700 }}>{d.patient_id}</td>
                                        <td>{d.form_data?.age || 'N/A'}Y • {d.form_data?.sex || 'N/A'}</td>
                                        <td style={{ color: 'var(--text-muted)' }}>{new Date(d.updated_at).toLocaleString()}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button className="btn-icon" title="Continue Entry" onClick={() => onEditDraft(d)}><IconEdit /></button>
                                                <button className="btn-icon" title="Discard" style={{ color: '#ef4444' }} onClick={() => handleDelete(d.id)}><IconTrash /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
