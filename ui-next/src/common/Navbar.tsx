'use client';

import Link from "next/link";
import React from "react";

/**
 * Displays the navigation bar.
 *
 * @constructor
 */
export default function Navbar(): React.JSX.Element {

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