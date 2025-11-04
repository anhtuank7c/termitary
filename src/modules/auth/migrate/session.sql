CREATE TABLE session (
	id TEXT NOT NULL PRIMARY KEY,
	secret_hash BLOB NOT NULL, -- blob is a SQLite data type for raw binary
	created_at INTEGER NOT NULL -- unix time (seconds)
) STRICT;