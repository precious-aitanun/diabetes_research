
export type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'researcher' | 'data-entry';
  centerId: number | null;
  centers: { name: string } | null;
};

export type Center = {
  id: number;
  name: string;
  location: string;
};

export type Patient = {
  id: number;
  patientId: string;
  age: number;
  sex: string;
  centerId: number;
  dateAdded: string;
  centers: { name: string };
  formData?: any;
};

export type NotificationType = {
  id: number;
  message: string;
  type: 'success' | 'error';
};

export type Invitation = {
    email: string;
    role: 'admin' | 'researcher' | 'data-entry';
    centerId: number;
};

export type FormField = {
    id: string;
    label: string;
    type: 'text' | 'number' | 'radio' | 'checkbox' | 'monitoring_table' | 'textarea';
    options?: string[];
    required?: boolean;
    helpText?: string;
    condition?: (formData: any) => boolean;
    subFields?: FormField[];
    gridColumns?: number;
};

export type FormSection = {
    title: string;
    description?: string;
    fields: FormField[];
};

export type ViewState = 'dashboard' | 'patients' | 'add_patient' | 'drafts' | 'users' | 'centers';
