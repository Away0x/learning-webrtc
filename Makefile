install:
	bundle install --without production

seed:
	rails db:migrate:reset
	rails db:seed

console:
	rails console

fd-build:
	RAILS_ENV=production rails webpacker:compile

fd-dev:
	./bin/webpack-dev-server

cred:
	EDITOR=vim rails credentials:edit

dev:
	foreman start -f Procfile.dev

