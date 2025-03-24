FROM ubuntu:22.04@sha256:ed1544e454989078f5dec1bfdabd8c5cc9c48e0705d07b678ab6ae3fb61952d2

# Make dummy sudo
RUN echo "#!/bin/bash\n\$@" > /usr/bin/sudo && chmod +x /usr/bin/sudo

# install dependencies and create install directory
RUN apt-get update && apt-get install -y --no-install-recommends  \
    curl ca-certificates &&  \
    apt-get clean

# Install nodejs from nodesource
RUN curl -fsSL https://deb.nodesource.com/setup_22.x -o nodesource_setup.sh
RUN bash nodesource_setup.sh
RUN apt-get install -y --no-install-recommends  \
    nodejs &&  \
    apt-get clean
RUN rm -rf /var/lib/apt/lists/*~
RUN corepack enable pnpm