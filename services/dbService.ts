import { supabase } from '../lib/supabase';
import { Patient, Session, BiomagneticPair, User } from '../types';

export const dbService = {
    // Profiles / Auth
    async getUsers(): Promise<User[]> {
        if (!supabase) return [];
        const { data, error } = await supabase
            .from('profiles')
            .select('*');
        if (error) throw error;
        return data.map(u => ({
            username: u.username,
            password: u.password,
            fullName: u.full_name,
            isApproved: u.is_approved,
            approvalType: u.approval_type,
            approvalExpiry: u.approval_expiry,
            requiresPasswordChange: u.requires_password_change
        }));
    },

    async updateUser(user: User): Promise<void> {
        if (!supabase) return;
        const { error } = await supabase
            .from('profiles')
            .upsert({
                username: user.username,
                password: user.password,
                full_name: user.fullName,
                is_approved: user.isApproved,
                approval_type: user.approvalType,
                approval_expiry: user.approvalExpiry,
                requires_password_change: user.requiresPasswordChange
            });
        if (error) throw error;
    },

    async deleteUser(username: string): Promise<void> {
        if (!supabase) return;
        const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('username', username);
        if (error) throw error;
    },

    // Patients
    async getPatients(therapistUsername: string): Promise<Patient[]> {
        if (!supabase) return [];
        const { data, error } = await supabase
            .from('patients')
            .select('*')
            .eq('therapist_username', therapistUsername);
        if (error) throw error;
        return data;
    },

    async savePatient(therapistUsername: string, patient: Patient): Promise<void> {
        if (!supabase) return;
        const { error } = await supabase
            .from('patients')
            .upsert({
                id: patient.id,
                therapist_username: therapistUsername,
                name: patient.name,
                birth_date: patient.birthDate,
                age: patient.age,
                email: patient.email,
                phone: patient.phone,
                main_complaint: patient.mainComplaint
            });
        if (error) throw error;
    },

    async deletePatient(id: string, therapistUsername: string): Promise<void> {
        if (!supabase) return;
        const { error } = await supabase
            .from('patients')
            .delete()
            .eq('id', id)
            .eq('therapist_username', therapistUsername);
        if (error) throw error;
    },

    // Sessions
    async getSessions(therapistUsername: string): Promise<Session[]> {
        if (!supabase) return [];
        const { data, error } = await supabase
            .from('sessions')
            .select('*')
            .eq('therapist_username', therapistUsername)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data.map(s => ({
            ...s.data,
            id: s.id,
            startTime: s.start_time ? new Date(s.start_time) : null,
            endTime: s.end_time ? new Date(s.end_time) : null
        }));
    },

    async saveSession(therapistUsername: string, session: Session): Promise<void> {
        if (!supabase) return;
        const { error } = await supabase
            .from('sessions')
            .upsert({
                id: session.id,
                therapist_username: therapistUsername,
                patient_id: session.patient.id,
                data: session,
                start_time: session.startTime,
                end_time: session.endTime
            });
        if (error) throw error;
    },

    // Biomagnetic Pairs
    async getPairs(): Promise<BiomagneticPair[]> {
        if (!supabase) return [];
        const { data, error } = await supabase
            .from('biomagnetic_pairs')
            .select('*')
            .order('order', { ascending: true });
        if (error) throw error;
        return data;
    },

    async savePairs(pairs: BiomagneticPair[]): Promise<void> {
        if (!supabase) return;
        const { error } = await supabase
            .from('biomagnetic_pairs')
            .upsert(pairs.map(p => ({
                ...p,
                // Garante mapeamento correto se necessário
            })));
        if (error) throw error;
    }
};
