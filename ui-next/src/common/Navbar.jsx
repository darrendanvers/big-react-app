'use client';

import Link from "next/link";

export default function Navbar() {

    return (
        <>
            <div>
                <Link href="/">Home </Link>
                <Link href="/profile">Profile </Link>
                <Link href="/data">Data</Link>
            </div>
        </>
    )
}