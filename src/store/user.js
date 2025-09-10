import { defineStore } from "pinia";


export const useUserStore = defineStore('user', {
    state(){
        return {
            email: null,
            role: null
        }
    },
    actions: {
        setUser(email, role){
            this.email = email
            this.role = role
        }
    },
    persist:{
        key: 'user',
        storage: sessionStorage
    }
});


