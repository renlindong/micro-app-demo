// import { add } from "lodash"
import React from "react";
import ReactDOM from "react-dom";
class LikeButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = { liked: false };
  }

  render() {
    if (this.state.liked) {
      return 'You liked this.';
    }

    return React.createElement(
      'button',
      { onClick: () => this.setState({ liked: true }) },
      'Like'
    );
  }
}

const run = () => {
  const container = document.getElementById('root')
  console.log(container)
  ReactDOM.render(
    React.createElement(LikeButton),
    container
  )
}

run()