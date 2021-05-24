FROM ruby:2.7.2-alpine

ENV LANG en_US.UTF-8
ENV LANGUAGE en_US.UTF-8
ENV LC_ALL C.UTF-8
ENV RAILS_ENV production
ENV NODE_ENV production

RUN apk add --no-cache \
  tzdata \
  postgresql-dev \
  nodejs \
  yarn \
  nginx

WORKDIR /app

ADD . /app

RUN apk add --no-cache --virtual .build-deps build-base \
  && bundle install --without development test \
  && rm -rf /usr/local/bundle/cache/*.gem \
  && apk del --no-network .build-deps

RUN bundle exec rails assets:precompile SECRET_KEY_BASE=fake_secure_for_compile \
  && yarn cache clean \
  && rm -rf node_modules tmp/cache/* /tmp/*

RUN cp docker/nginx/default.conf /etc/nginx/nginx.conf

EXPOSE 3000

CMD ["docker/production_start.sh"]
