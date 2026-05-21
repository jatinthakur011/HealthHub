import api from "../conf/api.js";

export class DocServices {

    async createPost({name, description, doctorImage,
    status, user_id, title}) {
        try {
            const token = localStorage.getItem('doctor_token') || localStorage.getItem('token') || null;
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;
            const res = await fetch(`${api.apiBaseUrl}/doctors`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ name, description, status, user_id, doctorImage, title })
            })
            if (!res.ok) throw new Error('Failed to create doctor')
            return await res.json()
        } 
        catch (error) {
            console.log("API service :: createPost :: error",
            error);
        }
    }

    async updatePost(id, {name, description, doctorImage,
    status, title}){
        try {
            const token = localStorage.getItem('doctor_token') || localStorage.getItem('token') || null;
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;
            const res = await fetch(`${api.apiBaseUrl}/doctors/${id}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ name, description, doctorImage, status, title })
            })
            if (!res.ok) throw new Error('Failed to update doctor')
            return await res.json()
        } 
        catch (error) {
            console.log("API service :: updatePost :: error",
            error);
        }
    }

    async updateRequests(id, requests) {
        try {
            const res = await fetch(`${api.apiBaseUrl}/doctors/${id}/requests`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requests })
            })
            if (!res.ok) throw new Error('Failed to update requests')
            return await res.json()
        } catch (error) {
            console.log("API service :: updateRequests :: error", error);
            throw error;
        }
    }
    

    async deletePost(id){
        try {
            const token = localStorage.getItem('doctor_token') || localStorage.getItem('token') || null;
            const headers = {};
            if (token) headers['Authorization'] = `Bearer ${token}`;
            const res = await fetch(`${api.apiBaseUrl}/doctors/${id}`, { method: 'DELETE', headers })
            if (!res.ok) throw new Error('Failed to delete doctor')
            return true;
        } 
        catch (error) {
            console.log("API service :: deletePost :: error",
            error);
            return false;
        }
    }

    async getPost(id){
        try {
            const token = localStorage.getItem('doctor_token') || localStorage.getItem('token') || null;
            const headers = {};
            if (token) headers['Authorization'] = `Bearer ${token}`;
            const res = await fetch(`${api.apiBaseUrl}/doctors/${id}`, { headers })
            if (!res.ok) throw new Error('Failed to fetch doctor')
            return await res.json()
        } 
        catch (error) {
            console.log("API service :: getPost :: error",
            error);
            return false;
        }
    }

    async getDoctor(id){
        try {
            const res = await fetch(`${api.apiBaseUrl}/doctors/${id}`)
            if (!res.ok) throw new Error('Failed to fetch doctor')
            return await res.json()
        } 
        catch (error) {
            console.log("API service :: getDoctor :: error", error);
            throw error;
        }
    }

    async getDoctorForManagement(id){
        try {
            const token = localStorage.getItem('doctor_token')
            if (!token) throw new Error('No authentication token')
            
            const res = await fetch(`${api.apiBaseUrl}/doctors/${id}/manage`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (!res.ok) {
                if (res.status === 401) throw new Error('Unauthorized')
                if (res.status === 403) throw new Error('Access denied - you can only manage your own bookings')
                throw new Error('Failed to fetch doctor')
            }
            return await res.json()
        } 
        catch (error) {
            console.log("API service :: getDoctorForManagement :: error", error);
            throw error;
        }
    }

    async getPosts(){
        try {
            const token = localStorage.getItem('doctor_token') || localStorage.getItem('token') || null;
            const headers = {};
            if (token) headers['Authorization'] = `Bearer ${token}`;
            const res = await fetch(`${api.apiBaseUrl}/doctors`, { headers })
            if (!res.ok) throw new Error('Failed to fetch doctors')
            return await res.json()
        } 
        catch (error) {
            console.log("API service :: getPosts :: error",
            error);
            return false;
        }
    }

    async doctorLogin({ email, password }){
        const res = await fetch(`${api.apiBaseUrl}/doctors/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        })
        if (!res.ok) throw new Error('Doctor login failed')
        const data = await res.json()
        
        localStorage.setItem('doctor_token', data.token)
        try {
            const doctorInfo = data.doctor || data.doctorData || null
            if (doctorInfo) localStorage.setItem('doctor_info', JSON.stringify(doctorInfo))
        } catch (e) {
        }
        return data
    }

    async getCurrentDoctor(){
        const token = localStorage.getItem('doctor_token')
        if (!token) return null
        const res = await fetch(`${api.apiBaseUrl}/doctors/me`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        if (!res.ok) {
            try {
                const stored = localStorage.getItem('doctor_info')
                if (stored) return JSON.parse(stored)
            } catch (e) { /* ignore */ }
            return null
        }
        const json = await res.json()
        try { localStorage.setItem('doctor_info', JSON.stringify(json)) } catch (e) {}
        return json
    }

    async uploadFile(file){
        try {
            const form = new FormData()
            form.append('file', file)
            const token = localStorage.getItem('doctor_token') || localStorage.getItem('token') || null;
            const headers = {};
            if (token) headers['Authorization'] = `Bearer ${token}`;
            const res = await fetch(`${api.apiBaseUrl}/uploads`, {
                method: 'POST',
                headers,
                body: form
            })
            if (!res.ok) throw new Error('Failed to upload file')
            return await res.json()
        } 
        catch (error) {
            console.log("API service :: uploadFile :: error",
            error);
            return false;
        }
    }

    async deleteFile(fileId){
        return true;
    }

    getFilePreview(fileId){
        return `${api.apiBaseUrl.replace('/api','')}/uploads/${fileId}`
    }
}

const docService = new DocServices();

export default docService;



