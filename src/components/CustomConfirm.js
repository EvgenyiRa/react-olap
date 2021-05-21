import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

import $ from 'jquery'

class CustomConfirm extends React.Component {
  constructor(props) {
      super(props);
      //console.log('props',props);
      this.state = {
        show:false,
        title:'Подтверждение действия',
        buttonOK:'OK',
        buttonCancel:'Отмена',
        text:'',
        callback:undefined,
        size:'sm'
      };
      this.handleClick = this.handleClick.bind(this);
      this.handleShow = this.handleShow.bind(this);
  }

  handleClick(val) {
    this.setState({show:false,title:'',buttonOK:'OK',text:'Подтверждение действия',size:'sm',buttonCancel:'Отмена'});
    if (!!this.state.callback) {
      this.state.callback(val);
      this.setState({callback:undefined});
    }
  }

  handleShow() {
    $('div.fade.modal.show div.modal-footer button:first').focus();
  }

  render() {
    return (
      <Modal onEntered={ this.handleShow } size={ this.state.size } show={ this.state.show } centered onHide={()=>this.handleClick(false)} aria-labelledby="contained-modal-title-vcenter">
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            {this.state.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="show-grid">
          {this.state.text}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={()=>this.handleClick(true)} variant="primary">{ this.state.buttonOK }</Button>
          <Button onClick={()=>this.handleClick(false)} variant="primary">{ this.state.buttonCancel }</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default CustomConfirm;
