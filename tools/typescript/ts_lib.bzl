""" Macro to standardize usage of typescript libs """
load("@aspect_rules_ts//ts:defs.bzl", "ts_project")
# load("@aspect_rules_swc//swc:defs.bzl", "swc")
load("//tools/lint:linters.bzl", "eslint_test")
load("@aspect_rules_lint//format:defs.bzl", "format_test")


def ts_lib(name, srcs, deps = [], non_ts_lib_deps = []):
    """Creates a ts project with format and linting tests.

    Args:
        name: The name of the ts lib.
        srcs: Label of sources.
        deps: deps that come from another ts_lib.
        non_ts_lib_deps: that come from other sources.
    """
    eslint_name = name + "_eslint_test"
    format_name = name + "_format_test"

    file_group_of_types = list()
    deps_with_types = list()
    for dep in deps:
        deps_with_types.append(dep)
        deps_with_types.append(dep + "_types")
        file_group_of_types.append(dep + "_types")
    ts_project(
        name = name,
        srcs = srcs,
        declaration = True,
        # declaration_transpiler = tsc_dts,
        # TODO: Add swc when it supports commonjs transpiling.
        # transpiler = swc,
        deps = deps_with_types + non_ts_lib_deps,
        tsconfig = Label("//:tsconfig"),
    )
    file_group_of_types.append(name + "_types")
    all_types_name = name + "_all_types"
    native.filegroup(
        name = all_types_name,
        srcs = file_group_of_types,
    )
    eslint_test(
        name =  eslint_name,
        srcs = [name],
    )
    format_test(
        name =  format_name,
        srcs = [name],
        javascript = Label("//tools/format:prettier"),
    )

