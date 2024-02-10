# syntax=docker/dockerfile:1

FROM node:21-alpine3.18

#
# Create a user to run as.
#
RUN addgroup oidcrunner &&  \
    adduser --ingroup oidcrunner -D --shell /bin/false oidcrunner

#
# Add curl for healthchecks.
#
RUN apk add curl

#
# Copy the app and config files.
#
COPY --chown=oidcrunner app.js /home/oidcrunner/app.js
COPY --chown=oidcrunner package.json /home/oidcrunner/package.json
COPY --chown=oidcrunner package-lock.json /home/oidcrunner/package-lock.json
COPY --chown=oidcrunner .secret.env /home/oidcrunner/.secret.env

#
# Switch to the new user.
#
USER oidcrunner
WORKDIR /home/oidcrunner

#
# Install depencencies.
#
RUN npm install

#
# Clean up.
#
RUN npm prune --production

#
# Expose the port the application runs on.
#
EXPOSE 3000

#
# Start the application assuming that the appropriate
# environment variables will be set by the runtime environment.
#
ENTRYPOINT ["npm", "run", "start"]
