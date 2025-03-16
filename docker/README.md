## How to build bazelisk build image

```bash
sudo docker build -t xerofuzzion/bazelisk:latest -f ./bazelisk.Dockerfile .
sudo docker image push xerofuzzion/bazelisk:latest
```