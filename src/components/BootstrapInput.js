import React from 'react';
import FormControl from 'react-bootstrap/FormControl';

class BootstrapInput extends React.Component {
  constructor(props) {
      super(props);
      this.state = {
        value:(!!this.props.obj.defaultValue)?this.props.obj.defaultValue:undefined,
        isInvalid:(typeof this.props.obj.isInvalid==='boolean')?this.props.obj.isInvalid:false,
        invalidText:(!!this.props.obj.invalidText)?this.props.obj.invalidText:'',
        type:(!!this.props.obj.type)?this.props.obj.type:'text',
        placeholder:'Введите значение',
      };

  }

  render() {
    return (
      <div className="bootstrapInputContainer">
        <label htmlFor="basic-url" className="labelBeforeBootstrapInput">{this.props.obj.label}</label>
        <FormControl
            placeholder={this.state.placeholder}
            aria-label={this.state.placeholder}
            aria-describedby="basic-addon2"
            id={this.props.obj.id}
            type={this.state.type}
            defaultValue={this.props.obj.defaultValue}
            isValid={false}
            isInvalid={this.state.isInvalid}
            readOnly={false}
            disabled={false}
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
      </div>
    );
  }
}

export default BootstrapInput;
