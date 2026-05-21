import api from "../conf/api.js";

export class DocServices {

    async createPost(raw) {
        try {
            const {
                name, email, password, description, doctorImage,
                status, user_id, title, degree, gender, availability, zone,
                degrees,
            } = raw
            const deg = degree || degrees
            const token = localStorage.getItem('doctor_token') || localStorage.getItem('token') || null;
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;
            const res = await fetch(`${api.apiBaseUrl}/doctors`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    description,
                    status,
                    user_id,
                    doctorImage,
                    title,
                    degree: deg,
                    gender,
                    availability,
                    zone,
                })
            })
            if (!res.ok) throw new Error('Failed to create doctor')
            return await res.json()
        } 
        catch (error) {
            console.log("API service :: createPost :: error",
            error);
        }
    }

    async updatePost(id, payload){
        try {
            const body = { ...payload }
            delete body.image
            if (!body.password) delete body.password
            if (body.degrees != null && body.degree == null) {
                body.degree = typeof body.degrees === 'string' ? body.degrees : String(body.degrees)
            }
            delete body.degrees
            console.debug('authDoc.updatePost called', { id, keys: Object.keys(body) })
            const token = localStorage.getItem('doctor_token') || localStorage.getItem('token') || null;
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;
            const res = await fetch(`${api.apiBaseUrl}/doctors/${id}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(body)
            })
            if (!res.ok) {
                let parsed
                try { parsed = await res.clone().json() } catch (e) { parsed = null }
                const errMsg = parsed && (parsed.message || parsed.error) ? (parsed.message || parsed.error) : (res.statusText || `Status ${res.status}`)
                console.error('authDoc.updatePost response not ok', res.status, errMsg, parsed)
                const err = new Error(errMsg)
                err.status = res.status
                throw err
            }
            return await res.json()
        } 
        catch (error) {
            console.error("API service :: updatePost :: error", error);
            throw error
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



