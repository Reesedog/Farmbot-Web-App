import { times } from "lodash";
import { connect, MqttClient } from "mqtt";
import { Terminal } from "xterm";

type TerminalLike = Pick<Terminal, "write" | "onKey">;
type KeysWeNeed = "publish" | "on" | "once" | "publish" | "subscribe";

export class TerminalSession {
  private buffer: string = "";
  private client: Pick<MqttClient, KeysWeNeed>;

  constructor(url: string, public username: string,
    password: string,
    private terminal: TerminalLike) {
    this.client = connect(url, { username, password });
  }

  get rx() { return `bot/${this.username}/terminal_output` };
  get tx() { return `bot/${this.username}/terminal_input` };

  connect = () => {
    return new Promise((resolve) => {
      this.client.once("connect", () => {
        this.client.subscribe(this.rx);
        this.terminal.onKey(this.terminalKeyboardHandler);
        this.client.on("message", this.terminalMessageHandler);
      });
      resolve();
    });
  }

  erase = (n: number) => {
    times(Math.max(0, n), () => {
      this.buffer = this.buffer.slice(0, -2);
      this.terminal.write("\b \b");
    });
  }

  clearBuffer = () => {
    this.erase(this.buffer.length - 1);
    this.buffer = "";
  };

  terminalMessageHandler = (m: string, payload: Buffer) => {
    if (m.includes("terminal_output")) {
      this.terminal.write(payload);
    }
  }

  terminalKeyboardHandler = ({ key: key }: { key: string }) => {
    this.buffer += key;
    console.log(this.buffer);
    switch (key) {
      case "\r":
        if (!["\r", "\r\r"].includes(this.buffer)) {
          this.client.publish(this.tx, this.buffer);
        }
        this.clearBuffer();
        break;
      case "\b":
      case String.fromCharCode(127):
        this.erase(1);
        break;
      default:
        this.terminal.write(key);
    }
  }
}
