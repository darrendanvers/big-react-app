ARG BUILD_HOME=/api-react

FROM gradle:8.6-jdk17-alpine as build_image

ARG BUILD_HOME
WORKDIR $BUILD_HOME

COPY --chown=gradle:gradle build.gradle .
COPY --chown=gradle:gradle settings.gradle .
COPY --chown=gradle:gradle src ./src
COPY --chown=gradle:gradle config ./config

RUN gradle --no-daemon build

FROM openjdk:17-alpine

ARG BUILD_HOME
ENV APP_HOME=$BUILD_HOME

RUN addgroup -S apireact && adduser -S apireact -G apireact
COPY --from=build_image --chown=apireact:apireact $BUILD_HOME/build/libs/api-react-1.0.0.jar $APP_HOME/app.jar
USER apireact

ENTRYPOINT java -jar $APP_HOME/app.jar