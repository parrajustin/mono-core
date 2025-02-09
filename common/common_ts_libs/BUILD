load("//tools/typescript:ts_lib.bzl", "ts_lib")

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
