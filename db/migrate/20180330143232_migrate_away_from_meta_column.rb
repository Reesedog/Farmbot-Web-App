class MigrateAwayFromMetaColumn < ActiveRecord::Migration[5.1]
  def up
    Device.all.map do |d|
      d.trim_log_list!(2)
    end
  end

  def down
  end
end
