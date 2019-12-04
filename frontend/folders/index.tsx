import React from "react";
import { Page, Col, Row } from "../ui";
import { FolderUnion, RootFolderNode } from "./constants";
import { Everything } from "../interfaces";
import { connect } from "react-redux";
import { createFolder, deleteFolder } from "./actions";

type Props = RootFolderNode;
type State = {};

export class RawFolders extends React.Component<Props, State> {
  Node = ({ node }: { node: FolderUnion }) => {
    const style: React.CSSProperties =
      { color: node.color, background: "black" };
    const creator = () => createFolder({ parent_id: node.id });
    const subfolderBtn = <span>
      <button onClick={creator}>
        Subfolder
      </button>
    </span>;
    const deleteBtn = <span>
      <button onClick={() => deleteFolder(node.id)}>
        Delete
      </button>
    </span>;
    switch (node.kind) {
      case "initial":
        return <div style={style} >
          {subfolderBtn}
          <span><button>Edit</button></span>
          {deleteBtn}
          <span><input style={style} value={"folder " + node.name} onChange={() => { }} /></span>
          {node.children.map((n2: FolderUnion) => <this.Node node={n2} key={n2.id} />)}
        </div>;
      case "medial":
        return <div style={{ ...style, marginLeft: "30px" }} >
          {subfolderBtn}
          <span><button>Edit</button></span>
          {deleteBtn}
          <span><input style={style} value={"folder " + node.name} onChange={() => { }} /></span>
          {node.children.map((n2: FolderUnion) => <this.Node node={n2} key={n2.id} />)}
        </ div>;
      case "terminal":
        return <div style={{ ...style, marginLeft: "40px" }} >
          <span><button>Edit</button></span>
          {deleteBtn}
          <span><input style={style} value={"folder " + node.name} onChange={() => { }} /></span>
        </div>;
    }
  }

  Graph = (_props: {}) => {
    return <div>
      {this.props.folders.map(grandparent => {
        return <this.Node node={grandparent} key={grandparent.id} />;
      })}
    </div>;
  }

  render() {
    return <Page>
      <Col xs={12} sm={6} smOffset={3}>
        <Row>
          <input placeholder={"Search"} disabled={true} />
          <button onClick={() => createFolder()}>
            Add Folder
          </button>
          <button>
            Add Sequence
          </button>
        </Row>
      </Col>
      <Col xs={12} sm={6} smOffset={3}>
        <Row> <this.Graph /> </Row>
        <Row>
          <pre>
            {JSON.stringify(this.props.folders, undefined, "  ")}
          </pre>
        </Row>
      </Col>
    </Page>;
  }
}

export function mapStateToProps(props: Everything): Props {
  return props.resources.index.sequenceFolders;
}

export const Folders = connect(mapStateToProps)(RawFolders);
