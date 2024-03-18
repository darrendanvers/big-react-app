import {get} from "@/util/http";
import {Error} from "@/common/Error";
import React from "react";

/**
 * Attempts to call a backend endpoint that the user will not have permission to view.
 *
 * @returns {Promise<JSX.Element>}
 * @constructor
 */
export default async function Forbidden(): Promise<React.JSX.Element> {

    const data = await get(`user/forbidden`);
    if (data.error) {
        return <Error message={data.error.message} />
    } else {
        return <p>This should have been an error.</p>
    }
}