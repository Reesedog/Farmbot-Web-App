require 'spec_helper'

describe Sequences::AstValidation do
  let(:nodes) {
      # Big 'ol valid tree.
      JSON.parse(
        '[{"kind":"move_absolute","args":{"x":1,"y":2,"z":3,"speed":4}}'+
        ',{"kind":"move_relative","args":{"x":1,"y":2,"z":3,"speed":4}}'+
        ',{"kind":"write_pin","args":{"pin_number":1,"pin_value":0,'+
        '"pin_mode":1}},{"kind":"read_pin","args":{"pin_number":1,"data_label"'+
        ':"probably_a_variable"}},{"kind":"wait","args":{"milliseconds":5000}}'+
        ',{"kind":"send_message","args":{"message":"Value is {{ '+
        'probably_a_variable }}"}},{"kind":"execute","args":{"sub_sequence_id":'+
        '123}},{"kind":"if_statement","args":{"lhs":"x","op":">","rhs":5,'+
        '"sub_sequence_id":123}}]')
  }
  it 'validates the sequence AST' do
    puts "You were here. Connor needed help, tho."
    Sequences::AstValidation.run!(body: nodes)
  end
end
