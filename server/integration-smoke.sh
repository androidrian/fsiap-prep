#!/usr/bin/env bash
set -euo pipefail

api_url="${1:-http://127.0.0.1:4181}"
origin="${2:-http://127.0.0.1:4181}"
test_suffix="${RANDOM}${RANDOM}"
username_a="smoke_a_${test_suffix}"
username_b="smoke_b_${test_suffix}"
password='teste-seguro-2026'
cookie_dir="$(mktemp -d /tmp/fsiap-cookies.XXXXXX)"

cleanup() {
  rm -f "${cookie_dir}/a.cookies" "${cookie_dir}/b.cookies"
  rmdir "${cookie_dir}"
}
trap cleanup EXIT

post_json() {
  curl -fsS -H "Origin: ${origin}" -H 'Content-Type: application/json' "$@"
}

post_json -c "${cookie_dir}/a.cookies" -d "{\"username\":\"${username_a}\",\"password\":\"${password}\"}" "${api_url}/register" | grep -q "${username_a}"
post_json -b "${cookie_dir}/a.cookies" -X PUT -d '{"progress":{"diagnosed":true,"marker":"account-a"}}' "${api_url}/progress" | grep -q '"saved":true'

post_json -c "${cookie_dir}/b.cookies" -d "{\"username\":\"${username_b}\",\"password\":\"${password}\"}" "${api_url}/register" | grep -q "${username_b}"
curl -fsS -b "${cookie_dir}/b.cookies" "${api_url}/progress" | grep -q '"progress":null'

post_json -b "${cookie_dir}/a.cookies" -X POST "${api_url}/logout"
post_json -c "${cookie_dir}/a.cookies" -d "{\"username\":\"${username_a}\",\"password\":\"${password}\"}" "${api_url}/login" | grep -q "${username_a}"
curl -fsS -b "${cookie_dir}/a.cookies" "${api_url}/progress" | grep -q '"marker":"account-a"'

wrong_status="$(curl -sS -o /dev/null -w '%{http_code}' -H "Origin: ${origin}" -H 'Content-Type: application/json' -d "{\"username\":\"${username_a}\",\"password\":\"password-errada\"}" "${api_url}/login")"
test "${wrong_status}" = '401'

echo 'API smoke test passed: sessions and progress are isolated.'
