
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from './supabaseClient';
import { LoadingSpinner, IconEdit, IconTrash, IconExport, ProgressBar } from './shared-components';
import { UserProfile, Patient, FormField } from './types';
import { formStructure } from './constants';

export function PatientsPage({ currentUser, showNotification, onEditPatient }: { currentUser: UserProfile, showNotification: (m: string, t: 'success' | 'error') => void, onEditPatient: (p: Patient) => void }) {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchPatients = async () => {
            setLoading(true);
            let query = supabase.from('patients').select('*, centers(name)');
            if (currentUser.role !== 'admin') query = query.eq('centerId', currentUser.centerId);
            const { data, error } = await query.order('dateAdded', { ascending: false });
            if (error) showNotification('Error fetching patients: ' + error.message, 'error');
            else setPatients(data as Patient[]);
            setLoading(false);
        };
        fetchPatients();
    }, [currentUser, showNotification]);

    const filteredPatients = useMemo(() => patients.filter(p => p.patientId.toLowerCase().includes(searchTerm.toLowerCase())), [patients, searchTerm]);
    
    const exportToCsv = () => {
        const allFormFields: string[] = [];
        formStructure.forEach(section => {
            section.fields.forEach(field => {
                if (field.type !== 'monitoring_table') allFormFields.push(field.id);
                else for (let day = 1; day <= 14; day++) ['morning', 'afternoon', 'night'].forEach(time => allFormFields.push(`glucose_day${day}_${time}`));
            });
        });
        const headers = ['Patient ID', 'Age', 'Sex', 'Center', 'Date Added', ...allFormFields];
        const rows = filteredPatients.map(p => {
            const baseData = [p.patientId, p.age, p.sex, p.centers?.name || 'N/A', p.dateAdded];
            const formDataValues = allFormFields.map(fieldId => {
                let value = p.formData?.[fieldId];
                if (value === undefined || value === null) {
                    if (fieldId === 'serialNumber') value = p.patientId;
                    else if (fieldId === 'age') value = p.age;
                    else if (fieldId === 'sex') value = p.sex;
                    else if (fieldId === 'centerId') value = p.centerId;
                }
                if (value === undefined || value === null) return '';
                if (Array.isArray(value)) return value.join('; ');
                return value;
            });
            return [...baseData, ...formDataValues];
        });
        const escapeCsvField = (f: any) => {
            const s = String(f);
            if (s.includes(',') || s.includes('"') || s.includes('\n')) return `"${s.replace(/"/g, '""')}"`;
            return s;
        };
        const csvContent = headers.map(escapeCsvField).join(",") + "\n" + rows.map(r => r.map(escapeCsvField).join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.setAttribute("href", URL.createObjectURL(blob));
        link.setAttribute("download", `patients_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
        showNotification(`Exported ${rows.length} patients successfully`, 'success');
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div>
            <div className="page-header"><h1>Patient Data</h1></div>
            <div className="table-container">
                <div className="table-controls">
                    <input type="text" placeholder="Search by Patient ID..." className="search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    <div className="table-actions"><button className="btn" onClick={exportToCsv}><IconExport /> Export CSV</button></div>
                </div>
                <div className="table-wrapper">
                    <table>
                        <thead><tr><th>Patient ID</th><th>Age</th><th>Sex</th><th>Center</th><th>Date Added</th><th>Actions</th></tr></thead>
                        <tbody>
                            {filteredPatients.map(patient => (
                                <tr key={patient.id}>
                                    <td>{patient.patientId}</td><td>{patient.age}</td><td>{patient.sex}</td><td>{patient.centers?.name || 'N/A'}</td><td>{new Date(patient.dateAdded).toLocaleDateString()}</td>
                                    <td className="actions-cell"><button onClick={() => onEditPatient(patient)} aria-label={`Edit patient ${patient.patientId}`} className="btn-icon"><IconEdit /></button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export function DraftsPage({ currentUser, showNotification, onEditDraft }: { currentUser: UserProfile, showNotification: (m: string, t: 'success' | 'error') => void, onEditDraft: (d: any) => void }) {
    const [drafts, setDrafts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchDrafts = useCallback(async () => {
        setLoading(true);
        try {
            let query = supabase.from('drafts').select('*');
            if (currentUser.role !== 'admin') query = query.eq('user_id', currentUser.id);
            const { data, error } = await query.order('updated_at', { ascending: false });
            if (error) throw error;
            setDrafts(data || []);
        } catch (error: any) { showNotification('Error fetching drafts: ' + error.message, 'error'); }
        finally { setLoading(false); }
    }, [currentUser, showNotification]);

    useEffect(() => { fetchDrafts(); }, [fetchDrafts]);

    const handleDeleteDraft = async (draftId: number) => {
        if (!confirm('Are you sure?')) return;
        const { error } = await supabase.from('drafts').delete().eq('id', draftId);
        if (error) showNotification('Error deleting draft: ' + error.message, 'error');
        else { showNotification('Draft deleted successfully', 'success'); fetchDrafts(); }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div>
            <div className="page-header"><h1>Draft Forms</h1></div>
            {drafts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}><p>No drafts found.</p></div>
            ) : (
                <div className="table-container"><div className="table-wrapper"><table>
                    <thead><tr><th>Patient ID</th><th>Age</th><th>Sex</th><th>Last Updated</th><th>Actions</th></tr></thead>
                    <tbody>
                        {drafts.map(draft => (
                            <tr key={draft.id}>
                                <td>{draft.patient_id || 'N/A'}</td><td>{draft.form_data?.age || 'N/A'}</td><td>{draft.form_data?.sex || 'N/A'}</td><td>{new Date(draft.updated_at).toLocaleString()}</td>
                                <td className="actions-cell">
                                    <button onClick={() => onEditDraft(draft)} className="btn-icon"><IconEdit /></button>
                                    <button onClick={() => handleDeleteDraft(draft.id)} className="btn-icon" style={{ color: '#dc3545' }}><IconTrash /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table></div></div>
            )}
        </div>
    );
}

const MonitoringTable = ({ formData, handleInputChange }: { formData: any, handleInputChange: (id: string, v: any) => void }) => {
    const days = Array.from({ length: 14 }, (_, i) => i + 1);
    const times = ['morning', 'afternoon', 'night'];
    const timeLabels = ['Morning', 'Afternoon', 'Night'];
    return (
        <div className="monitoring-table-wrapper"><table className="monitoring-table">
            <thead><tr><th>Day</th>{timeLabels.map(t => <th key={t}>{t}</th>)}</tr></thead>
            <tbody>
                {days.map(day => (
                    <tr key={day}>
                        <td className="day-cell">Day {day}</td>
                        {times.map((time, idx) => (
                            <td key={time} data-label={timeLabels[idx]}>
                                <input type="text" value={formData[`glucose_day${day}_${time}`] || ''} onChange={e => handleInputChange(`glucose_day${day}_${time}`, e.target.value)} placeholder="mg/dL" />
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table></div>
    );
};

export function AddPatientPage({ showNotification, onPatientAdded, currentUser, editingPatient, editingDraft, isReconnecting }: { showNotification: (m: string, t: 'success' | 'error') => void, onPatientAdded: () => void, currentUser: UserProfile, editingPatient?: Patient | null, editingDraft?: any | null, isReconnecting: boolean }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState<any>(editingPatient?.formData || editingDraft?.form_data || {});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [draftId, setDraftId] = useState<number | null>(editingDraft?.id || null);
    const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);

    useEffect(() => {
        if (editingPatient) { setFormData(editingPatient.formData || {}); setDraftId(null); }
        else if (editingDraft) { setFormData(editingDraft.form_data || {}); setDraftId(editingDraft.id); }
    }, [editingPatient, editingDraft]);

    useEffect(() => {
        if (!editingPatient && !editingDraft) {
            const backup = localStorage.getItem('nidipo_form_backup');
            if (backup) {
                try {
                    const parsed = JSON.parse(backup);
                    if (parsed.userId === currentUser.id && (Date.now() - new Date(parsed.timestamp).getTime()) / (1000 * 60 * 60) < 24) {
                        if (window.confirm('Restore recent backup?')) { setFormData(parsed.formData); showNotification('Restored from backup', 'success'); }
                        else localStorage.removeItem('nidipo_form_backup');
                    }
                } catch (e) { console.error(e); }
            }
        }
    }, [editingPatient, editingDraft, currentUser.id, showNotification]);

    const handleInputChange = (fId: string, v: any) => {
        const newData = { ...formData, [fId]: v }; setFormData(newData);
        localStorage.setItem('nidipo_form_backup', JSON.stringify({ formData: newData, timestamp: new Date().toISOString(), userId: currentUser.id }));
    };

    const handleCheckboxChange = (fId: string, opt: string, chk: boolean) => {
        const vals = formData[fId] || [];
        const newVals = chk ? [...vals, opt] : vals.filter((i: string) => i !== opt);
        handleInputChange(fId, newVals);
    };

    const validateForm = () => {
        const missing: string[] = [];
        formStructure.forEach(sec => sec.fields.forEach(f => {
            if (f.condition && !f.condition(formData)) return;
            if (f.type === 'monitoring_table' && f.required) {
                let total = 0; for (let d = 1; d <= 14; d++) ['morning', 'afternoon', 'night'].forEach(t => { if (formData[`glucose_day${d}_${t}`]?.trim()) total++; });
                if (total < 42) missing.push(`${sec.title}: ${f.label} - All readings required.`);
            } else if (f.required) {
                const v = formData[f.id]; if (!v || (Array.isArray(v) && v.length === 0)) missing.push(`${sec.title}: ${f.label}`);
            }
        }));
        return { isValid: missing.length === 0, missing };
    };

    const handleSaveDraft = async () => {
        if (!formData.serialNumber) { showNotification('Enter Serial Number first', 'error'); return; }
        setIsSaving(true);
        const draftData = {
            user_id: currentUser.id, center_id: (currentUser.role === 'admin' && formData.centerId ? parseInt(formData.centerId) : currentUser.centerId),
            patient_id: formData.serialNumber, form_data: formData, updated_at: new Date().toISOString()
        };
        try {
            const { data, error } = await supabase.from('drafts').upsert(draftData, { onConflict: 'user_id,patient_id,center_id' }).select().single();
            if (error) throw error; setDraftId(data.id); setLastSaveTime(new Date()); showNotification('Draft saved!', 'success');
        } catch (e: any) { showNotification(`Save error: ${e.message}`, 'error'); }
        finally { setIsSaving(false); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const v = validateForm(); if (!v.isValid) { showNotification(`Missing: ${v.missing[0]}`, 'error'); return; }
        setIsSubmitting(true);
        try {
            const core = { patientId: formData.serialNumber, age: formData.age, sex: formData.sex, centerId: (currentUser.role === 'admin' && formData.centerId ? parseInt(formData.centerId) : currentUser.centerId) };
            const { error } = editingPatient ? await supabase.from('patients').update({ ...core, formData }).eq('id', editingPatient.id) : await supabase.from('patients').insert({ ...core, formData });
            if (error) throw error;
            if (draftId) await supabase.from('drafts').delete().eq('id', draftId);
            localStorage.removeItem('nidipo_form_backup'); showNotification('Submitted!', 'success'); onPatientAdded();
        } catch (e: any) { showNotification(`Error: ${e.message}`, 'error'); }
        finally { setIsSubmitting(false); }
    };

    const renderField = (field: FormField) => {
        if (field.condition && !field.condition(formData)) return null;
        const common = { id: field.id, value: formData[field.id] || '', onChange: (e: any) => handleInputChange(field.id, e.target.value) };
        return (
            <div key={field.id} className={`form-group ${field.gridColumns === 1 ? 'full-width' : ''}`}>
                <label htmlFor={field.id}>{field.label}</label>
                {field.type === 'text' && <input type="text" {...common} />}
                {field.type === 'number' && <input type="number" {...common} />}
                {field.type === 'textarea' && <textarea {...common} rows={3} />}
                {field.type === 'radio' && (
                    <div className="radio-group">{field.options?.map(o => (
                        <label key={o}><input type="radio" name={field.id} value={o} checked={formData[field.id] === o} onChange={e => handleInputChange(field.id, e.target.value)} />{o}</label>
                    ))}</div>
                )}
                {field.type === 'checkbox' && (
                    <div className="checkbox-group">{field.options?.map(o => (
                        <label key={o}><input type="checkbox" checked={formData[field.id]?.includes(o) || false} onChange={e => handleCheckboxChange(field.id, o, e.target.checked)} />{o}</label>
                    ))}</div>
                )}
                {field.type === 'monitoring_table' && <MonitoringTable formData={formData} handleInputChange={handleInputChange} />}
                {field.helpText && <p className="help-text">{field.helpText}</p>}
            </div>
        );
    };

    return (
        <div className="form-page-container">
            <div className="page-header"><h1>{editingPatient ? 'Edit Form' : 'Add New Entry'}</h1>{lastSaveTime && <p>Last saved: {lastSaveTime.toLocaleTimeString()}</p>}</div>
            <div className="form-content-wrapper">
                <ProgressBar currentStep={currentStep} steps={formStructure.map(s => s.title)} onStepClick={setCurrentStep} />
                <form onSubmit={handleSubmit}>
                    <h2>{formStructure[currentStep].title}</h2>
                    <div className="form-step-fields">{formStructure[currentStep].fields.map(renderField)}</div>
                    <div className="form-navigation">
                        <button type="button" className="btn btn-secondary" onClick={() => setCurrentStep(p => Math.max(0, p-1))} disabled={currentStep === 0 || isSubmitting || isSaving}>Previous</button>
                        <div className="form-navigation-steps">
                            <button type="button" className="btn btn-secondary" onClick={handleSaveDraft} disabled={isSaving || isSubmitting || !formData.serialNumber}>Save Draft</button>
                            {currentStep < formStructure.length - 1 ? 
                                <button type="button" className="btn" onClick={() => setCurrentStep(p => p+1)} disabled={isSubmitting || isSaving}>Next</button> :
                                <button type="submit" className="btn" disabled={isSubmitting || isSaving}>{isSubmitting ? 'Submitting...' : 'Submit'}</button>
                            }
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
