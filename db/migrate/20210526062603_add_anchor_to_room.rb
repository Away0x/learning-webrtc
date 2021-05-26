class AddAnchorToRoom < ActiveRecord::Migration[6.1]
  def change
    add_column :rooms, :anchor_id, :integer, references: :user, null: true
  end
end
