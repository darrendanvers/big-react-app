import {Error} from "@/common/Error";
export function Unauthorized() {
    return (
        <Error message='You are unauthorized to perform this action.' />
    )
}