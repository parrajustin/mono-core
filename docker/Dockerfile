FROM ubuntu:24.04
WORKDIR /usr/local/dev

# Install the application dependencies
# COPY requirements.txt ./
# RUN pip install --no-cache-dir -r requirements.txt
RUN apt-get update && apt-get install -y openssh-server git
RUN wget -O- https://aka.ms/install-vscode-server/setup.sh | sh

# Copy in the source code
# COPY src ./src
EXPOSE 5000
EXPOSE 22

# Setup an app user so the container doesn't run as the root user
# RUN useradd dev

# Setup ssh
RUN echo 'root:root' | chpasswd
RUN mkdir /var/run/sshd
RUN sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config

# RUN ssh-keygen -t rsa -f /etc/ssh/ssh_host_rsa_key -N ''

# Generate SSH host keys (ADD THIS)
# RUN ssh-keygen -A

# Switch User
# USER dev

CMD ["/usr/sbin/sshd", "-D"]
