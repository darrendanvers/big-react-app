import {get, HttpResponseWrapper} from "@/util/http";
import Dropdown from "@/app/data/dropdown";
import Navbar from "@/common/Navbar";
import opentelemetry from "@opentelemetry/api";
import {Error} from "@/common/Error";
import Forbidden from "@/common/auth/Forbidden";
import React from "react";
import {RouteParameters} from "@/common/next-interfaces";

/**
 * The response from the data endpoint.
 */
interface DataResponseType {
    property: string
}

/**
 * The URL search parameters this component expects.
 */
interface SearchParameters {
    selected?: string
}

/**
 * Displays a page where the user can select data to show.
 *
 * @param searchParams
 * @returns {Promise<React.JSX.Element>}
 * @constructor
 */
export default function ShowData({ searchParams }: RouteParameters<SearchParameters>): Promise<React.JSX.Element> {

    const tracer = opentelemetry.trace.getTracer('ui-next-authenticated', process.env.APP_VERSION);

    return tracer.startActiveSpan('data-fetch', (span) => {
        const selected = searchParams.selected == null ? 'test' : searchParams.selected;
        return get<DataResponseType>(`data?parameter=${selected}`)
            .then((response: HttpResponseWrapper<DataResponseType>) => {
                if (response.error) {
                    return <Error message={response.error.message} />
                } else {
                    let responseMessage = "no data in response";
                    if (response.data) {
                        responseMessage = response.data.property;
                    }
                    return (
                        <>
                            <Navbar/>
                            <Dropdown/>
                            <div>{responseMessage}</div>
                            <Forbidden />
                        </>
                    )
                }
            }).then((r) => {
                span.end();
                return r;
            }).catch(e => {
                span.end();
                return <Error message={e.message} />
            });
    });
}