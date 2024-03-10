import {get} from "@/util/http";
import Dropdown from "@/app/data/dropdown";
import Navbar from "@/common/Navbar";
import opentelemetry from "@opentelemetry/api";
import {Error} from "@/common/Error";
import Forbidden from "@/common/auth/Forbidden";


/**
 * Displays a page where the user can select data to show.
 *
 * @param searchParams
 * @returns {Promise<JSX.Element>}
 * @constructor
 */
export default function ShowData({ searchParams }) {

    const tracer = opentelemetry.trace.getTracer('ui-next-authenticated', process.env.APP_VERSION);

    return tracer.startActiveSpan('data-fetch', (span) => {
        const selected = searchParams.selected == null ? 'test' : searchParams.selected;
        return get(`data?parameter=${selected}`)
            .then((data) => {
                if (!data.ok) {
                    return <Error message={data.message} />
                } else {
                    return (
                        <>
                            <Navbar/>
                            <Dropdown/>
                            <div>{data.property}</div>
                            <Forbidden />
                        </>
                    )
                }
            }).then((r) => {
                span.end();
                return r;
            });
    });
}