#!/usr/bin/env python3

import argparse
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path


def build_parser():
    parser = argparse.ArgumentParser(description="Run Milvus HTTP requests with safe dry-run defaults.")
    parser.add_argument("--env", required=True, help="Target environment label. Use nonprod for safe execution.")
    parser.add_argument("--path", required=True, help="HTTP path, for example /v2/vectordb/collections/create")
    parser.add_argument("--method", default="POST", choices=["GET", "POST", "PUT", "DELETE"])
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--body-file", help="JSON body file")
    group.add_argument("--body-json", help="Inline JSON body")
    parser.add_argument("--execute", action="store_true", help="Actually send the request. Without this flag, only dry-run.")
    return parser


def load_body(args):
    if args.body_json:
        return json.loads(args.body_json)
    return json.loads(Path(args.body_file).read_text(encoding="utf-8"))


def main():
    parser = build_parser()
    args = parser.parse_args()

    if args.env.lower() != "nonprod" and args.execute:
        raise SystemExit("Refusing execution because --env is not nonprod.")

    base_url = os.getenv("DBQUERY_MILVUS_URL")
    token = os.getenv("DBQUERY_MILVUS_TOKEN")
    if not base_url:
        raise SystemExit("Missing env var: DBQUERY_MILVUS_URL")
    if not token:
        raise SystemExit("Missing env var: DBQUERY_MILVUS_TOKEN")

    body = load_body(args)
    url = f"{base_url.rstrip('/')}/{args.path.lstrip('/')}"

    print("[env]", args.env)
    print("[mode]", "execute" if args.execute else "dry-run")
    print("[method]", args.method)
    print("[url]", url)
    print("[authorization]", "Bearer ***")
    print("[body]")
    print(json.dumps(body, ensure_ascii=False, indent=2))

    if not args.execute:
        return

    payload = json.dumps(body).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=payload,
        method=args.method,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
    )

    try:
        with urllib.request.urlopen(req) as resp:
            data = resp.read().decode("utf-8", errors="replace")
            print("[status]", resp.status)
            print("[response]")
            print(data)
    except urllib.error.HTTPError as exc:
        data = exc.read().decode("utf-8", errors="replace")
        print("[status]", exc.code)
        print("[response]", file=sys.stderr)
        print(data, file=sys.stderr)
        raise SystemExit(exc.code) from exc
    except urllib.error.URLError as exc:
        raise SystemExit(f"Request failed: {exc}") from exc


if __name__ == "__main__":
    main()
