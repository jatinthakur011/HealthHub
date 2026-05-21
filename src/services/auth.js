import api from '../conf/api.js'

export class AuthServices {

    async createAccount({email, password, name}){
        const res = await fetch(`${api.apiBaseUrl}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name })
        })
        if (!res.ok) throw new Error('Signup failed')
        return this.login({ email, password })
    }

    async login({email, password}){
        const res = await fetch(`${api.apiBaseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        })
        if (!res.ok) throw new Error('Login failed')
        const data = await res.json()
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
        localStorage.removeItem('token')
    }
}

const authServices = new AuthServices();

export default authServices;



