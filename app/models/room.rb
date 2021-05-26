class Room < ApplicationRecord
  belongs_to :anchor, :class_name => 'User', optional: true
end
