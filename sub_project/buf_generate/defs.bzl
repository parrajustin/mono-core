"Generates a FileDescriptorProto .bin file for Protobuffers"

def _proto_library_impl(ctx):
    inputs = depset([ctx.file.src])
    output_bin = ctx.actions.declare_file(ctx.outputs.bin.basename, sibling = ctx.file.src)

    args = ctx.actions.args()
    args.add_joined(["--path", ctx.file.src.path], join_with = "=")
    args.add_joined(["--name", ctx.attr.name], join_with = "=")
    args.add_joined(["--outDir", ctx.outputs.bin.dirname], join_with = "=")
    ctx.actions.run(
        executable = ctx.executable.complier,
        progress_message = "Generating proto .bin from %{label}",
        outputs = [output_bin],
        inputs = inputs,
        mnemonic = "ProtocGenEs",
        arguments = [args],
        env = {"BAZEL_BINDIR": ctx.bin_dir.path},
        use_default_shell_env = True
    )

    return [
        DefaultInfo(
            files = depset([output_bin])
        )
    ]

proto_library = rule(
    implementation = _proto_library_impl,
    attrs = dict({
        "src": attr.label(
            mandatory = True,
            allow_single_file = True,
        ),
        "complier": attr.label(
            doc = "The binary used to generate proto bins",
            allow_files = True,
            cfg = "target",
            executable = True,
            default = Label("//:buf_generate"),
        )
    }),
    doc = "Generate a proto FileDescriptorFile .bin file.",
    outputs = {
        "bin": "%{name}.bin",
    }
)