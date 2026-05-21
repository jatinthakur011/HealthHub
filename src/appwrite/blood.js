import api from '../conf/api.js'

export class BloodServices {

    async getMessages(){
        try {
            const res = await fetch(`${api.apiBaseUrl}/blood`)
            if (!res.ok) throw new Error('Failed to fetch blood requests')
            return await res.json()
        } catch (error) {
            console.log("API service :: getMessages :: error", error);
        }
    }

    async createMessage(payload){
        try {
            const res = await fetch(`${api.apiBaseUrl}/blood`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            if (!res.ok) throw new Error('Failed to create blood request')
            return await res.json()
        } catch (error) {
            console.log("API service :: createMessage :: error", error);
        }
    }

    async getMessage(id){
        try {
            const res = await fetch(`${api.apiBaseUrl}/blood/${id}`)
            if (!res.ok) throw new Error('Failed to fetch blood request')
            return await res.json()
        } 
        catch (error) {
            console.log("API service :: getPost :: error",
            error);
            return false;
        }
    }

    async deleteMessage(id){
        try {
            const res = await fetch(`${api.apiBaseUrl}/blood/${id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('Failed to delete blood request')
        } catch (error) {
            console.log("API service :: deleteMessage :: error", error);
        }
    }

}

const bloodServices = new BloodServices();

export default bloodServices;



