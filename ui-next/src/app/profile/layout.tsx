import React from "react";
import {ChildOnlyParameterType} from "@/common/next-interfaces";

/**
 * Layout for profile pages.
 *
 * @param children The components to embed in this layout.
 * @returns {JSX.Element}
 * @constructor
 */
export default function ProfileLayout({ children }: ChildOnlyParameterType): React.JSX.Element {

    return (
        <>
            {children}
        </>
    )
}