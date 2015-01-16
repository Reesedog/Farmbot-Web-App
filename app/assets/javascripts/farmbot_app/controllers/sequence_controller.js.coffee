# The sequence controller supports the WYSIWYG sequence editor.
angular.module('FarmBot').controller "SequenceController", [
  '$scope'
  'Command'
  'Devices'
  ($scope, Command, Devices) ->
    # Stub for now. Maybe we can randomly set this in the
    # backend on creation or something.
    debugger
    randomColor = ->
      colors =
        ['blue'
         'green'
         'yellow'
         'orange'
         'purple'
         'pink'
         'gray'
         'red']
      _.sample(colors)

    $scope.command =
      name: 'Untitled Sequence'
      color: randomColor()
      steps: []

    $scope.dragControlListeners = {}
    $scope.storedSequences = [
      {name: 'Scare Away the Birds',
      color: randomColor(),
      steps:[Command.create("move_rel"), Command.create("move_rel"), Command.create("move_abs")]}

      {name: 'Move Away For Maintenance',
      color: randomColor(),
      steps:[Command.create("move_abs"), Command.create("move_rel"), Command.create("move_rel")]}
    ]

    $scope.copy = (obj, index) -> $scope.command.steps.splice((index + 1), 0, angular.copy(obj))
    $scope.remove = (index) -> $scope.command.steps.splice(index, 1)
    $scope.add = (name) -> $scope.command.steps.push(Command.create(name))
    $scope.load = (seq) -> $scope.command = seq
    $scope.save = ->
      oldSeq = _.find($scope.storedSequences, {name: $scope.command.name})
      if oldSeq
        oldSeq = $scope.command
      else
        $scope.storedSequences.push($scope.command)
]
