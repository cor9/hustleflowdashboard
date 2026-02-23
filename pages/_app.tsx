import '../styles/globals.css'
import type { AppProps } from 'next/app'
import DesignLayout from '../components/DesignLayout'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <DesignLayout>
      <Component {...pageProps} />
    </DesignLayout>
  )
}
