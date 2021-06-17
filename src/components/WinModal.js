import React from 'react';

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

class WinModal extends React.Component {
    constructor(props) {
        super(props);
        this.setModalShow = this.setModalShow.bind(this);
        this.state = {
          modalShow:false,
          header:'',
          body:undefined,
          nextButtonLabel:'Далее',
          cancelButtonLabel:'Закрыть',
          nextButtonDisplay:'block',
          cancelButtonDisplay:'block',
          handleButtonNext:undefined,
          handleButtonCancel:undefined,
        };
        if (!!!this.props.obj) {
            this.props_obj={};
        }
        else {
            this.props_obj=this.props.obj
        }
        if (!!this.props_obj.size) {
          this.size=this.props_obj.size;
        }
        else {
          this.size='xl';
        }
    }

    setModalShow(value) {
      this.setState({modalShow: value});
    }

    render() {
        return (
          <Modal size={this.size} show={this.state.modalShow}
                 onHide={() =>{
                           if (!!this.state.handleButtonCancel) {
                               this.state.handleButtonCancel(this)
                           }
                           else {
                               this.setModalShow(false)
                           }
                         }}
                 aria-labelledby="contained-modal-title-vcenter">
            <Modal.Header closeButton>
              <Modal.Title id="contained-modal-title-vcenter">
                {this.state.header}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="show-grid" style={{paddingLeft:'3em'}}>
              {this.state.body}
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={() => {
                                if (!!this.state.handleButtonNext) {
                                  this.state.handleButtonNext(this)
                                }
                              }}
                      style={{display:this.state.nextButtonDisplay}}
              >
                  {this.state.nextButtonLabel}
              </Button>
              <Button onClick={() => {
                                if (!!this.state.handleButtonCancel) {
                                    this.state.handleButtonCancel(this)
                                }
                                else {
                                    this.setModalShow(false)
                                }
                              }}
                      style={{display:this.state.cancelButtonDisplay}}
              >
                {this.state.cancelButtonLabel}
              </Button>
            </Modal.Footer>
          </Modal>
        );
    }
}

export default WinModal;
