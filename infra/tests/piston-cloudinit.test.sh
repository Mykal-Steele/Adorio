#!/bin/bash
# Regression test for the jq in piston.bicep's cloud-init. A bug there (wrong Python
# package version, then the wrong runtime language name) took prod Piston down for
# hours with no visible error until someone checked by hand.
#
# No Azure or Piston calls. It pulls the jq filters straight out of piston.bicep so it
# can't drift from what's deployed, and runs them on JSON shaped like the real API
# responses from that incident.
set -euo pipefail
cd "$(dirname "$0")/.."

BICEP_FILE="piston.bicep"
FAIL=0

extract_jq() {
  grep -oP "(?<=$1)\\\$\(.*jq -r '\K[^']+" "$BICEP_FILE" | head -1
}

assert_eq() {
  local desc="$1" expected="$2" actual="$3"
  if [ "$expected" = "$actual" ]; then
    echo "ok - $desc"
  else
    echo "FAIL - $desc: expected [$expected], got [$actual]"
    FAIL=1
  fi
}

# /api/v2/packages as seen during the incident. Python's old 2.7.18 comes first
# in Piston's catalog order.
PACKAGES_FIXTURE='[
  {"language":"java","language_version":"15.0.2","installed":true},
  {"language":"python","language_version":"2.7.18","installed":true},
  {"language":"python","language_version":"3.10.0","installed":false},
  {"language":"python","language_version":"3.11.0","installed":false},
  {"language":"python","language_version":"3.12.0","installed":false},
  {"language":"python","language_version":"3.5.10","installed":false},
  {"language":"python","language_version":"3.9.1","installed":false},
  {"language":"python","language_version":"3.9.4","installed":false}
]'

JAVA_VERSION_FILTER=$(extract_jq 'JAVA_VERSION=')
PYTHON_VERSION_FILTER=$(extract_jq 'PYTHON_VERSION=')

[ -n "$JAVA_VERSION_FILTER" ] || { echo "FAIL - could not extract JAVA_VERSION jq filter from $BICEP_FILE"; exit 1; }
[ -n "$PYTHON_VERSION_FILTER" ] || { echo "FAIL - could not extract PYTHON_VERSION jq filter from $BICEP_FILE"; exit 1; }

JAVA_VERSION=$(echo "$PACKAGES_FIXTURE" | jq -r "$JAVA_VERSION_FILTER")
PYTHON_VERSION=$(echo "$PACKAGES_FIXTURE" | jq -r "$PYTHON_VERSION_FILTER")

assert_eq "Java version resolves to the catalog's only entry" "15.0.2" "$JAVA_VERSION"
# the one that would have caught it: [0] off the unsorted list was 2.7.18.
# Has to be the newest 3.x whatever order the catalog is in.
assert_eq "Python version resolves to the newest release, not the catalog's first entry" "3.12.0" "$PYTHON_VERSION"

# /api/v2/runtimes after the fix, as seen live. Piston lists a 2.x build as
# "python2", not "python", which is the other reason the old healthcheck.sh
# never saw Python as ready.
RUNTIMES_FIXTURE_FIXED='[
  {"language":"java","version":"15.0.2","aliases":[]},
  {"language":"python2","version":"2.7.18","aliases":["py2","python2"]},
  {"language":"python","version":"3.12.0","aliases":["py","py3","python3","python3.12"]}
]'

# the incident state: the install picked 2.7.18, so there's only "python2"
RUNTIMES_FIXTURE_BROKEN='[
  {"language":"java","version":"15.0.2","aliases":[]},
  {"language":"python2","version":"2.7.18","aliases":["py2","python2"]}
]'

JAVA_COUNT_FILTER=$(extract_jq 'JAVA_COUNT=')
PYTHON_COUNT_FILTER=$(extract_jq 'PYTHON_COUNT=')

[ -n "$JAVA_COUNT_FILTER" ] || { echo "FAIL - could not extract JAVA_COUNT jq filter from $BICEP_FILE"; exit 1; }
[ -n "$PYTHON_COUNT_FILTER" ] || { echo "FAIL - could not extract PYTHON_COUNT jq filter from $BICEP_FILE"; exit 1; }

JAVA_COUNT_FIXED=$(echo "$RUNTIMES_FIXTURE_FIXED" | jq -r "$JAVA_COUNT_FILTER")
PYTHON_COUNT_FIXED=$(echo "$RUNTIMES_FIXTURE_FIXED" | jq -r "$PYTHON_COUNT_FILTER")
PYTHON_COUNT_BROKEN=$(echo "$RUNTIMES_FIXTURE_BROKEN" | jq -r "$PYTHON_COUNT_FILTER")

assert_eq "Java runtime count is 1 once installed" "1" "$JAVA_COUNT_FIXED"
assert_eq "Python runtime count is 1 once a real python3.x build is installed" "1" "$PYTHON_COUNT_FIXED"
assert_eq "Python runtime count is 0 when only the python2-aliased build is present (the incident state)" "0" "$PYTHON_COUNT_BROKEN"

if command -v az >/dev/null 2>&1; then
  if az bicep build --file "$BICEP_FILE" --stdout >/dev/null 2>/tmp/piston-bicep-build-err.log; then
    echo "ok - piston.bicep compiles"
  else
    echo "FAIL - piston.bicep does not compile:"
    cat /tmp/piston-bicep-build-err.log
    FAIL=1
  fi
else
  echo "skip - az cli not available, cannot verify piston.bicep compiles"
fi

if [ "$FAIL" -ne 0 ]; then
  echo
  echo "piston-cloudinit.test.sh: FAILED"
  exit 1
fi

echo
echo "piston-cloudinit.test.sh: all checks passed"
