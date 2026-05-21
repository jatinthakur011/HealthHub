import api from '../conf/api.js'

export class Services {

    async getMessages(){
        try {
            const res = await fetch(`${api.apiBaseUrl}/messages`, { credentials: 'include' })
            if (!res.ok) throw new Error('Failed to fetch messages')
            return await res.json()
        } catch (error) {
            console.log("API service :: getMessages :: error", error);
            return { documents: [] }
        }
    }

    async createMessage(payload){
        try {
            const res = await fetch(`${api.apiBaseUrl}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                credentials: 'include'
            })
            if (!res.ok) throw new Error('Failed to create message')
            return await res.json()
        } catch (error) {
            console.log("API service :: createMessage :: error", error);
        }
    }

    async updateMessage(id, body){
        try {
            const res = await fetch(`${api.apiBaseUrl}/messages/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ body }),
                credentials: 'include'
            })
            if (!res.ok) throw new Error('Failed to update message')
            return await res.json()
        } catch (error) {
            console.log("API service :: updateMessage :: error", error);
        }
    }

    async deleteMessage(id){
        try {
            const res = await fetch(`${api.apiBaseUrl}/messages/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            })
            if (!res.ok) throw new Error('Failed to delete message')
            return true
        } catch (error) {
            console.log("API service :: deleteMessage :: error", error);
            return false
        }
    }

    async clearChat(doctorId, userId){
        try {
            const res = await fetch(`${api.apiBaseUrl}/messages/clear/${doctorId}/${userId}`, {
                method: 'DELETE',
                credentials: 'include'
            })
            if (!res.ok) throw new Error('Failed to clear chat')
            return true
        } catch (error) {
            console.log("API service :: clearChat :: error", error);
        }
    }
}

const service = new Services();

export default service;


