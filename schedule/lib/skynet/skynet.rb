require 'json'

require_relative 'credentials'
require_relative 'web_socket'
require_relative 'messagehandler.rb'

# The Device class is temporarily inheriting from Tim's HardwareInterface.
# Eventually, we should merge the two projects, but this is good enough for now.
class Skynet

  include Credentials, WebSocket

  attr_accessor :socket, :uuid, :token, :identified, :confirmed,
    :confirmation_id

  # On instantiation #new sets the @uuid, @token variables, connects to skynet
  def initialize
    super
    identified = false
    creds      = credentials
    @uuid      = creds[:uuid]
    @token     = creds[:token]
    @socket    = SocketIO::Client::Simple.connect 'http://skynet.im:80'
    @confirmed = false

    create_socket_events

    puts "uuid: #{@uuid}"

    @message_handler  = MessageHandler.new
  end

  def send_message(devices, message_hash )
    @socket.emit("message",{:devices => devices, :message => message_hash})
  end

  # Acts as the entry point for message traffic captured from Skynet.im.
  # This method is a stub for now until I have time to merge into Tim's
  # controller code. Returns a MessageHandler object (a class yet created).
  #def handle_message(channel, message)
  def handle_message(message)

puts "> message received at #{Time.now}"
#puts message

    if message.class.to_s == 'Hash'
      @message_handler.handle_message(message)
    end

    if message.class.to_s == 'String'
      message_hash = JSON.parse(message)
      @message_handler.handle_message(message_hash)
    end

  rescue
    raise "Runtime error while attempting to parse message: #{message}."
  end

end
