import React from "react";

/**
 * Describes the parameters for the Error component.
 */
export interface ErrorType {
    message: string
}

/**
 * Displays an error.
 *
 * @param message The error to display.
 * @constructor
 */
export function Error({message}: ErrorType): React.JSX.Element {
    return (
        <p>This is the error: { message }</p>
    )
}