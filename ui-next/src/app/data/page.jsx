import {get} from "@/util/http";
import Dropdown from "@/app/data/dropdown";
import Authenticated from "@/app/auth/Authenticated";
import Navbar from "@/common/Navbar";


/**
 * Displays a page where the user can select data to show.
 *
 * @param searchParams
 * @returns {Promise<JSX.Element>}
 * @constructor
 */
export default async function ShowData({ searchParams }) {

    const selected = searchParams.selected == null ? 'test' : searchParams.selected;
    const data = await get(`data?parameter=${selected}`);

    return (
        <>
            <Authenticated message="Data page">
                <Navbar />
                <Dropdown />
                <div>{data.property}</div>
            </Authenticated>
        </>
    )
}