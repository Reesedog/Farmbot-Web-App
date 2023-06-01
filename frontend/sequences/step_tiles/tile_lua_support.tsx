import React from "react";
import Editor, { loader } from "@monaco-editor/react";
loader.config({ paths: { vs: "/assets/monaco" } });
import { StepParams } from "../interfaces";
import { Assertion, Lua } from "farmbot/dist/corpus";
import { editStep } from "../../api/crud";
import { InputLengthIndicator } from "../inputs/input_length_indicator";
import { debounce } from "lodash";
import { Path } from "../../internal_urls";

export interface LuaTextAreaProps<Step extends Lua | Assertion>
  extends StepParams<Step> {
  useMonacoEditor: boolean;
}

interface LuaTextAreaState {
  lua: string;
  controlled: boolean;
}

export class LuaTextArea<Step extends Lua | Assertion>
  extends React.Component<LuaTextAreaProps<Step>, LuaTextAreaState> {
  state: LuaTextAreaState = {
    lua: this.props.currentStep.args.lua,
    controlled: false,
  };

  updateStep = debounce((newLua: string) => {
    if (this.props.readOnly) { return; }
    this.props.dispatch(editStep({
      step: this.props.currentStep,
      index: this.props.index,
      sequence: this.props.currentSequence,
      executor(c: Step) { c.args.lua = newLua; }
    }));
  }, 500);

  onChange = (value: string) => {
    this.setState({ controlled: true });
    this.setLua(value || "");
    this.updateStep(this.lua);
  };

  componentDidUpdate() {
    if (this.luaCodeBuffer) {
      const textarea = document.getElementById(`lua-textarea-${this.props.index}`);
      if (textarea) { textarea.scrollTop = 99999; }
    }
  }

  get luaCodeBuffer() { return localStorage.getItem(`lua_code_${this.props.index}`); }
  get lua() {
    return this.state.controlled
      ? this.state.lua
      : this.luaCodeBuffer || this.state.lua;
  }

  setLua = (value: string) => !this.props.readOnly && this.setState({ lua: value });

  FallbackEditor = ({ loading }: { loading?: boolean }) =>
    <textarea id={`lua-textarea-${this.props.index}`}
      className={(loading ? "" : "fallback-lua-editor")}
      autoFocus={!!this.luaCodeBuffer}
      value={this.lua}
      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
        this.setLua(e.currentTarget.value)}
      onBlur={() => this.updateStep(this.lua)}
      style={getTextAreaStyleHeight(this.lua)} />;

  render() {
    return <div className={"lua-input"}>
      <div className={`lua-editor ${Path.inDesigner() ? "" : "full"}`}>
        {this.props.useMonacoEditor && !this.luaCodeBuffer
          ? <Editor
            language={"lua"}
            options={{ minimap: { enabled: false } }}
            value={this.lua}
            loading={<this.FallbackEditor loading={true} />}
            onChange={this.onChange} />
          : <this.FallbackEditor />}
      </div>
      <InputLengthIndicator field={"lua"} value={this.lua} />
    </div>;
  }
}

const getTextAreaStyleHeight = (contents: string) => ({
  height: `${((contents.split("\n").length) + 1) * 1.25}em`
});
