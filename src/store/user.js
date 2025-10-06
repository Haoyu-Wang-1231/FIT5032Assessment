import { getDoc, doc} from "firebase/firestore";
import { defineStore } from "pinia";
import { auth, db } from '@/firebase'
import { ref, computed } from "vue";

import { onAuthStateChanged, onIdTokenChanged, getIdTokenResult } from "firebase/auth";

export const useUserStore = defineStore('user', () => {
    const user = ref(null);
    const uid = ref(null);
    const email = ref(null);
    const role = ref(null);
    const claims = ref({});
    const username = ref(null);
    const isSignedIn = computed(() => !!uid.value)
    const isAdmin = computed(() => role.value === 'admin')

    function setUserName(input){
        username.value = input;
    }

    async function refreshPermissions(force = false) {
        if (!auth.currentUser){
            role.value = 'guest';
            claims.value = {};
            return;
        }

        const token = await getIdTokenResult(auth.currentUser, force);
        claims.value = token.claims || {};
        role.value = claims.value.role || 'viewer';

        // Default to 'viewer' if no role is set

    }

    onAuthStateChanged(auth, async (u) => {
        user.value = u;
        if (u){
            refreshPermissions(true);
        }else{
            role.value = 'guest';
        }
    });

    onIdTokenChanged(auth, () => {
        refreshPermissions();
    });
       
    let inited = false;
    async function initAuthListener(){
        if (inited) return;
        inited = true;

        onAuthStateChanged(auth, async (u) => {
            if (u) {
                uid.value = u.uid;
                email.value = u.email;
                await refreshPermissions(true);
            }else{
                uid.value = null;
                email.value = null;
                role.value = 'guest';
                claims.value = {};
            }


        });
        

    }
    async function logout (){
        await auth.signOut();
    }

    return { user, uid, email, role, isAdmin, isSignedIn ,refreshPermissions, initAuthListener,  logout};
}, {
    persist: { paths: ['uid', 'email', 'role'] }
});
