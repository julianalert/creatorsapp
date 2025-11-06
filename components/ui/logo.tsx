import Link from 'next/link'
import Image from 'next/image'

export default function Logo() {
  return (
    <Link className="block cursor-pointer" href="/">
      <Image
        src="/images/logosvg.svg"
        alt="Logo"
        width={32}
        height={32}
        className="w-8 h-8"
      />
    </Link>
  )
}
