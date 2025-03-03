import { describe, test, expect } from "@jest/globals";
import { IsOptional, None, Some, WrapOptional } from "./optional";

describe("Optional", () => {
    test("returns true for IsOptional", () => {
        const okay = Some("okay");
        const okay2 = Some([2, 4]);
        const okay3 = Some(Some(Some("1")));
        const empty = None;
        expect(IsOptional(okay)).toBeTruthy();
        expect(IsOptional(okay2)).toBeTruthy();
        expect(IsOptional(okay3)).toBeTruthy();
        expect(IsOptional(empty)).toBeTruthy();
        expect(IsOptional(undefined)).toBeFalsy();
        expect(IsOptional(null)).toBeFalsy();
        expect(IsOptional({})).toBeFalsy();
    });

    test("returns optional for WrapOptional", () => {
        const throwFunction = () => {
            throw new Error("error");
        }
        const object = {};
        const array = [1, 2];
        const empty = None;
        const string = "2,3232,2";
        expect(WrapOptional(throwFunction).some).toBeTruthy();
        expect(WrapOptional(object).some).toBeTruthy();
        expect(WrapOptional(array).some).toBeTruthy();
        expect(WrapOptional(empty).some).toBeTruthy();
        expect(WrapOptional(string).some).toBeTruthy();
        expect(WrapOptional(undefined).some).toBeFalsy();
        expect(WrapOptional(null).some).toBeFalsy();
    });
});
