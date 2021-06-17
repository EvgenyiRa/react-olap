import React from 'react';
import LinearProgress from '@material-ui/core/LinearProgress';

class Loading extends React.Component {
  constructor(props) {
      super(props);
      //console.log('props',props);
      this.handleShow = this.handleShow.bind(this);
      this.handleHide = this.handleHide.bind(this);
      this.state = {
        vis:0
      };
      this.LPStyle={
        root: {
          width: '100%',
          position: 'fixed',
          top: 0,
          left: 0,
          height:'1.001em',
          zIndex: 8
        },
        hidden: {display:'none'}
      };
  }

  handleShow() {
    this.setState((state) => ({vis:++state.vis}));
  }

  handleHide() {
    this.setState((state) => ({vis:--state.vis}));
  }

  render() {
    return (
      <div style={ (this.state.vis>0)? this.LPStyle.root:this.LPStyle.hidden }>
        <LinearProgress />
      </div>
    );
  }
}

export default Loading;
