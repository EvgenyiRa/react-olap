import React from 'react';
import FormControl from 'react-bootstrap/FormControl';

class InputBC extends React.Component {
  constructor(props) {
      super(props);
      //console.log('props',props);
      this.state = {
        value:(!!this.props.obj.defaultValue)?this.props.obj.defaultValue:undefined,
        isValid:(typeof this.props.obj.isValid==='boolean')?this.props.obj.isValid:false,
        isInvalid:(typeof this.props.obj.isInvalid==='boolean')?this.props.obj.isInvalid:false,
        invalidText:(!!this.props.obj.invalidText)?this.props.obj.invalidText:'',
        validText:(!!this.props.obj.validText)?this.props.obj.validText:'',
        readOnly:(!!this.props.obj.readOnly)?this.props.obj.readOnly:false,
        type:(!!this.props.obj.type)?this.props.obj.type:'text',
        placeholder:'Введите значение',
        disabled:(!!this.props.obj.disabled)?this.props.obj.disabled:false,
      };

  }

  componentDidMount() {
      if (!!this.props.obj.componentDidMount) {
          this.props.obj.componentDidMount(this);
      }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (!!this.props.obj.componentDidUpdate) {
        this.props.obj.componentDidUpdate(this,prevProps, prevState, snapshot);
    }
  }

  render() {
    return (
      <div className="divForInputBC">
        <label htmlFor="basic-url" className="labelForInputBC">{this.props.obj.label}</label>
        <FormControl
            placeholder={this.state.placeholder}
            aria-label={this.state.placeholder}
            aria-describedby="basic-addon2"
            id={this.props.obj.id}
            type={this.state.type}
            defaultValue={this.props.obj.defaultValue}
            isValid={this.state.isValid}
            isInvalid={this.state.isInvalid}
            readOnly={this.state.readOnly}
            disabled={this.state.disabled}
            onChange={(event) => {
                        if (!!this.props.obj.onChange) {
                            this.props.obj.onChange(event,this);
                        }
                        else {
                          this.setState({value:event.target.value});
                        }
                     }}
            onBlur={(event) => {
                        if (!!this.props.obj.onBlur) {
                            this.props.obj.onBlur(event,this);
                        }
                     }}
          />
          <FormControl.Feedback type="invalid">
              {this.state.invalidText}
          </FormControl.Feedback>
          <FormControl.Feedback type="valid">
              {this.state.validText}
          </FormControl.Feedback>
      </div>
    );
  }
}

export default InputBC;
