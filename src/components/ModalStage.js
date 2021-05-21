import React from 'react';

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

class ModalStage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          modalShow:false,
          header:'',
          body:undefined,
          nextButtonLabel:'Далее',
          prevButtonLabel:'Назад',
          cancelButtonLabel:'Закрыть',
          stage:1,
          attr:{},
          nextButtonDisplay:'block',
          prevButtonDisplay:'none',
          cancelButtonDisplay:'block',
          handleButtonPrev:undefined,
          handleButtonNext:undefined,
          handleButtonCancel:undefined,
          footerInfo:undefined,
        };
        this.setModalShow = this.setModalShow.bind(this);
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

    setModalShow(val) {
      this.setState({modalShow: val});
    }

    componentDidMount() {
        if (!!this.props_obj.componentDidMount) {
            this.props_obj.componentDidMount(this);
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
      if (!!this.props_obj.componentDidUpdate) {
          this.props_obj.componentDidUpdate(this,prevProps, prevState, snapshot);
      }
    }

    render() {
      const FooterInfo=()=>{
          if (!!this.state.footerInfo) {
            return <div className="footerInfo">{this.state.footerInfo}</div>;
          }
          else {
            return null;
          }
      }
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
              <FooterInfo/>
              <Button
                  onClick={() => {
                            if (!!this.state.handleButtonPrev) {
                              this.state.handleButtonPrev(this)
                            }
                          }}
                  style={{display:this.state.prevButtonDisplay}}
              >
                  {this.state.prevButtonLabel}
              </Button>
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

export default ModalStage;
