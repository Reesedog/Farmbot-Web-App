class DeviceService
  constructor: (@$rootScope, @$http, @Command, @Router, @socket) ->
    [@log, @list, @current, @status] = [[], [], {}, {meshblu: "Connecting"}]
    @initConnections()

  initConnections: ->
    ok = (data, status, request, meta) =>
      @list     = data
      # TODO: Real error handling.
      alert 'You need to link a Farmbot to your account.' unless data[0]
      @current  = data[0]
      @connectToMeshBlu()
    @$http.get('api/devices').success(ok).error(@ajaxError)

  ajaxError: (data, status, request, meta) =>
    alert "Oh no! I could not connect to the My Farmbot service. The server" +
          " might be temporarily down"

  save: (device) ->
    if !!device._id then @update(device) else @create(device)

  update: (device) ->
    ok = (data) =>
      @list = _.without(@list, _.find(@list, {_id: device._id}))
      @list.push(data)
    @$http.put("api/devices/#{device._id}", device)
    .success(ok)
    .error(@ajaxError)

  create: (device) ->
    ok = (data) =>
      @current = data # Set new one to current one.
      @list.push(data)
    @$http.post("api/devices", device)
    .success(ok)
    .error(@ajaxError)

  remove: (device) ->
    @$http
      .delete("api/devices/#{device._id}")
      .success(=> @list = _.without(@list, device))
      .error(@ajaxError)

  handleMsg: (data) =>
    bot = _.find(@list, {uuid: data.fromUuid})
    @$rootScope.$apply(@Router.create(data, bot))

  handleStatus: (data) ->
    @status = data

  connectToMeshBlu: ->
    # Avoid double connections
    unless @connection?.connected
      debugger
      skynet = {createConnection: ->
                  console.warn "Need to deprecate skynetJS"
                  return {on: -> null}}
      @connection = skynet.createConnection
        # TODO: Why is this hardcoded?
        type:  "farmbotdss"
        uuid:  "adca1b97-aad9-486d-b0b4-aafe38ce2486"
        token: "d294de10955e0f76b1f7620bcede6f61"
      @connection.on "ready", (data) =>
        @$rootScope.$apply(=> @status.meshblu = "online")
        @connection.on "message", @handleMsg
        @connection.on "status", @handleStatus
    else
      console.log "[WARN] Already connected to MeshBlu."

  getStatus: (cb) ->
    @current.status = 'Fetching data'
    @send(@Command.create("read_status"), cb)

  togglePin: (number, cb) ->
    #TODO Untested.
    pin = "pin#{number}"
    if @current[pin] is on
      @current[pin] = off
      message = {pin: pin_number, value1: 1, mode: 0}
    else
      @current[pin] = on
      message = {pin: pin_number, value1: 0, mode: 0}
    @send @Command.create("pin_write", message), cb
    console.log "Pin #{number} is now #{@current[pin]}"

  moveRel: (x, y, z, cb) ->
    @send(@Command.create("move_rel", {x: 0, y: 0, z: 0}), cb)

  moveAbs: (x, y, z, cb) ->
    @send(@Command.create("move_abs", {x: 0, y: 0, z: 0}), cb)

  send: (msg, cb = (d) -> console.log(d)) ->
    if !!@connection
      @connection.message
        devices: @current.uuid
        payload: msg
        , => @$rootScope.$apply(cb)
    else
      console.warn("Already connected to Meshblu")

angular.module("FarmBot").service "Devices",[
  '$rootScope'
  '$http'
  'Command'
  'Router'
  'socket'
  ($rootScope, $http, Command, Router, socket) ->
    return new DeviceService($rootScope, $http, Command, Router, socket)
]
