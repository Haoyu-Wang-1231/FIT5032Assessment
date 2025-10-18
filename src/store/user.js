import { getDoc, doc } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { auth, db, functions } from '@/firebase'
import { ref, computed } from 'vue'
import { httpsCallable } from 'firebase/functions'

import { onAuthStateChanged, onIdTokenChanged, getIdTokenResult } from 'firebase/auth'

export const useUserStore = defineStore(
  'user',
  () => {
    const user = ref(null)
    const uid = ref(null)
    const email = ref(null)
    const role = ref('guest')
    const username = ref(null)
    const isSignedIn = computed(() => !!uid.value)
    const isAdmin = computed(() => role.value === 'admin')

    function setUsername(username) {
      username.value = username
    }

    async function getUserName(uid) {
      console.log('getUser functions')
      if (!uid) return
      const call = httpsCallable(functions, 'getUserInfo')
      const payload = { userId: uid }

      const result = await call(payload)
      if (!result.data.exists) {
        console.log('not exist')
        username.value = null
        return
      }

      username.value = result.data.profile.username
      role.value = result.data.profile.role
      console.log('usre role: ' + role.value)

      console.log('finish user functions')
    }

    async function refreshPermissions(force = false) {
      if (!auth.currentUser) {
        role.value = 'guest'
        return
      }

      console.log(auth.currentUser.uid)
      await getUserName(auth.currentUser.uid)
      // const token = await getIdTokenResult(auth.currentUser, force)
      // console.log('auth')
      // console.log(token)
        
    }


    onIdTokenChanged(auth, () => {
      refreshPermissions()
    })

    let inited = false
    async function initAuthListener() {
      if (inited) return
      inited = true

      onAuthStateChanged(auth, async (u) => {
        if (u) {
          uid.value = u.uid
          email.value = u.email
          await getUserName(u.uid)
          await refreshPermissions(true)
        } else {
          uid.value = null
          email.value = null
          role.value = 'guest'
        }
      })
    }
    async function logout() {
      await auth.signOut()
    }

    return {
      user,
      uid,
      email,
      username,
      role,
      isAdmin,
      isSignedIn,
      refreshPermissions,
      initAuthListener,
      logout,
    }
  },
  {
    persist: { paths: ['uid', 'email', 'role'] },
  },
)
