import api from '../conf/api.js'

export class AuthServices {

    async createAccount({email, password, name}){
        const res = await fetch(`${api.apiBaseUrl}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name })
        })
        const payload = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(payload.message || 'Signup failed')
        return this.login({ email, password })
    }

    async login({email, password}){
        const res = await fetch(`${api.apiBaseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.message || 'Login failed')
        localStorage.setItem('token', data.token)
        return data
    }

    async getCurrentUser(){
        const token = localStorage.getItem('token')
        if (!token) return null
        const res = await fetch(`${api.apiBaseUrl}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        if (!res.ok) return null
        return await res.json()
    }

    async logout(){
        try {
            localStorage.removeItem('token')
            localStorage.removeItem('doctor_token')
            localStorage.removeItem('doctor_info')
        } catch (e) {}
    }
}

const authServices = new AuthServices();

export default authServices;



