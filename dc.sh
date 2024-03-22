#! /bin/sh

#
# Parse the command line.
#
USAGE="usage: $0 [-btdoaxh] \n\
\tb: run a build before running up\n
\tt: run the Open Telemetry services\n\
\td: run the database\n\
\td: run the authorization server\n\
\ta: run the API\n\
\tx: run all services except the UI\n
\th: print the usage statement and quit\n\
\tIf none of t, d, o, a, or x are provided, then all services will run.\n"

DB=""
OTEL=""
OIDC=""
API=""
BUILD=false

while getopts ':btdoaxh' opt; do
  case $opt in
  b)
    BUILD=true
    ;;
  t)
    OTEL="jaeger otel prometheus"
    ;;
  d)
    DB="db"
    ;;
  o)
    OIDC="oidc"
    ;;
  a)
    API="api"
    ;;
  x)
    OTEL="jaeger otel prometheus"
    DB="db"
    OIDC="oidc"
    API="api"
    ;;
  h)
    echo $USAGE
    exit 0
    ;;
  ?)
    echo $USAGE
    exit 1
    ;;
  esac
done

#
# Run the build if requested.
#
if [[ $BUILD = true ]]; then
  docker-compose build
  if [[ $? -ne 0 ]]; then
    echo "build failed"
    exit 1
  fi
fi

#
# Start services.
#
docker-compose up $DB $OTEL $OIDC $API
