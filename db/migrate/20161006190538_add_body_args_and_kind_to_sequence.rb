class AddBodyArgsAndKindToSequence < ActiveRecord::Migration[4.2]
  def change
    add_column :sequences, :kind, :string, default: "sequence"
    add_column :sequences, :args, :text
    add_column :sequences, :body, :text
  end
end
