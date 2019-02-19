# All configuration related to validation of sequences. This includes
# information such as which operators and labels are allowed, custom validations
# when a sequence is saved and related error messages that result.
# This module helps unclutter sequence.rb by sweeping CeleryScript config under
# the rug. Shoving configuration into a module is not a design pattern. Feedback
# welcome for refactoring of this code.
module CeleryScriptSettingsBag
  class BoxLed
    def self.name
      "Raspberry Pi Box LED"
    end

    def self.exists?(id)
      true # Not super important right now. - RC 22 JUL 18
    end
  end

  PIN_TYPE_MAP          = { "Peripheral" => Peripheral,
                            "Sensor"     => Sensor,
                            "BoxLed3"    => BoxLed,
                            "BoxLed4"    => BoxLed, }
  ALLOWED_AXIS          = %w(x y z all)
  ALLOWED_CHAGES        = %w(add remove update)
  ALLOWED_CHANNEL_NAMES = %w(ticker toast email espeak)
  ALLOWED_EVERY_POINT_TYPE = %w(Tool GenericPointer Plant ToolSlot)
  ALLOWED_LHS_STRINGS   = [*(0..69)].map{|x| "pin#{x}"}.concat(%w(x y z))
  ALLOWED_LHS_TYPES     = [String, :named_pin]
  ALLOWED_MESSAGE_TYPES = %w(success busy warn error info fun debug)
  ALLOWED_OPS           = %w(< > is not is_undefined)
  ALLOWED_PACKAGES      = %w(farmbot_os arduino_firmware)
  ALLOWED_PIN_MODES     = [DIGITAL = 0, ANALOG = 1]
  ALLOWED_PIN_TYPES     = PIN_TYPE_MAP.keys
  ALLOWED_POINTER_TYPE  = %w(GenericPointer ToolSlot Plant)
  ALLOWED_RESOURCE_TYPE = %w(Device FarmEvent Image Log Peripheral Plant Point
                             Regimen Sequence Tool ToolSlot User GenericPointer)
  ALLOWED_RPC_NODES     = %w(calibrate change_ownership check_updates dump_info
                             emergency_lock emergency_unlock execute execute_script
                             factory_reset find_home home install_farmware
                             install_first_party_farmware _if move_absolute
                             move_relative power_off read_pin read_status reboot
                             register_gpio remove_farmware resource_update
                             send_message set_servo_angle set_user_env sync
                             take_photo toggle_pin update_farmware wait write_pin
                             zero )
  ALLOWED_SPEC_ACTION   = %w(dump_info emergency_lock emergency_unlock power_off
                             read_status reboot sync take_photo)
  ANY_VARIABLE          = %i(tool coordinate point identifier every_point)
  BAD_ALLOWED_PIN_MODES = '"%s" is not a valid pin_mode. Allowed values: %s'
  BAD_AXIS              = '"%s" is not a valid axis. Allowed values: %s'
  BAD_CHANNEL_NAME      = '"%s" is not a valid channel_name. Allowed values: %s'
  BAD_EVERY_POINT_TYPE  = '"%s" is not a type of group. Allowed values: %s'
  BAD_LHS               = 'Can not put "%s" into a left hand side (LHS)'\
                          ' argument. Allowed values: %s'
  BAD_MESSAGE           = "Messages must be between 1 and 300 characters"
  BAD_MESSAGE_TYPE      = '"%s" is not a valid message_type. Allowed values: %s'
  BAD_OP                = 'Can not put "%s" into an operand (OP) argument. '\
                          'Allowed values: %s'
  BAD_PACKAGE           = '"%s" is not a valid package. Allowed values: %s'
  BAD_PERIPH_ID         = 'Peripheral #%s does not exist.'
  BAD_PIN_TYPE          = '"%s" is not a type of pin. Allowed values: %s'
  BAD_POINTER_ID        = "Bad point ID: %s"
  BAD_POINTER_TYPE      = '"%s" is not a type of point. Allowed values: %s'
  BAD_REGIMEN           = 'Regimen #%s does not exist.'
  BAD_RESOURCE_ID       = "Can't find %s with id of %s"
  BAD_RESOURCE_TYPE     = '"%s" is not a valid resource_type. Allowed values: %s'
  BAD_SPEED             = "Speed must be a percentage between 1-100"
  BAD_SUB_SEQ           = 'Sequence #%s does not exist.'
  BAD_TOOL_ID           = 'Tool #%s does not exist.'
  CANT_ANALOG           = "Analog modes are not supported for Box LEDs"
  NO_PIN_ID             = "%s requires a valid pin number"
  NO_SUB_SEQ            = 'missing a sequence selection for `execute` block.'
  ONLY_ONE_COORD        = "Move Absolute does not accept a group of locations "\
                          "as input. Please change your selection to a single"\
                          " location."
  PLANT_STAGES          = %w(planned planted harvested sprouted)
  RESOURCE_UPDATE_ARGS  = [:resource_type, :resource_id, :label, :value]
  SCOPE_DECLARATIONS    = [:variable_declaration, :parameter_declaration]

  Corpus = CeleryScript::Corpus.new

  CORPUS_VALUES = {
     boolean: [TrueClass, FalseClass],
     float:   [Float],
     integer: [Integer],
     string:  [String],
  }.map { |(name, list)| Corpus.value(name, list) }

  CORPUS_ENUM = {
    every_point_type: ALLOWED_EVERY_POINT_TYPE,
    axis:             ALLOWED_AXIS,
    channel_name:     ALLOWED_CHANNEL_NAMES,
    lhs:              ALLOWED_LHS_STRINGS,
    message_type:     ALLOWED_MESSAGE_TYPES,
    op:               ALLOWED_OPS,
    package:          ALLOWED_PACKAGES,
    pin_mode:         ALLOWED_PIN_MODES,
    pin_type:         ALLOWED_PIN_TYPES,
    pointer_type:     ALLOWED_POINTER_TYPE,
    resource_type:    ALLOWED_RESOURCE_TYPE,
  }.map { |(name, list)| Corpus.enum(name, list) }

  CORPUS_ARGS   = {
    _else:         {defn: [:execute, :nothing]},
    _then:         {defn: [:execute, :nothing]},
    locals:        {defn: [:scope_declaration]},
    offset:        {defn: [:coordinate]},
    pin_number:    {defn: [Integer, :named_pin]},
    data_value:    {defn: ANY_VARIABLE},
    default_value: {defn: ANY_VARIABLE},
    location:      {defn: ANY_VARIABLE},
    label:         {defn: [String]},
    milliseconds:  {defn: [Integer]},
    package:       {defn: [String]},
    pin_value:     {defn: [Integer]},
    radius:        {defn: [Integer]},
    rhs:           {defn: [Integer]},
    url:           {defn: [String]},
    value:         {defn: [String, Integer, TrueClass, FalseClass]},
    version:       {defn: [Integer]},
    x:             {defn: [Integer, Float]},
    y:             {defn: [Integer, Float]},
    z:             {defn: [Integer, Float]},
    pin_id:        {defn: [Integer]},
    resource_id:   {defn: [Integer]},
  }.map do |(name, conf)|
    Corpus.arg(name, conf.fetch(:defn))
  end

  CORPUS_NODES  = {
    install_first_party_farmware: {},
    emergency_lock:        {},
    emergency_unlock:      {},
    read_status:           {},
    sync:                  {},
    power_off:             {},
    take_photo:            {},
    dump_info:             {},
    internal_entry_point:  {},
    nothing:               {},
    set_user_env:          { body: [:pair] },
    scope_declaration:     { body: SCOPE_DECLARATIONS },
    change_ownership:      { body: [:pair] },
    internal_farm_event:   { body: [:parameter_application] },
    internal_regimen:      { body: [:parameter_application] },
    tool:                  { args: [:tool_id]},
    coordinate:            { args: [:x, :y, :z]},
    move_relative:         { args: [:x, :y, :z, :speed]},
    channel:               { args: [:channel_name]},
    wait:                  { args: [:milliseconds]},
    home:                  { args: [:speed, :axis]},
    find_home:             { args: [:speed, :axis]},
    zero:                  { args: [:axis]},
    check_updates:         { args: [:package]},
    reboot:                { args: [:package]},
    toggle_pin:            { args: [:pin_number]},
    explanation:           { args: [:message]},
    rpc_ok:                { args: [:label]},
    calibrate:             { args: [:axis]},
    pair:                  { args: [:label, :value]},
    factory_reset:         { args: [:package]},
    point:                 { args: [:pointer_type, :pointer_id]},
    install_farmware:      { args: [:url]},
    update_farmware:       { args: [:package]},
    remove_farmware:       { args: [:package]},
    identifier:            { args: [:label]},
    variable_declaration:  { args: [:label, :data_value]},
    parameter_application: { args: [:label, :data_value]},
    parameter_declaration: { args: [:label, :default_value]},
    set_servo_angle:       { args: [:pin_number, :pin_value]},
    every_point:           { args: [:every_point_type]},
    send_message:          { args: [:message, :message_type],         body: [:channel]},
    execute:               { args: [:sequence_id],                    body: [:parameter_application]},
    _if:                   { args: [:lhs, :op, :rhs, :_then, :_else], body: [:pair]},
    sequence:              { args: [:version, :locals],               body: ALLOWED_RPC_NODES },
    rpc_request:           { args: [:label],                          body: ALLOWED_RPC_NODES },
    rpc_error:             { args: [:label],                          body: [:explanation]},
    execute_script:        { args: [:label],                          body: [:pair]},
  }.map { |(name, list)| Corpus.node(name, **list) }

  Corpus
      .arg(:pin_type,     [String]) do |node|
        enum(ALLOWED_PIN_TYPES, node, BAD_PIN_TYPE)
      end
      .arg(:pointer_id,   [Integer]) do |node, device|
        bad_node = !Point.where(id: node.value, device_id: device.id).exists?
        node.invalidate!(BAD_POINTER_ID % node.value) if bad_node
      end
      .arg(:pointer_type, [String]) do |node|
        enum(ALLOWED_POINTER_TYPE, node, BAD_POINTER_TYPE)
      end
      .arg(:pin_mode, [Integer]) do |node|
        enum(ALLOWED_PIN_MODES, node, BAD_ALLOWED_PIN_MODES)
      end
      .arg(:sequence_id, [Integer]) do |node|
        if (node.value == 0)
          node.invalidate!(NO_SUB_SEQ)
        else
          missing = !Sequence.exists?(node.value)
          node.invalidate!(BAD_SUB_SEQ % [node.value]) if missing
        end
      end
      .arg(:lhs, ALLOWED_LHS_TYPES) do |node|
          x = [ALLOWED_LHS_STRINGS, node, BAD_LHS]
          enum(*x) unless node.is_a?(CeleryScript::AstNode)
      end
      .arg(:op,              [String]) do |node|
        enum(ALLOWED_OPS, node, BAD_OP)
      end
      .arg(:channel_name,    [String]) do |node|
        enum(ALLOWED_CHANNEL_NAMES, node, BAD_CHANNEL_NAME)
      end
      .arg(:message_type,    [String]) do |node|
        enum(ALLOWED_MESSAGE_TYPES, node, BAD_MESSAGE_TYPE)
      end
      .arg(:tool_id,         [Integer]) do |node|
        node.invalidate!(BAD_TOOL_ID % node.value) if !Tool.exists?(node.value)
      end
      .arg(:package, [String]) do |node|
        enum(ALLOWED_PACKAGES, node, BAD_PACKAGE)
      end
      .arg(:axis, [String]) do |node|
        enum(ALLOWED_AXIS, node, BAD_AXIS)
      end
      .arg(:message, [String]) do |node|
        notString = !node.value.is_a?(String)
        tooShort  = notString || node.value.length == 0
        tooLong   = notString || node.value.length > 300
        node.invalidate! BAD_MESSAGE if (tooShort || tooLong)
      end
      .arg(:speed, [Integer]) do |node|
        node.invalidate!(BAD_SPEED) unless node.value.between?(1, 100)
      end
      .arg(:resource_type, [String]) do |n|
        enum(ALLOWED_RESOURCE_TYPE, n, BAD_RESOURCE_TYPE)
      end
      .arg(:every_point_type, [String]) do |node|
        enum(ALLOWED_EVERY_POINT_TYPE, node, BAD_EVERY_POINT_TYPE)
      end
      .node(:named_pin, args: [:pin_type, :pin_id]) do |node|
        args  = HashWithIndifferentAccess.new(node.args)
        klass = PIN_TYPE_MAP.fetch(args[:pin_type].value)
        id    = args[:pin_id].value
        node.invalidate!(NO_PIN_ID % [klass.name]) if (id == 0)
        bad_node = !klass.exists?(id)
        no_resource(node, klass, id) if bad_node
      end
      .node(:move_absolute, args: [:location, :speed, :offset]) do |n|
        loc = n.args[:location].try(:kind)
        n.invalidate!(ONLY_ONE_COORD) if loc == "every_point"
      end
      .node(:write_pin, args: [:pin_number, :pin_value, :pin_mode ]) do |n|
        no_rpi_analog(n)
      end
      .node(:read_pin, args: [:pin_number, :label, :pin_mode]) do |n|
        no_rpi_analog(n)
      end
      .node(:resource_update, args: RESOURCE_UPDATE_ARGS) do |x|
        resource_type = x.args.fetch(:resource_type).value
        resource_id   = x.args.fetch(:resource_id).value
        check_resource_type(x, resource_type, resource_id)
      end

  ANY_ARG_NAME  = Corpus.as_json[:args].pluck("name").map(&:to_s)
  ANY_NODE_NAME = Corpus.as_json[:nodes].pluck("name").map(&:to_s)

  def self.no_resource(node, klass, resource_id)
    node.invalidate!(BAD_RESOURCE_ID % [klass.name, resource_id])
  end

  def self.check_resource_type(node, resource_type, resource_id)
    case resource_type # <= Security critical code (for const_get'ing)
    when "Device"
      # When "resource_type" is "Device", resource_id always refers to
      # the current_device.
      # For convinience, we try to set it here, defaulting to 0
      node.args[:resource_id].instance_variable_set("@value", 0)
    when *ALLOWED_RESOURCE_TYPE.without("Device")
      klass       = Kernel.const_get(resource_type)
      resource_ok = klass.exists?(resource_id)
      no_resource(node, klass, resource_id) unless resource_ok
    end
  end
  # Given an array of allowed values and a CeleryScript AST node, will DETERMINE
  # if the node contains a legal value. Throws exception and invalidates if not.
  def self.enum(array, node, tpl)
    val = node.try(:value)
    unless array.include?(val)
      node.invalidate!(tpl % [val.to_s, array.inspect])
    end
  end

  def self.no_rpi_analog(node)
    args        = HashWithIndifferentAccess.new(node.args)
    pin_mode    = args.fetch(:pin_mode).try(:value) || DIGITAL
    pin_number  = args.fetch(:pin_number)
    is_analog   = pin_mode == ANALOG
    is_node     = pin_number.is_a?(CeleryScript::AstNode)
    needs_check = is_analog && is_node

    if needs_check
      pin_type_args = pin_number.args.with_indifferent_access
      pin_type      = pin_type_args.fetch(:pin_type).try(:value) || ""
      node.invalidate!(CANT_ANALOG) if pin_type.include?("BoxLed")
    end
  end
end
