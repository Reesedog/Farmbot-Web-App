import * as React from "react";
import axios from "axios";
import { t } from "i18next";
import * as _ from "lodash";
import { error as log, success, init as logInit } from "farmbot-toastr";
import { AuthState } from "../auth/interfaces";
import { prettyPrintApiErrors, HttpData } from "../util";
import { API } from "../api";
import { Session } from "../session";
import { FrontPageState } from "./interfaces";
import { Row, Col, Widget, WidgetHeader, WidgetBody } from "../ui/index";

export class FrontPage extends React.Component<{}, Partial<FrontPageState>> {
  constructor() {
    super();
    this.state = {
      regEmail: "",
      regName: "",
      regPassword: "",
      regConfirmation: "",
      email: "",
      loginPassword: "",
      showServerOpts: false,
      serverURL: "",
      serverPort: "",
      forgotPassword: false,
      agreeToTerms: false
    };
    this.toggleServerOpts = this.toggleServerOpts.bind(this);
  }

  componentDidMount() {
    logInit();
    API.setBaseUrl(API.fetchBrowserLocation());
    this.setState({
      serverURL: API.fetchHostName(),
      serverPort: API.inferPort()
    });
  }

  set = (name: keyof FrontPageState) =>
    (event: React.FormEvent<HTMLInputElement>) => {
      let state: { [name: string]: string } = {};
      state[name] = (event.currentTarget).value;
      // WHY THE 2 ms timeout you ask????
      // There was a bug reported in Firefox.
      // I have no idea why, but the checkbox would uncheck itself after being
      // checked. Some sort of race condtion. ¯\_(ツ)_/¯
      setTimeout(() => this.setState(state), 2);
    };

  submitLogin(e: React.FormEvent<{}>) {
    e.preventDefault();
    let { email, loginPassword, showServerOpts } = this.state;
    let payload = { user: { email, password: loginPassword } };
    let url: string;
    if (showServerOpts) {
      url = `//${this.state.serverURL}:${this.state.serverPort}`;
    } else {
      url = API.fetchBrowserLocation();
    }
    API.setBaseUrl(url);
    axios.post(API.current.tokensPath, payload)
      .then((resp: HttpData<AuthState>) => {
        Session.put(resp.data);
        window.location.href = "/app/controls";
      }).catch((error: Error) => {
        if (_.get(error, "response.status") === 451) {
          window.location.href = "/tos_update.html";
        }
        log(prettyPrintApiErrors(error as {}));
      });
  }

  submitRegistration(e: React.FormEvent<{}>) {
    e.preventDefault();
    let { regEmail, regName, regPassword, regConfirmation, agreeToTerms } = this.state;
    let form = {
      user: {
        name: regName,
        email: regEmail,
        password: regPassword,
        password_confirmation: regConfirmation,
        agree_to_terms: agreeToTerms
      }
    };
    axios.post(API.current.usersPath, form).then(() => {
      let m = "Almost done! Check your email for the verification link.";
      success(t(m));
    }).catch(error => {
      log(prettyPrintApiErrors(error));
    });
  }

  toggleServerOpts() {
    this.setState({ showServerOpts: !this.state.showServerOpts });
  }

  toggleForgotPassword() {
    this.setState({ forgotPassword: !this.state.forgotPassword });
  }

  submitForgotPassword(e: React.SyntheticEvent<HTMLInputElement>) {
    e.preventDefault();
    let { email } = this.state;
    let data = { email };
    axios.post(API.current.passwordResetPath, data)
      .then(() => {
        success("Email has been sent.", "Forgot Password");
        this.setState({ forgotPassword: false });
      }).catch(error => {
        log(prettyPrintApiErrors(error));
      });
  }

  maybeRenderTos() {
    const TOS_URL = process.env.TOS_URL;
    if (TOS_URL) {
      const PRV_URL = process.env.PRIV_URL;
      return <div>
        <div>
          <label>{t("I agree to the terms of use")}</label>
          <input type="checkbox"
            onChange={this.set("agreeToTerms").bind(this)}
            value={this.state.agreeToTerms ? "false" : "true"} />
        </div>
        <ul>
          <li><a href={PRV_URL}>{t("Privacy Policy")}</a></li>
          <li><a href={TOS_URL}>{t("Terms of Use")}</a></li>
        </ul>
      </div>;
    }
  }

  render() {
    let buttonStylesUniqueToOnlyThisPage = {
      marginTop: "1rem",
      padding: ".5rem 1.6rem",
      fontSize: "1.2rem",
      borderBottom: "none"
    };

    let { showServerOpts, forgotPassword } = this.state;
    let expandIcon = showServerOpts ? "minus" : "plus";
    let { toggleServerOpts } = this;

    return (
      <div className="front-page">
        <Row>
          <h1>{t("Welcome to the FarmBot Web App")}</h1>
        </Row>

        <Row>
          <h2 className="hidden-xs hidden-sm hidden-md">
            {t("Setup, customize, and control FarmBot from your computer")}
          </h2>
          <h2 className="hidden-xs hidden-lg hidden-xl">
            {t("Setup, customize, and control FarmBot from your tablet")}
          </h2>
          <h2 className="hidden-md hidden-lg hidden-xl">
            {t("Setup, customize, and control FarmBot from your smartphone")}
          </h2>
          <img
            className="hidden-xs hidden-sm hidden-md"
            src="/app-resources/img/farmbot-desktop.png"
          />
          <img
            className="hidden-xs hidden-md hidden-lg hidden-xl"
            src="/app-resources/img/farmbot-tablet.png"
          />
        </Row>

        {!forgotPassword && (
          <Widget>
            <WidgetHeader title={"Login"}>
              <button
                className="fb-button gray"
                onClick={toggleServerOpts}
              >
                <i className={`fa fa-${expandIcon}`} />
              </button>
            </WidgetHeader>
            <WidgetBody>
              <form onSubmit={this.submitLogin.bind(this)}>
                <label>{t("Email")}</label>
                <input
                  type="email"
                  onChange={this.set("email").bind(this)}
                />
                <label>{t("Password")}</label>
                <input
                  type="password"
                  onChange={this.set("loginPassword").bind(this)}
                />
                <a
                  className="forgot-password"
                  onClick={this.toggleForgotPassword.bind(this)}
                >
                  {t("Forgot password?")}
                </a>
                {this.state.showServerOpts &&
                  <div>
                    <label>{t("Server URL")}</label>
                    <input
                      type="text"
                      onChange={this.set("serverURL").bind(this)}
                      value={this.state.serverURL}
                    />
                    <label>{t("Server Port")}</label>
                    <input
                      type="text"
                      onChange={this.set("serverPort").bind(this)}
                      value={this.state.serverPort}
                    />
                  </div>
                }
                <Row>
                  <button
                    className="fb-button green"
                    style={buttonStylesUniqueToOnlyThisPage}
                  >
                    {t("Login")}
                  </button>
                </Row>
              </form>
            </WidgetBody>
          </Widget>
        )}
        {forgotPassword && (
          <Widget>
            <WidgetHeader title={"Create an Account"}>
              <button
                className="fb-button gray"
                onClick={this.toggleForgotPassword.bind(this)}
              >
                {t("BACK")}
              </button>
            </WidgetHeader>
            <WidgetBody>
              <form onSubmit={this.submitForgotPassword.bind(this)}>
                <label>{t("Enter Email")}</label>
                <input
                  type="email"
                  onChange={this.set("email").bind(this)}
                />
                <button
                  className="fb-button green"
                  style={buttonStylesUniqueToOnlyThisPage}
                >
                  {t("Send Password reset")}
                </button>
              </form>
            </WidgetBody>
          </Widget>
        )}
        <div className="row">
          <div className="widget-wrapper">
            <div className="row">
              <div className="col-sm-12">
                <div className="widget-header">
                  <h5> {t("Create An Account")} </h5>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-sm-12">
                <form onSubmit={this.submitRegistration.bind(this)} >
                  <div className="widget-body">
                    <div className="input-group">
                      <label>{t("Email")} </label>
                      <input type="email" onChange={this.set("regEmail").bind(this)} ></input>
                      <label>{t("Name")}</label>
                      <input type="text" onChange={this.set("regName").bind(this)}></input>
                      <label>{t("Password")}</label>
                      <input type="password"
                        onChange={this.set("regPassword").bind(this)}>
                      </input>
                      <label>{t("Verify Password")}</label>
                      <input type="password"
                        onChange={
                          this.set("regConfirmation").bind(this)}>
                      </input>
                      {this.maybeRenderTos()}
                    </div>
                    <div className="row">
                      <div className="col-xs-12">
                        <button
                          className="fb-button green"
                          style={buttonStylesUniqueToOnlyThisPage}
                        >
                          {t("Create Account")}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
