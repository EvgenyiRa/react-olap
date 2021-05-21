import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

import $ from 'jquery';

class CustomAlert extends React.Component {
  constructor(props) {
      super(props);
      //console.log('props',props);
      this.state = {
        show:false,
        title:'Сообщение',
        buttonOK:'OK',
        text:'',
        callback:undefined,
        size:'sm'
      };
      this.handleClick = this.handleClick.bind(this);
      this.handleShow = this.handleShow.bind(this);
  }

  handleClick() {
    this.setState({show:false,title:'Сообщение',buttonOK:'OK',text:'',size:'sm'});
    if (!!this.state.callback) {
      this.state.callback();
      this.setState({callback:undefined});
    }
  }

  handleShow() {
    $('div.fade.modal.show div.modal-footer button').focus();
  }

  render() {
    return (
      <Modal onEntered={ this.handleShow } size={ this.state.size } show={ this.state.show } centered onHide={()=>this.handleClick()} aria-labelledby="contained-modal-title-vcenter">
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            {this.state.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="show-grid">
          {this.state.text}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={()=>this.handleClick()} variant="primary">{ this.state.buttonOK }</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default CustomAlert;
