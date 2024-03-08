import {get} from "@/util/http";
import {Error} from "@/common/Error";

/**
 * Attempts to call a backend endpoint that the user will not have permission to view.
 *
 * @returns {Promise<JSX.Element>}
 * @constructor
 */
export default async function Forbidden() {

    const data = await get(`user/forbidden`);
    if (!data.ok) {
        return <Error message={data.message} />
    } else {
        return <p>This should have been an error.</p>
    }
}