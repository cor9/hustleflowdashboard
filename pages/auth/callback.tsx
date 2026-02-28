import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'

export default function AuthCallback() {
    const router = useRouter()

    useEffect(() => {
        supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
                router.push('/')
            }
        })
    }, [router])

    return (
        <div style={{
            minHeight: '100vh', background: '#080B12',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#6B7A9F', fontFamily: 'DM Sans, sans-serif', fontSize: 14
        }}>
            Authenticating…
        </div>
    )
}
