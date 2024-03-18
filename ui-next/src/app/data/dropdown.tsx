'use client';

import {useRouter} from "next/navigation";
import React from "react";

/**
 * Allows a user to select what data they want to process from a dropdown. After selection, the page is reloaed
 * with the new data.
 *
 * @returns {React.JSX.Element}
 * @constructor
 */
export default function Dropdown(): React.JSX.Element {

    const router = useRouter();

    function handleChange(e: React.ChangeEvent<HTMLSelectElement>): void {
        router.push(`/data?selected=${e.target.value}`);
    }

    return (
        <select name="selectedProperty" onChange={handleChange}>
            <option value="test1">Test 1</option>
            <option value="test2">Test 2</option>
        </select>
    )
}