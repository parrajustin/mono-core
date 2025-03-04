load("@aspect_rules_esbuild//esbuild:defs.bzl", "esbuild")
load("@bazel_tools//tools/build_defs/pkg:pkg.bzl", "pkg_tar")
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
    name = "equality",
    srcs = ["equality.ts"],
)

ts_lib(
    name = "common_ts_libs",
    srcs = ["index.ts"],
    non_ts_lib_deps = [
        "//:node_modules/tslib",
    ],
    deps = [
        ":async",
        ":equality",
        ":optional",
        ":result",
        ":status_error",
        ":type_guard",
        ":utils",
        ":wrap_promise",
        ":wrap_to_result",
    ],
)

ts_lib(
    name = "optional",
    srcs = ["optional.ts"],
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
        ":status_error",
        ":utils",
    ],
)

ts_lib(
    name = "wrap_to_result",
    srcs = ["wrap_to_result.ts"],
    deps = [
        ":result",
        ":status_error",
        ":utils",
    ],
)

ts_test(
    name = "optional_test",
    src = "optional.test.ts",
    deps = [
        ":optional",
    ],
)

ts_test(
    name = "wrap_to_result_test",
    src = "wrap_to_result.test.ts",
    deps = [
        ":status_error",
        ":wrap_to_result",
    ],
)

###################
# Package for npm #
###################

exports_files(
    glob([
        "*.d.ts",
    ]),
)

esbuild(
    name = "dist",
    srcs = ["index.js"],
    bazel_sandbox_plugin = True,
    bundle = True,
    config = {
        "format": "cjs",
        "target": "es2020",
        "logLevel": "info",
        "minify": True,
    },
    entry_points = ["index.js"],
    sourcemap = "external",
    splitting = False,
    deps = [":common_ts_libs"],
)

filegroup(
    name = "common_ts_libs_npm_files",
    srcs = ["package.json", "README.md",],
)

pkg_tar(
    name = "common_ts_libs_npm_tar",
    srcs = [
        ":dist",
        ":common_ts_libs_all_types",
        ":common_ts_libs_npm_files",
    ],
)
