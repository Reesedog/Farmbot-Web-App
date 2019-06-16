import { connect, MqttClient } from "mqtt";
import { detectLanguage } from "../i18n";
import { shortRevision, attachToRoot } from "../util";
import { stopIE } from "../util/stop_ie";
import I from "i18next";
import React from "react";
import { uuid } from "farmbot";
import axios from "axios";

// TYPES AND INTERFACES ==========================

interface State {
  client?: MqttClient;
  error: Error | undefined;
}

// CONSTANTS =====================================

const WS_CONFIG = {
  username: "farmbot_guest",
  password: "required, but not used.",
};

const SECRET = uuid().split("-").join("");
const MQTT_CHAN = "guest_registry/" + SECRET;
const HTTP_URL = "/api/guest_account";

// APPLICATION CODE ==============================

export class DemoLoader extends React.Component<{}, State> {
  state: State = {
    client: undefined,
    error: undefined
  };

  setError =
    (error?: Error) => this.setState({ error });

  componentWillMount() {
    const client =
      connect(globalConfig.MQTT_WS, WS_CONFIG);
    this.setState({ client });
    client.on("message", this.handleMessage);
    client.subscribe(MQTT_CHAN, this.setError);
  }

  handleMessage =
    (chan: string, buffer: Buffer) => {
      debugger;
    }

  requestAccount = () => {
    axios
      .post<string>(HTTP_URL, { secret: SECRET })
      .then(console.dir)
      .catch(this.setError);
  };

  ok = () => <button onClick={this.requestAccount}>
    TRY FARMBOT
  </button>;

  no = () => {
    const message =
      // tslint:disable-next-line:no-null-keyword
      JSON.stringify(this.state.error, null, 2);

    return <pre>
      {message}
    </pre>;
  }

  render() {
    return this.state.error ?
      this.no() : this.ok();
  }
}

// BOOTSTRAPPING CODE ============================

stopIE();

console.log(shortRevision());

detectLanguage().then((config) => {
  I.init(config, () => {
    attachToRoot(DemoLoader);
  });
});
