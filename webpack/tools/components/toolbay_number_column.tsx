interface NumColProps {
  axis: "x" | "y" | "z";
  value: number;
  dispatch: Function;
  slot: TaggedToolSlotPointer;
}

export function ToolBayNumberCol({ axis, value, dispatch, slot }: NumColProps) {
  return <Col xs={2}>
    <BlurableInput
      value={value.toString()}
      onCommit={(e) => {
        dispatch(edit(slot, { [axis]: parseInt(e.currentTarget.value, 10) }));
      }}
      type="number" />
  </Col>;
}
