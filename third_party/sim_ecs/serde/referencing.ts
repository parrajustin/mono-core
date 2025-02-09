import { IsUndefined } from "../../../common/common_ts_libs/equality";
import type { Result } from "../../../common/common_ts_libs/result";
import { Err, Ok } from "../../../common/common_ts_libs/result";
import type { StatusError } from "../../../common/common_ts_libs/status_error";
import { InvalidArgumentError } from "../../../common/common_ts_libs/status_error";
import type { IReference } from "./referencing.spec";
import { EReferenceType } from "./referencing.spec";
import { C_MARKER_SEPARATOR, C_REF_MARKER } from "./serde.spec";

export class Reference implements IReference {
    constructor(
        public readonly type: EReferenceType,
        public readonly id: string
    ) {}

    /**
     * Attempts to create a reference from a string.
     * @param refString the input ref string
     * @returns returns a Reference when the input is valid otherwise an InvalidArgumentError.
     */
    public static fromString(refString: string): Result<Readonly<Reference>, StatusError> {
        const [marker, type, ...idTokens] = refString.split(C_MARKER_SEPARATOR) as [
            string | undefined,
            string | undefined,
            string[] | undefined
        ];
        if (IsUndefined(marker) || IsUndefined(type) || IsUndefined(idTokens)) {
            return Err(
                InvalidArgumentError(
                    `Argument 'refString' must be a valid ref. (arg: "${refString}")`
                )
            );
        }

        if (marker != C_REF_MARKER) {
            return Err(
                InvalidArgumentError(
                    `Argument 'refString' marker does not match "${C_REF_MARKER}" found "${marker}")`
                )
            );
        }

        // Cast the `type` variable to typescript typechecking.
        const typeCast = type as EReferenceType;
        // Attempt to get the value from the enum.
        const typeCheck = EReferenceType[typeCast];
        if (IsUndefined(typeCheck)) {
            return Err(
                InvalidArgumentError(`Argument 'refString' type is invalid found "${type}")`)
            );
        }

        return Ok(new Reference(type as EReferenceType, idTokens.join()));
    }

    public static isReferenceString(str: string): boolean {
        const [marker, type] = str.split(C_MARKER_SEPARATOR);

        if (IsUndefined(type)) {
            return false;
        }

        return (
            marker === C_REF_MARKER && (Object.values(EReferenceType) as string[]).includes(type)
        );
    }

    public toString(): string {
        return `${C_REF_MARKER}${C_MARKER_SEPARATOR}${this.type}${C_MARKER_SEPARATOR}${this.id}`;
    }
}
