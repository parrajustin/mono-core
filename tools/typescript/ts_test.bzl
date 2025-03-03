""" Macro to standardize usage of typescript libs """

load(":files.bzl", "files")
load(":runfiles.bzl", "runfiles")

def _ts_test_impl(ctx):
    """Creates a build rule to test a typescript lib with jest.

    Args:
        ctx: The name of the ts lib.
    """
    env = {}

    test = ctx.outputs.script
    ctx.actions.expand_template(
        template = ctx.file.test_template,
        output = test,
        substitutions = {
            "%TEMPLATED_launcher%": files.long_path(ctx, ctx.executable.launcher),
            "%TEMPLATED_config%": files.long_path(ctx, ctx.file.config),
            "%TEMPLATED_test%": files.long_path(ctx, ctx.file.src),
        },
        is_executable = True,
    )

    additional_runfiles = list(ctx.files._bash_runfile_helpers)
    for data in ctx.attr.data:
        additional_runfiles.append(data)

    return [
        DefaultInfo(
            executable = test,
            runfiles = runfiles.collect(
                ctx = ctx,
                files = additional_runfiles +
                        ctx.files.deps +
                        ctx.files.ts_config +
                        ctx.files.package_json,
                targets = [
                    ctx.attr.ts_config,
                    ctx.attr.config,
                    ctx.attr.launcher,
                    ctx.attr.src,
                ],
            )
        ),
        testing.ExecutionInfo(env),
    ]

ts_test = rule(
    attrs = {
        "config": attr.label(
            doc = "Optional jest configuration for the test.",
            allow_single_file = True,
            default = Label("//tools/typescript:jest.config.js"),
        ),
        "ts_config": attr.label(
            doc = "TS config file.",
            allow_single_file = True,
            default = Label("//:tsconfig"),
        ),
        "package_json": attr.label(
            doc = "NPM package json.",
            allow_single_file = True,
            default = Label("//:package.json"),
        ),
        "data": attr.label_list(
            doc = "Additional runtime dependencies for the test.",
            allow_files = True,
        ),
        "deps": attr.label_list(
            doc = "Additional dependencies for the test.",
            allow_files = True,
        ),
        "launcher": attr.label(
            doc = "The jest test launcher binary.",
            allow_files = True,
            cfg = "target",
            executable = True,
            default = Label("//tools/typescript:jest"),
        ),
        "src": attr.label(
            doc = "The test srcs.",
            mandatory = True,
            allow_single_file = True,
        ),
        "test_template": attr.label(
            doc = "Shell template used to launch test.",
            default = Label("//tools/typescript:jest_test.sh.template"),
            allow_single_file = True,
        ),
        "_bash_runfile_helpers": attr.label(default = Label("@bazel_tools//tools/bash/runfiles")),
    },
    toolchains = ["@bazel_tools//tools/sh:toolchain_type"],
    doc = "Runs a provided test against the provided TS file.",
    outputs = {
        "script": "%{name}.sh",
    },
    test = True,
    implementation = _ts_test_impl,
)
