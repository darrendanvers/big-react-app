#
# Grab the latest PostgreSQL container.
#
FROM postgres

#
# Load the schema SQL file so that the schema 
# will be created at startup.
#
COPY ./schema.sql /docker-entrypoint-initdb.d/100-schema.sql

