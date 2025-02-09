import type { Result, StatusResult } from "../../../common/common_ts_libs/result";
import { Err, Ok } from "../../../common/common_ts_libs/result";
import { InvalidArgumentError, StatusError } from "../../../common/common_ts_libs/status_error";
import type { ISerialFormat } from "./serial-format.spec.ts";
import type { TEntity } from "./types";

export * from "./serial-format.spec";

export class SerialFormat implements ISerialFormat {
    public static fromArray(arr: readonly TEntity[]): Result<TEntity[], StatusError> {
        const copy: TEntity[] = [];
        Object.assign(copy, arr);
        return Ok(copy);
    }

    public static fromJSON(json: string): Result<TEntity[], StatusError> {
        const newVals = JSON.parse(json) as Readonly<object>;

        if (!Array.isArray(newVals)) {
            return Err(InvalidArgumentError(`Argument must be an array found "${typeof json}"`));
        }

        return Ok(newVals);
    }

    public toJSON(indentation?: string | number): Result<string, StatusError> {
        return WrapToJSON.stringify(Array.from(this), undefined, indentation);
    }
}
