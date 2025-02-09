FROM ubuntu:24.04
WORKDIR /usr/local/dev

# Install the application dependencies
# COPY requirements.txt ./
# RUN pip install --no-cache-dir -r requirements.txt
RUN apt-get update && apt-get install -y openssh-server

# Copy in the source code
# COPY src ./src
EXPOSE 5000
EXPOSE 22

# Setup an app user so the container doesn't run as the root user
RUN useradd dev
USER dev

# Setup ssh
RUN mkdir /var/run/sshd
RUN echo 'dev:dev' | chpasswd -c MD5
RUN sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config

# CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
RUN /usr/sbin/sshd -D
