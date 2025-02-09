""" Macro to standardize usage of typescript libs """
load("@aspect_rules_ts//ts:defs.bzl", "ts_project")
load("@aspect_rules_swc//swc:defs.bzl", "swc")
load("//tools/lint:linters.bzl", "eslint_test")
load("@aspect_rules_lint//format:defs.bzl", "format_test")


def ts_lib(name, srcs, deps = []):
    """Creates a ts project with format and linting tests.

    Args:
        name: The name of the ts lib.
        srcs: Label of sources.
        deps: deps if any for the ts lib.
    """
    eslint_name = name + "_eslint_test"
    format_name = name + "_format_test"
    ts_project(
        name = name,
        srcs = srcs,
        declaration = True,
        transpiler = swc,
        deps = deps,
        tsconfig = Label("//:tsconfig"),
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

