class User < ApplicationRecord
  has_many :rooms, foreign_key: :anchor_id
  has_secure_password
end
