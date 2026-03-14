import { supabase } from '../lib/supabase';
import { Patient, Session, BiomagneticPair, User, ConsentForm } from '../types';

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
            requiresPasswordChange: u.requires_password_change,
            email: u.email,
            whatsapp: u.whatsapp
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
                email: user.email,
                whatsapp: user.whatsapp,
                is_approved: user.isApproved,
                approval_type: user.approvalType,
                approval_expiry: user.approvalExpiry,
                requires_password_change: user.requiresPasswordChange
            }, { onConflict: 'username' });
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

    async resetUserPassword(username: string, tempPassword: string): Promise<void> {
        if (!supabase) return;
        const { error } = await supabase
            .from('profiles')
            .update({
                password: tempPassword,
                requires_password_change: true
            })
            .eq('username', username);
        if (error) throw error;
    },

    // Patients
    async getPatients(therapistUsername: string): Promise<Patient[]> {
        if (!supabase) return [];
        const normalizedUsername = therapistUsername.toLowerCase();
        const { data, error } = await supabase
            .from('patients')
            .select('*')
            .ilike('therapist_username', normalizedUsername);
        if (error) throw error;
        return (data || []).map(p => ({
            id: p.id,
            name: p.name,
            birthDate: p.birth_date,
            age: p.age,
            email: p.email,
            phone: p.phone,
            mainComplaint: p.main_complaint
        }));
    },

    async savePatient(therapistUsername: string, patient: Patient): Promise<void> {
        if (!supabase) return;
        const normalizedUsername = therapistUsername.toLowerCase();
        const { error } = await supabase
            .from('patients')
            .upsert({
                id: patient.id,
                therapist_username: normalizedUsername,
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
        const normalizedUsername = therapistUsername.toLowerCase();
        const { error } = await supabase
            .from('patients')
            .delete()
            .eq('id', id)
            .ilike('therapist_username', normalizedUsername);
        if (error) throw error;
    },

    // Sessions
    async getSessions(therapistUsername: string): Promise<Session[]> {
        if (!supabase) return [];
        const normalizedUsername = therapistUsername.toLowerCase();
        const { data, error } = await supabase
            .from('sessions')
            .select('*')
            .ilike('therapist_username', normalizedUsername)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return (data || []).map(s => ({
            ...s.data,
            id: s.id,
            startTime: s.start_time ? new Date(s.start_time) : null,
            endTime: s.end_time ? new Date(s.end_time) : null
        }));
    },

    async saveSession(therapistUsername: string, session: Session): Promise<void> {
        if (!supabase) return;
        const normalizedUsername = therapistUsername.toLowerCase();
        
        // Ensure to stringify complex objects if necessary, though supabase JS client
        // handles objects mapped to JSONB fields automatically.
        const sessionData = {
            ...session,
            safetyCheck: session.safetyCheck,
            consentForm: session.consentForm,
            scalesBefore: session.scalesBefore,
            scalesAfter: session.scalesAfter,
        };

        const { error } = await supabase
            .from('sessions')
            .upsert({
                id: session.id,
                therapist_username: normalizedUsername,
                patient_id: session.patient.id,
                data: sessionData,
                start_time: session.startTime,
                end_time: session.endTime
            });
        if (error) throw error;
    },

    async deleteSession(id: string, therapistUsername: string): Promise<void> {
        if (!supabase) return;
        const normalizedUsername = therapistUsername.toLowerCase();
        const { error } = await supabase
            .from('sessions')
            .delete()
            .eq('id', id)
            .ilike('therapist_username', normalizedUsername);
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
        return data.map(p => ({
            ...p,
            imageUrl: p.image_url,
            isCustom: p.is_custom,
            isDefinitive: p.is_definitive
        }));
    },

    async savePairs(pairs: BiomagneticPair[]): Promise<void> {
        if (!supabase) return;
        const { error } = await supabase
            .from('biomagnetic_pairs')
            .upsert(pairs.map(p => ({
                id: p.id,
                name: p.name,
                point1: p.point1,
                point2: p.point2,
                description: p.description,
                image_url: p.imageUrl,
                is_custom: p.isCustom,
                is_definitive: p.isDefinitive,
                level: p.level,
                order: p.order,
                details: p.details
            })), { onConflict: 'id' });
        if (error) throw error;
    },

    async deletePair(id: string): Promise<void> {
        if (!supabase) return;
        const { error } = await supabase
            .from('biomagnetic_pairs')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },

    async uploadPairImage(file: File): Promise<string> {
        if (!supabase) throw new Error("Supabase não configurado");

        // Gerar um nome de arquivo único
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError, data } = await supabase.storage
            .from('fotos-pares')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Gerar a URL pública
        const { data: { publicUrl } } = supabase.storage
            .from('fotos-pares')
            .getPublicUrl(filePath);

        return publicUrl;
    },

    // Remote Signatures
    async createPendingSignature(patientId: string, patientName: string, therapistUsername: string): Promise<string> {
        if (!supabase) throw new Error("Supabase não configurado");
        
        const { data, error } = await supabase
            .from('pending_signatures')
            .insert([{
                patient_id: patientId,
                patient_name: patientName,
                therapist_username: therapistUsername.toLowerCase(),
                status: 'pending'
            }])
            .select('id')
            .single();

        if (error) throw error;
        return data.id;
    },

    async checkPendingSignatureStatus(signatureId: string): Promise<{status: string, signedData: any} | null> {
        if (!supabase) return null;

        const { data, error } = await supabase
            .from('pending_signatures')
            .select('status, signed_data')
            .eq('id', signatureId)
            .single();

        if (error) return null;
        
        return {
            status: data.status,
            signedData: data.signed_data
        };
    },

    async completePendingSignature(signatureId: string, signedData: any): Promise<void> {
        if (!supabase) return;

        const { error } = await supabase
            .from('pending_signatures')
            .update({
                status: 'signed',
                signed_data: signedData
            })
            .eq('id', signatureId)
            .eq('status', 'pending');

        if (error) throw error;
    }
};
