import React from 'react';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';


class CheckboxMUI extends React.Component {
  constructor(props) {
      super(props);
      this.state = {
        checked:(typeof this.props.obj.beginChecked==='boolean')?this.props.obj.beginChecked:true,
      };

  }

  render() {
    return (
      <FormControlLabel
        control={
          <Checkbox
            checked={this.state.checked}
            onChange={(event) => {
              if (!!this.props.obj.onChange) {
                  this.props.obj.onChange(event,this)
              }
              else {
                  this.setState({checked:event.target.checked})
              }
            }}
            id={this.props.obj.id}
            color="primary"
          />
        }
        label={this.props.obj.label}
      />
    );
  }
}

export default CheckboxMUI;
