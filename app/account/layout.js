import './ble/ble.css'

export const metadata = {
    title: 'Login page',
    description: 'Demo Login page',
    manifest: '/manifest.json',
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    )
}