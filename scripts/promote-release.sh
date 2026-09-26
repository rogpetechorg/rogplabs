#!/bin/sh
# Run on the deployment host after testing the immutable image.
set -eu
revision=${1:?Pass the tested hexadecimal Git revision}
case "$revision" in *[!0-9a-f]*|'') echo 'Invalid revision' >&2; exit 1;; esac
[ "${#revision}" -ge 7 ] && [ "${#revision}" -le 40 ] || exit 1
image="rogplabs-release:$revision"
docker image inspect "$image" >/dev/null
docker service inspect rogplabs-if6ebv --format '{{range .Spec.TaskTemplate.ContainerSpec.Mounts}}{{.Source}}:{{.Target}}{{println}}{{end}}' | grep -qx 'rogplabs-production-data:/app/data'
docker service update --detach --no-resolve-image --image "$image" \
  --read-only --cap-drop ALL --limit-pids 64 --limit-memory 256m --limit-cpu .5 \
  --log-driver json-file --log-opt max-size=5m --log-opt max-file=2 \
  --update-order start-first --update-failure-action rollback --update-monitor 20s \
  rogplabs-if6ebv
printf 'Promotion requested. Verify service convergence, /healthz, intake and events before finishing.\n'
