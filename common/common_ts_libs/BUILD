load("//tools/typescript:ts_lib.bzl", "ts_lib")
load("//tools/typescript:ts_test.bzl", "ts_test")

package(default_visibility = ["//visibility:public"])

filegroup(
    name = "md",
    srcs = ["README.md"],
    tags = ["markdown"],
)

ts_lib(
    name = "async",
    srcs = ["async.ts"],
)

ts_lib(
    name = "result",
    srcs = ["result.ts"],
)

ts_lib(
    name = "status_error",
    srcs = ["status_error.ts"],
)

ts_lib(
    name = "type_guard",
    srcs = ["type_guard.ts"],
)

ts_lib(
    name = "utils",
    srcs = ["utils.ts"],
    deps = [
        ":result",
        ":status_error",
    ],
)

ts_lib(
    name = "wrap_promise",
    srcs = ["wrap_promise.ts"],
    deps = [
        ":result",
        ":utils",
        ":status_error",
    ],
)
ts_lib(
    name = "wrap_to_result",
    srcs = ["wrap_to_result.ts"],
    deps = [
        ":result",
        ":utils",
        ":status_error",
    ],
)

ts_test(
    name = "wrap_to_result_test",
    src = "wrap_to_result.test.ts",
    deps = [
        ":wrap_to_result",
        ":status_error",
        ":wrap_to_result_types",
        ":status_error_types",
    ]
)
