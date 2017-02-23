# Not the same thing as a Regimen. A farm_event is a "dumb" list of sequecnes that
# are executed at fixed intervals. FarmEvents are less flexible than Regimens
# because they can only perform one sequence. Also unlike Regimens, they can run
# forever.
class FarmEvent < ActiveRecord::Base
  NEVER              = :never
  UNITS_OF_TIME      = %w(never minutely hourly daily
                          weekly monthly yearly) << NEVER
  EXECUTABLE_CLASSES = [Sequence, Regimen]
  belongs_to :executable, polymorphic: true
  validates :executable, presence: true
  belongs_to :device
  validates :device_id, presence: true

  class NullSchedule
    def initialize(*)
    end

    def next_occurrence
    end

    def occurrences_between(*)
      []
    end
  end

  def farm_event_rules
    @farm_event_rules ||= make_rules!
  end

  def calculate_next_occurence
    farm_event_rules.next_occurrence
  end

  def calendar(start = Time.now.midnight, finish = end_time)
    farm_event_rules.occurrences_between(start, finish)
  end

  def make_rules!
    unit  = time_unit.to_sym
    klass = unit == NEVER ? NullSchedule : IceCube::Schedule
    klass.new(start_time, end_time: end_time) do |sch|
      sch.add_recurrence_rule IceCube::Rule.send(unit, repeat)
    end
  end
end
