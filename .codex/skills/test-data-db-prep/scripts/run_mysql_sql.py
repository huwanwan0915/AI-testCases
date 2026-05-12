#!/usr/bin/env python3

import argparse
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path


WRITE_RE = re.compile(r"\b(insert|update|delete|replace|truncate|alter|create|drop|rename)\b", re.IGNORECASE)
COMMENT_RE = re.compile(r"(--[^\n]*|/\*.*?\*/)", re.DOTALL)


def read_sql(args):
    if args.sql:
        return args.sql.strip()
    return Path(args.sql_file).read_text(encoding="utf-8").strip()


def strip_comments(sql: str) -> str:
    return COMMENT_RE.sub(" ", sql)


def is_write_sql(sql: str) -> bool:
    cleaned = strip_comments(sql)
    return bool(WRITE_RE.search(cleaned))


def env_name(db: str, suffix: str) -> str:
    return f"DBQUERY_{db.upper()}_{suffix}"


def get_mysql_config(db: str):
    host = os.getenv(env_name(db, "HOST"))
    port = os.getenv(env_name(db, "PORT"), "3306")
    user = os.getenv(env_name(db, "USER"))
    password = os.getenv(env_name(db, "PASS"))
    name = os.getenv(env_name(db, "NAME"), db)
    return {
        "host": host,
        "port": port,
        "user": user,
        "password": password,
        "name": name,
    }


def validate_config(cfg):
    missing = [key for key in ("host", "user", "password") if not cfg.get(key)]
    if missing:
        raise SystemExit(f"Missing MySQL env vars for: {', '.join(missing)}")


def mysql_cmd(cfg):
    return [
        "mysql",
        "--default-character-set=utf8mb4",
        "-h",
        cfg["host"],
        "-P",
        str(cfg["port"]),
        "-u",
        cfg["user"],
        f"-p{cfg['password']}",
        "-D",
        cfg["name"],
        "-N",
        "-B",
    ]


def redact_cmd(cmd):
    redacted = []
    for part in cmd:
        if part.startswith("-p"):
            redacted.append("-p***")
        else:
            redacted.append(part)
    return redacted


def build_parser():
    parser = argparse.ArgumentParser(description="Run dbquery-style MySQL SQL with safe dry-run defaults.")
    parser.add_argument("--env", required=True, help="Target environment label. Use nonprod for safe execution.")
    parser.add_argument("--db", required=True, choices=["broker", "finance", "maitao", "mtstat", "chatbot"])
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--sql", help="Inline SQL")
    group.add_argument("--sql-file", help="Path to SQL file")
    parser.add_argument("--allow-write", action="store_true", help="Allow write SQL after safety checks")
    parser.add_argument("--execute", action="store_true", help="Actually run the SQL. Without this flag, only dry-run.")
    parser.add_argument("--print-env-template", action="store_true", help="Print required env var names and exit")
    return parser


def print_env_template(db: str):
    prefix = db.upper()
    print(f"Required env vars for {db}:")
    print(f"  DBQUERY_{prefix}_HOST")
    print(f"  DBQUERY_{prefix}_PORT")
    print(f"  DBQUERY_{prefix}_USER")
    print(f"  DBQUERY_{prefix}_PASS")
    print(f"  DBQUERY_{prefix}_NAME")


def main():
    parser = build_parser()
    args = parser.parse_args()

    if args.print_env_template:
        print_env_template(args.db)
        return

    if args.env.lower() != "nonprod" and args.execute:
        raise SystemExit("Refusing execution because --env is not nonprod.")

    sql = read_sql(args)
    write_sql = is_write_sql(sql)

    cfg = get_mysql_config(args.db)
    validate_config(cfg)

    cmd = mysql_cmd(cfg)

    print("[db]", args.db)
    print("[env]", args.env)
    print("[mode]", "execute" if args.execute else "dry-run")
    print("[write_sql]", "yes" if write_sql else "no")
    print("[command]", " ".join(redact_cmd(cmd)))
    print("[sql]")
    print(sql)

    if write_sql and not args.allow_write:
        raise SystemExit("Detected write SQL. Re-run with --allow-write to continue.")

    if not args.execute:
        return

    if shutil.which("mysql") is None:
        raise SystemExit("mysql client not found in PATH.")

    try:
        result = subprocess.run(
            cmd,
            input=sql,
            text=True,
            capture_output=True,
            check=False,
        )
    except OSError as exc:
        raise SystemExit(f"Failed to run mysql client: {exc}") from exc

    if result.stdout:
        print("[stdout]")
        print(result.stdout.rstrip())
    if result.stderr:
        print("[stderr]", file=sys.stderr)
        print(result.stderr.rstrip(), file=sys.stderr)

    if result.returncode != 0:
        raise SystemExit(result.returncode)


if __name__ == "__main__":
    main()

