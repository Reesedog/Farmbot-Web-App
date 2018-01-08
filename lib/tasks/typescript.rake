require 'rake'
require 'erb'

class Typescript
  TYPE_MAPPING = {
    "bigint"                      => "number",
    "boolean"                     => "boolean",
    "integer"                     => "number",
    "timestamp without time zone" => "string",
    "character varying"           => "string",
  }

  INTERFACE_TPL = <<~END
    /** THIS INTERFACE IS AUTO-GENERATED BY A SCRIPT.
        DO NOT MANUALLY MODIFY, CHANGES WILL BE
        OVERWRITTEN WHEN DATABASE SCHEMA CHANGES

        If you do need to change this file, first write a database migration,
          then run `rake typescript:interfaces` */

    export interface <%= interface_name %> {
    <% fields.each do |field| %>  <%= field.head %>: <%= field.tail %>;
    <% end %>}
  END

  # CONFIG_KLASS = [ FbosConfig, WebAppConfig, FirmwareConfig ]

  def self.generate(klass)
    @klass  = klass
    results = ERB.new(INTERFACE_TPL).result(binding)
    File.open("webpack/config_storage/#{klass.table_name}.ts", "w") do |f|
      f.write(results)
    end
  end

  def self.klass
    @klass
  end

  def self.interface_name
    klass.name
  end

  def self.fields
    klass.columns.map do |col|
      t        = col.sql_type_metadata.sql_type
      col_type = TYPE_MAPPING[t] or raise "NO! #{t.inspect} is not in TYPE_MAPPING"
      Pair[col.name, col_type]
    end
  end
end

namespace :typescript do
  desc "This task does nothing"
  task :interfaces => :environment do
    Typescript.generate(WebAppConfig)
    Typescript.generate(FirmwareConfig)
    Typescript.generate(FbosConfig)
  end

  desc "Pick a random file that (maybe) needs unit tests"
  task :random_coverage => :environment do
    ideas = Dir["coverage/webpack/**/*.html"].sample(4)
    binding.pry
    sh `firefox #{ideas.join(" ")}`
  end
end
