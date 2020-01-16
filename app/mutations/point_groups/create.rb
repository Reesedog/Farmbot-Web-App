module PointGroups
  class Create < Mutations::Command
    include PointGroups::Helpers

    required do
      model :device, class: Device
      string :name
      array :point_ids, class: Integer
    end

    optional do
      string :sort_type
      hash :criteria do
        hash(:day) do
          string :op, in: [">", "<"]
          integer :days
        end
        hash(:string_eq) { array :*, class: String }
        hash(:number_eq) { array :*, class: Integer }
        hash(:number_lt) { integer :* }
        hash(:number_gt) { integer :* }
      end
    end

    def validate
      validate_point_ids
      validate_sort_type
    end

    def execute
      PointGroup.transaction do
        PointGroupItem.transaction do
          pg = PointGroup.new(name: name, device: device)
          add_point_group_items(pg)
          pg.save!
          pg
        end
      end
    end

    def add_point_group_items(pg)
      point_ids.uniq.map do |id|
        pg.point_group_items << PointGroupItem.new(point_id: id)
      end
    end
  end
end
