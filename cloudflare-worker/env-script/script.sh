#!/bin/sh
set -e

api="$ADORIO_API"
[ -n "$api" ] || api='https://adorio.space/api/secretenv'
file="$ADORIO_ENV_FILE"
[ -n "$file" ] || file='.env'

name="$ADORIO_PROJECT"
pass="$ADORIO_PASS"

if [ -z "$name" ] || [ -z "$pass" ]; then
  if [ -t 0 ]; then
    exec 3<&0
  else
    exec 3</dev/tty || {
      printf 'No terminal available. Set ADORIO_PROJECT and ADORIO_PASS.\n' >&2
      exit 2
    }
  fi
fi

if [ -z "$name" ]; then
  printf 'Project name: ' >&2
  IFS= read -r name <&3 || {
    printf '\nCould not read project name.\n' >&2
    exit 2
  }
fi

case "$name" in
  ''|*[!a-z0-9-]*|-*|*-)
    printf 'Invalid project name: use lowercase letters, digits, and dashes.\n' >&2
    exit 2
    ;;
esac

if [ -z "$pass" ]; then
  printf 'Passphrase: ' >&2
  stty -echo <&3 2>/dev/null || true
  IFS= read -r pass <&3 || {
    stty echo <&3 2>/dev/null || true
    printf '\nCould not read passphrase.\n' >&2
    exit 2
  }
  stty echo <&3 2>/dev/null || true
  printf '\n' >&2
fi

if [ -z "$pass" ]; then
  printf 'Passphrase is required.\n' >&2
  exit 2
fi

umask 077
tmp=$(mktemp "$file.XXXXXX") || {
  printf 'Could not create a temporary file next to %s.\n' "$file" >&2
  exit 1
}
trap 'rm -f "$tmp"' 0 1 2 15
if ! curl -fsS -H "Authorization: Bearer $pass" "$api?name=$name" -o "$tmp"; then
  printf 'Retrieval failed. Check the project name and passphrase.\n' >&2
  exit 1
fi
chmod 600 "$tmp"
mv "$tmp" "$file"
trap - 0 1 2 15
printf 'Wrote %s (%s bytes)\n' "$file" "$(wc -c < "$file" | tr -d ' ')" >&2
