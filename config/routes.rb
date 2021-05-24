require 'sidekiq/web'

Rails.application.routes.draw do
  mount Sidekiq::Web => '/sidekiq'

  root 'rooms#index'

  resource :session, only: [:new, :create, :destroy]
  resources :users, only: [:index, :new, :create]
  resources :rooms, only: [:index, :create]

  get '/demos', to: 'demos#index'
  get '/demos/collect', to: 'demos#collect'
  get '/demos/record', to: 'demos#record'
  get '/demos/desktop', to: 'demos#desktop'

end
