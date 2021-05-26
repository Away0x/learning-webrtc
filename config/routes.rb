require 'sidekiq/web'

Rails.application.routes.draw do
  mount Sidekiq::Web => '/sidekiq'

  root 'rooms#index'

  resource :session, only: [:new, :create, :destroy]
  resources :users, only: [:index, :new, :create]
  resources :rooms, only: [:index, :create, :show]

  get '/demos', to: 'demos#index'
  get '/demos/collect', to: 'demos#collect'
  get '/demos/record', to: 'demos#record'
  get '/demos/desktop', to: 'demos#desktop'
  get '/demos/peer', to: 'demos#peer'
  get '/demos/cable', to: 'demos#cable'

end
