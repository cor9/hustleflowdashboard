import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_SECRET || ''

const supabase = createClient(supabaseUrl, serviceRoleKey)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { path } = req.query

    if (!path || typeof path !== 'string') {
        return res.status(400).json({ error: 'Missing path parameter' })
    }

    try {
        const { data, error } = await supabase.storage.from('documents').createSignedUrl(path, 3600)

        if (error) {
            return res.status(500).json({ error: error.message || JSON.stringify(error) })
        }

        if (!data || !data.signedUrl) {
            return res.status(404).json({ error: 'Failed to generate signed URL' })
        }

        return res.status(200).json({ signedUrl: data.signedUrl })
    } catch (error: any) {
        console.error('Storage signed URL error:', error)
        return res.status(500).json({ error: error.message || 'Internal Server Error' })
    }
}
