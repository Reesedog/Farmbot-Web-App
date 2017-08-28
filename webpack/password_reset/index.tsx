import * as React from "react";
import { render } from "react-dom";
import { detectLanguage } from "../i18n";
import { PasswordReset } from "./password_reset";
import * as i18next from "i18next";
import "../css/_index.scss";

detectLanguage().then((config) => {
  i18next.init(config, (err, t) => {
    const node = document.createElement("DIV");
    node.id = "root";
    document.body.appendChild(node);

    const reactElem = React.createElement(PasswordReset, {});
    const domElem = document.getElementById("root");

    if (domElem) {
      render(reactElem, domElem);
    } else {
      throw new Error(t("Add a div with id `root` to the page first."));
    }
  });
});
