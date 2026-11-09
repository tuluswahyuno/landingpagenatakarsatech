#!/usr/bin/env bash
# Backup harian database + file upload. Simpan 14 hari terakhir.
# Jadwalkan: crontab -e  →  30 2 * * * /var/www/natakarsa/web/deploy/backup.sh >> /var/log/natakarsa-backup.log 2>&1
set -euo pipefail
APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DEST="${BACKUP_DIR:-$HOME/backup-natakarsa}"
STAMP="$(date +%F)"
mkdir -p "$DEST"

# Baca DATABASE_URL dari .env: mysql://user:pass@host:port/db
URL="$(grep -E '^DATABASE_URL=' "$APP_DIR/.env" | cut -d= -f2-)"
proto_removed="${URL#mysql://}"
creds="${proto_removed%%@*}"; hostpart="${proto_removed#*@}"
DB_USER="${creds%%:*}"; DB_PASS="${creds#*:}"
DB_HOST="${hostpart%%/*}"; DB_NAME="${hostpart#*/}"; DB_NAME="${DB_NAME%%\?*}"
DB_PORT="${DB_HOST#*:}"; DB_HOST="${DB_HOST%%:*}"; [ "$DB_PORT" = "$DB_HOST" ] && DB_PORT=3306

MYSQL_PWD="$DB_PASS" mysqldump -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" --single-transaction --routines "$DB_NAME" | gzip > "$DEST/db-$STAMP.sql.gz"
tar -czf "$DEST/uploads-$STAMP.tar.gz" -C "$APP_DIR" uploads 2>/dev/null || true
find "$DEST" -type f -mtime +14 -delete
echo "$(date '+%F %T') backup selesai: $DEST"
