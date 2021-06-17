import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

import $ from 'jquery'

class ConfirmPlus extends React.Component {
  constructor(props) {
      super(props);
      this.handleClick = this.handleClick.bind(this);
      this.handleShow = this.handleShow.bind(this);
      this.state = {
        show:false,
        text:'',
        callback:undefined,
      };
  }

  handleClick(value) {
    this.setState({show:false,text:''});
    if (!!this.state.callback) {
      this.state.callback(value);
      this.setState({callback:undefined});
    }
  }

  handleShow() {
    $('div.fade.modal.show div.modal-footer button:first').focus();
  }

  render() {
    return (
      <Modal onEntered={ this.handleShow } size="sm" show={ this.state.show } centered onHide={()=>this.handleClick(false)} aria-labelledby="contained-modal-title-vcenter">
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Подтвердите действие
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="show-grid">
          {this.state.text}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={()=>this.handleClick(true)} variant="primary">OK</Button>
          <Button onClick={()=>this.handleClick(false)} variant="primary">Отмена</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default ConfirmPlus;
