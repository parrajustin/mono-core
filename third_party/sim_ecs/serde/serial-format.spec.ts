import type { Result } from "../../../common/common_ts_libs/result";
import type { StatusError } from "../../../common/common_ts_libs/status_error";

/** A serial format definition. */
export interface ISerialFormat {
    // /**
    //  * IMPORTANT: This method also exists as a static member.
    //  * Tracking for static members in TS: https://github.com/microsoft/TypeScript/issues/33892
    //  * Copy an external array
    //  * @param arr
    //  */
    // fromArray(arr: readonly TEntity[]): StatusResult<TEntity[]>;

    // /**
    //  * IMPORTANT: This method also exists as a static member.
    //  * Tracking for static members in TS: https://github.com/microsoft/TypeScript/issues/33892
    //  * Read a JSON string into this structure
    //  * @param json
    //  */
    // fromJSON(json: string): StatusResult<TEntity[]>;

    /**
     * Transform into JSON string
     * @param indentation - optional indentation, useful for human readability
     */
    toJSON(indentation?: string | number): Result<string, StatusError>;
}
