import { describe, test, expect } from "@jest/globals";
import { WrapToResult } from "./wrap_to_result";
import { StatusError } from "./status_error";

describe("WrapToResult", () => {
    test("returns okay for successful function", () => {
        const noopFunction = () => "noop";
        const wrappedFunc = WrapToResult(noopFunction, /*textForUnknown=*/ "noop");
        expect(wrappedFunc.ok).toBeTruthy();
    });

    test("returns unknown error for a thrown error", () => {
        const throwFunction = () => {
            throw new Error("error");
        };
        const wrappedFunc = WrapToResult(throwFunction, /*textForUnknown=*/ "Text for unknown");
        expect(wrappedFunc.ok).toBeFalsy();
        expect(wrappedFunc.val).toBeInstanceOf(StatusError);
        expect(wrappedFunc.val.toString()).toContain("UNKNOWN: Text for unknown [error] at stack");
    });
});
