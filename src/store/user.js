import { getDoc, doc} from "firebase/firestore";
import { defineStore } from "pinia";
import { db } from '@/firebase'


export const useUserStore = defineStore('user', {
    state(){
        return {
            uid: null,
            email: null,
            role: null
        }
    },
    actions: {
        async fetchUserRole(){
            if (!this.uid){
                return
            }
            console.log('used uid: ' + this.uid)
            const userDoc = await getDoc(doc(db, 'user_role', this.uid))
            if(userDoc.exists()){
                console.log("no")
                this.role = userDoc.data().role
            }else{
                this.role = null
            }
        },
        setUser(uid, email, role){
            this.uid = uid
            this.email = email
            this.role = role
        },
        clearUser(){
            this.uid = null,
            this.email = null,
            this.role = null
        }
    }
});


