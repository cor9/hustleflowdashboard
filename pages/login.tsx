import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login() {
    const [email, setEmail] = useState('')
    const [sent, setSent] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: 'https://hustleflow.site/auth/callback',
            },
        })

        if (error) {
            setError(error.message)
        } else {
            setSent(true)
        }
        setLoading(false)
    }

    if (sent) {
        return (
            <div style={styles.wrap}>
                <div style={styles.card}>
                    <div style={styles.icon}>📬</div>
                    <h2 style={styles.title}>Check your email</h2>
                    <p style={styles.sub}>Magic link sent to <strong>{email}</strong></p>
                </div>
            </div>
        )
    }

    return (
        <div style={styles.wrap}>
            <div style={styles.card}>
                <div style={styles.icon}>⚡</div>
                <h2 style={styles.title}>HustleFlow</h2>
                <p style={styles.sub}>Mission Control</p>
                <form onSubmit={handleLogin} style={styles.form}>
                    <input
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        style={styles.input}
                    />
                    <button type="submit" disabled={loading} style={styles.btn}>
                        {loading ? 'Sending...' : 'Send Magic Link'}
                    </button>
                </form>
                {error && <p style={styles.error}>{error}</p>}
            </div>
        </div>
    )
}

const styles: Record<string, React.CSSProperties> = {
    wrap: {
        minHeight: '100vh',
        background: '#080B12',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'DM Sans', sans-serif",
    },
    card: {
        background: '#0E1220',
        border: '1px solid #1E2538',
        borderRadius: 12,
        padding: '40px 36px',
        width: '100%',
        maxWidth: 380,
        textAlign: 'center',
    },
    icon: { fontSize: 32, marginBottom: 12 },
    title: { color: '#E2E8F5', fontSize: 22, fontWeight: 700, margin: '0 0 4px' },
    sub: { color: '#6B7A9F', fontSize: 14, margin: '0 0 28px' },
    form: { display: 'flex', flexDirection: 'column', gap: 12 },
    input: {
        background: '#141826',
        border: '1px solid #252D42',
        borderRadius: 8,
        color: '#E2E8F5',
        fontSize: 14,
        padding: '10px 14px',
        outline: 'none',
    },
    btn: {
        background: '#3D7EFF',
        border: 'none',
        borderRadius: 8,
        color: '#fff',
        cursor: 'pointer',
        fontSize: 14,
        fontWeight: 600,
        padding: '11px 0',
    },
    error: { color: '#F04438', fontSize: 13, marginTop: 8 },
}
