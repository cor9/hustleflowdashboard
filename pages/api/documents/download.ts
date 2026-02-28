import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

// Using service role key to bypass Storage RLS policies for private buckets
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_SECRET || ''

const supabase = createClient(supabaseUrl, serviceRoleKey)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { path } = req.query

    if (!path || typeof path !== 'string') {
        return res.status(400).json({ error: 'Missing path parameter' })
    }

    try {
        const { data, error } = await supabase.storage.from('documents').download(path)

        if (error) {
            return res.status(500).json({ error: error.message || JSON.stringify(error) })
        }

        if (!data) {
            return res.status(404).json({ error: 'File not found' })
        }

        const text = await data.text()

        // Send raw text back to the client
        res.setHeader('Content-Type', 'text/plain')
        return res.status(200).send(text)
    } catch (error: any) {
        console.error('Storage download error:', error)
        return res.status(500).json({ error: error.message || 'Internal Server Error' })
    }
}
