FROM golang:1.24.1-bookworm@sha256:d7d795d0a9f51b00d9c9bfd17388c2c626004a50c6ed7c581e095122507fe1ab AS golang_base

# install dependencies and create install directory
RUN apt-get update && \
    apt-get install -y --no-install-recommends  \
    gcc git make  &&  \
    apt-get clean  &&  \
    rm -rf /var/lib/apt/lists/*

WORKDIR /opt
RUN git clone -b 'v1.25.0' --single-branch --depth 1 https://github.com/bazelbuild/bazelisk.git

WORKDIR /opt/bazelisk
RUN GOOS=linux GOARCH=amd64 go build -o bin/bazelisk

# build on top of Ubuntu 22.04
FROM golang:1.24.1-bookworm@sha256:d7d795d0a9f51b00d9c9bfd17388c2c626004a50c6ed7c581e095122507fe1ab

# pull source code with tag "release 18-12-21"
WORKDIR /bin
COPY --from=golang_base /opt/bazelisk/bin/bazelisk /bin/bazel

ENV BASILISK=/bin/bazel \
    PATH=$PATH:/bin/
RUN echo 'export "PATH=$PATH:/bin/"' >> /etc/profile