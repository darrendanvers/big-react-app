import React from "react";


/**
 * Template type for components that want the URL search parameters. The type supplied should
 * be an object with the search parameters expected in the URL.
 */
export interface RouteParameters<T> {
    searchParams: T
}

/**
 * Common interface for React components that only take children as their parameter.
 */
export interface ChildOnlyParameterType {
    children: React.ReactNode
}