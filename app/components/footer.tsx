import Link from "next/link"

const footerLinks = [
    { href: 'https://goinvo.com/', label: 'GoInvo.' },
    { href: 'https://goinvo.com/contact/', label: 'Contact.' },
    { href: '#', label: 'Terms.' }
]

const Footer: React.FC = () => {
    return (
        <footer className="w-full h-6 navbar space-x-6 text-white flex justify-center px-4 py-4">
            <div className="flex items-center">
                <p className="text-2xs text-contrastGrey">&copy; 2025</p>
            </div>
            <div className="flex items-center mr-auto space-x-6">
                {footerLinks.map((link, index) => (
                    <Link key={index} href={link.href} className="text-2xs text-contrastGrey">
                        {link.label}
                    </Link>
                ))}
            </div>
        </footer>)
}

export default Footer