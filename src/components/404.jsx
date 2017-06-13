import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin'
import './style.scss';


class NotFound extends React.Component{
  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }
  render() {
    return (
      <div>404 Not Found</div>
    )
  }
}

export default NotFound;