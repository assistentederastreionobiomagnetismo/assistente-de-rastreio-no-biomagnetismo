import { supabase } from '../lib/supabase';
import { Patient, Session, BiomagneticPair, User, ConsentForm, Product, Tutorial } from '../types';

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
            whatsapp: u.whatsapp,
            planType: u.plan_type,
            extraSessions: u.extra_sessions,
            sessionPackages: u.session_packages,
            paymentStatus: u.payment_status,
            paymentProofUrl: u.payment_proof_url,
            createdAt: u.created_at
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
                requires_password_change: user.requiresPasswordChange,
                plan_type: user.planType || 'trial',
                extra_sessions: user.extraSessions || 0,
                session_packages: user.sessionPackages || [],
                payment_status: user.paymentStatus || 'none',
                payment_proof_url: user.paymentProofUrl
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
    },

    // Products / Store
    async getProducts(): Promise<Product[]> {
        if (!supabase) return [];
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('display_order', { ascending: true });
        if (error) throw error;
        return (data || []).map(p => ({
            id: p.id,
            title: p.title,
            description: p.description,
            copyText: p.copy_text,
            imageUrls: p.image_urls || [],
            videoUrls: p.video_urls || [],
            affiliateLink: p.affiliate_link,
            ctaText: p.cta_text,
            isFeatured: p.is_featured,
            displayOrder: p.display_order,
            createdAt: p.created_at
        }));
    },

    async saveProduct(product: Product): Promise<void> {
        if (!supabase) return;
        const { error } = await supabase
            .from('products')
            .upsert({
                id: product.id || undefined,
                title: product.title,
                description: product.description,
                copy_text: product.copyText,
                image_urls: product.imageUrls,
                video_urls: product.videoUrls,
                affiliate_link: product.affiliateLink,
                cta_text: product.ctaText,
                is_featured: product.isFeatured,
                display_order: product.displayOrder
            });
        if (error) throw error;
    },

    async deleteProduct(id: string): Promise<void> {
        if (!supabase) return;
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },

    async uploadStoreMedia(file: File): Promise<string> {
        if (!supabase) throw new Error("Supabase não configurado");

        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('store-media')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('store-media')
            .getPublicUrl(filePath);

        return publicUrl;
    },

    // Tutorials
    async getTutorials(): Promise<Tutorial[]> {
        if (!supabase) return [];
        const { data, error } = await supabase
            .from('tutorials')
            .select('*')
            .order('display_order', { ascending: true });
        if (error) throw error;
        return data.map(t => ({
            id: t.id,
            title: t.title,
            category: t.category,
            videoUrl: t.video_url,
            description: t.description,
            displayOrder: t.display_order,
            createdAt: t.created_at
        }));
    },

    async saveTutorial(tutorial: Tutorial): Promise<void> {
        if (!supabase) return;
        const { error } = await supabase
            .from('tutorials')
            .upsert({
                id: tutorial.id,
                title: tutorial.title,
                category: tutorial.category,
                video_url: tutorial.videoUrl,
                description: tutorial.description,
                display_order: tutorial.displayOrder
            });
        if (error) throw error;
    },

    async deleteTutorial(id: string): Promise<void> {
        if (!supabase) return;
        const { error } = await supabase
            .from('tutorials')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },

    // Usage Logs
    async logUsage(username: string, sessionId: string): Promise<void> {
        if (!supabase) return;
        const { error } = await supabase
            .from('usage_logs')
            .insert({ username, session_id: sessionId });
        if (error) throw error;
    },

    async getCycleUsage(username: string, cycleStart: Date): Promise<number> {
        if (!supabase) return 0;

        const { count, error } = await supabase
            .from('usage_logs')
            .select('*', { count: 'exact', head: true })
            .eq('username', username)
            .gte('created_at', cycleStart.toISOString());
        
        if (error) throw error;
        return count || 0;
    },

    // Settings / Config
    async getSettings(): Promise<{[key: string]: string}> {
        if (!supabase) return {};
        const { data, error } = await supabase
            .from('settings')
            .select('*');
        if (error) return {};
        return (data || []).reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});
    },

    async updateSetting(key: string, value: string): Promise<void> {
        if (!supabase) return;
        const { error } = await supabase
            .from('settings')
            .upsert({ key, value, updated_at: new Date().toISOString() });
        if (error) throw error;
    }
};
