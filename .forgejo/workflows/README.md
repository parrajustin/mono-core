# How to tests locally

```bash
sudo forgejo-runner exec --workflows .forgejo/workflows/build_bazelisk_image.yml --job docker --privileged -s FORGEJO_TOKEN=$TOKEN
```
