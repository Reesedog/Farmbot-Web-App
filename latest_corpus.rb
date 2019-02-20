class CorpusEmitter
  PIPE = "\n  | "

  class CSArg
    TRANSLATIONS = {"integer" => "number",
                    "string"  => "string",
                    "float"   => "number",
                    "boolean" => "boolean" }

    attr_reader :name, :allowed_values

    def initialize(name:, allowed_values:)
        @name, @allowed_values = name, allowed_values
    end

    def camelize
      name.camelize
    end

    def values
      allowed_values
        .map { |v| TRANSLATIONS[v] || v.camelize }
        .uniq
        .sort
        .join("\n    | ")
    end

    def to_ts
      "\n    #{name}: #{values};"
    end
  end


  class CSNode
    UNDEFINED = "undefined"

    attr_reader :name, :allowed_args, :allowed_body_types

    def initialize(name:, allowed_args:, allowed_body_types: [], tags:)
        @name,
        @allowed_args,
        @allowed_body_types = name, allowed_args, allowed_body_types
    end

    def camelize
        name.camelize
    end

    def arg_names
      allowed_args
        .map{ |x| ARGS[x] }
        .each { |x| raise "NON-EXISTENT ARG TYPE" unless x }
        .map(&:to_ts)
        .join("")
    end

    def items_joined_by_pipe
      allowed_body_types.map(&:camelize).join(PIPE)
    end

    def body_names
      b = items_joined_by_pipe
      (b.length > 0) ? "(#{b})[] | undefined" : UNDEFINED
    end

    def has_body?
      body_names != UNDEFINED
    end

    def body_type
      "export type #{camelize}BodyItem = #{items_joined_by_pipe};" if has_body?
    end

    def body_attr
      "body?: #{ has_body? ? (camelize + "BodyItem[] | undefined") : UNDEFINED };"
    end

    def to_ts
      <<~NODE_EXPORTS
      #{body_type}
      export interface #{camelize} {
        kind: #{name.inspect};
        args: {#{arg_names}
        };
        comment?: string | undefined;
        #{body_attr}
      }
      NODE_EXPORTS
    end
  end

  HASH  = JSON.load(open("http://#{ENV.fetch("API_HOST")}:3000/api/corpus")).deep_symbolize_keys
  ARGS  = {}
  HASH[:args]
    .map  { |x| CSArg.new(x) }
    .each { |x| ARGS[x.name] = x }
  NODES = HASH[:nodes].map { |x| CSNode.new(x) }

  def const(key, val)
    "export const #{key} = #{val};"
  end

  def enum_type(key, val, inspect = true)
    "export type #{key} = #{(inspect ? val.map(&:inspect) : val).join(PIPE)};"
  end

  def self.generate
    self.new.generate
  end

  def overwrite_warning_comment
    <<~COMMENT.strip
    // THIS INTERFACE WAS AUTO GENERATED ON #{Date.today}
    // DO NOT EDIT THIS FILE.
    // IT WILL BE OVERWRITTEN ON EVERY CELERYSCRIPT UPGRADE.
    COMMENT
  end

  def generate
    result = NODES.map(&:to_ts).map(&:strip)
    result.unshift(overwrite_warning_comment)
    result.push(enum_type :CeleryNode, NODES.map(&:name).map(&:camelize), false)
    result.push(const(:LATEST_VERSION, Sequence::LATEST_VERSION))
    result.push(const :DIGITAL, CeleryScriptSettingsBag::DIGITAL)
    result.push(const :ANALOG, CeleryScriptSettingsBag::ANALOG)
    result.push(enum_type :ALLOWED_PIN_MODES,
                CeleryScriptSettingsBag::ALLOWED_PIN_MODES)
    result.push(enum_type :ALLOWED_MESSAGE_TYPES,
                CeleryScriptSettingsBag::ALLOWED_MESSAGE_TYPES)
    result.push(enum_type :ALLOWED_CHANNEL_NAMES,
                CeleryScriptSettingsBag::ALLOWED_CHANNEL_NAMES)
    result.push(enum_type :ALLOWED_OPS,
                CeleryScriptSettingsBag::ALLOWED_OPS)
    result.push(enum_type :ALLOWED_PACKAGES,
                CeleryScriptSettingsBag::ALLOWED_PACKAGES)
    result.push(enum_type :ALLOWED_AXIS, CeleryScriptSettingsBag::ALLOWED_AXIS)
    result.push(enum_type :Color, Sequence::COLORS)
    result.push(enum_type :LegalArgString, HASH[:args].map{ |x| x[:name] }.sort.uniq)
    result.push(enum_type :LegalKindString, HASH[:nodes].map{ |x| x[:name] }.sort.uniq)
    result.push(enum_type :LegalSequenceKind, CeleryScriptSettingsBag::ALLOWED_RPC_NODES.sort)
    result.push(enum_type :DataChangeType, CeleryScriptSettingsBag::ALLOWED_CHAGES)
    result.push(enum_type :PointType, CeleryScriptSettingsBag::ALLOWED_POINTER_TYPE)
    result.push(enum_type :AllowedPinTypes, CeleryScriptSettingsBag::ALLOWED_PIN_TYPES)
    result.push(enum_type :PlantStage, CeleryScriptSettingsBag::PLANT_STAGES)
    result.push(enum_type :AllowedGroupTypes, CeleryScriptSettingsBag::ALLOWED_EVERY_POINT_TYPE)

    File.open("latest_corpus.ts", "w") do |f|
      f.write(result.join("\n\n").concat("\n"))
    end
  end
end

CorpusEmitter.generate
