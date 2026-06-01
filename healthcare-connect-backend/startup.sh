#!/bin/sh
export PGPASSWORD=$DB_PASSWORD
psql -h $DB_HOST -U $DB_USERNAME -d $DB_NAME -f /etc/secrets/backup.sql 2>/dev/null
exec java -jar app.jar