import React from 'react';
import Multiselect from 'react-bootstrap-multiselect';
import {getParamForSQL,getParamDiff,getSQLRun} from '../system.js';
import 'react-bootstrap-multiselect/css/bootstrap-multiselect.css';

//import $ from 'jquery'

class MultiselectSQL extends React.Component {
  constructor(props) {
      super(props);
      //console.log('props',props);
      this.handleDropdownHidden = this.handleDropdownHidden.bind(this);
      this.handleChange = this.handleChange.bind(this);
      this.handleSelectAll = this.handleSelectAll.bind(this);
      this.handleDeselectAll = this.handleDeselectAll.bind(this);
      this.state = {
        options: [{'value':-888,'label':'Значения отсутствуют'}],
        checkedOptions: undefined
      }
      this.getOptionsBySQL = this.getOptionsBySQL.bind(this);
  }

  handleChange(option, checked) {
    const optionValue=+option[0].value;
    if (checked) {
       if (this.state.checkedOptions===undefined) {
          this.setState({checkedOptions:[optionValue]});
       }
       else {
         this.setState({checkedOptions: [...this.state.checkedOptions, optionValue]});
       }
    }
    else {
      this.setState({checkedOptions: this.state.checkedOptions.filter(x => x !== optionValue)});
    }
  }

  getOptionsBySQL() {
    const val=this;
    var data = {};
    data.params={};
    data.sql=val.props.obj.sql;
    getParamForSQL(val.props.obj.paramGroup,val.props.obj.parParentID,data);
    getSQLRun(data,(response)=> {
                  if (response.data.length>0) {
                    this.setState({options:response.data});
                  }
                  else {
                    this.setState({options:this.stateDefaultOptions});
                  }
                  if (!this.multiple) {
                    this.state.checkedOptions=this.state.options[0].value;
                    if ((!!this.props.obj.paramGroup) & (!!this.props.obj.setParamGroup)) {
                      let newObj = { ...this.props.obj.paramGroup };
                      newObj[this.props.obj.parChealdID]=this.state.options[0].value;
                      this.props.obj.setParamGroup(newObj);
                    }
                  }
                  if (!!this.props.obj.afterLoadData) {
                      this.props.obj.afterLoadData(this,response);
                  }
                },
              val.props.obj.stateLoadObj
            );

  }

  componentDidMount() {
      this.setState({options:this.stateDefaultOptions});
      if (!!!this.props.obj.parParentID) {
          this.getOptionsBySQL();
      }
      if (!!this.props.obj.componentDidMount) {
          this.props.obj.componentDidMount(this);
      }
  }

    componentDidUpdate(prevProps, prevState, snapshot) {
      // Популярный пример (не забудьте сравнить пропсы):
      //console.log(val.props);
      if (getParamDiff(this.props.obj.paramGroup,prevProps.obj.paramGroup,this.props.obj.parParentID)) {
          this.getOptionsBySQL();
      }
      if (!!this.props.obj.componentDidUpdate) {
          this.props.obj.componentDidUpdate(this,prevProps, prevState, snapshot);
      }
    }

    handleDropdownHidden() {
      if (!!this.state.checkedOptions){
        //запоминаем выбранное при скрытии списка выбора только для множественного выбора,
        //для единичного выбора событие срабатывает до события handleChange, поэтому для него здесь изменять параметры формы не своевременно
        if ((!!this.props.obj.parChealdID) & (!!this.props.obj.setParamGroup) & (!!this.props.obj.paramGroup)) {
            let newObj = { ...this.props.obj.paramGroup };
            newObj[this.props.obj.parChealdID]=this.state.checkedOptions;
            this.props.obj.setParamGroup(newObj);
        }
      }
    }

    handleSelectAll() {
      let value=[];
      this.state.options.forEach(function(item) {
        value.push(item.value);
      })
      this.setState({checkedOptions:value});
    }

    handleDeselectAll() {
      this.setState({checkedOptions:[]});
    }

  render() {
    return (
      <div className="bootstrapMultiselectContainer" id={this.props.obj.divID}>
        <label className="labelForBootstrapMultiselect">{ this.props.obj.label }</label>
        <Multiselect
          data={this.state.options}
          includeSelectAllOption={true}
          enableFiltering={true}
          enableCaseInsensitiveFiltering={true}
          templates= {{filterClearBtn: '<span class="input-group-btn"><button class="btn btn-default multiselect-clear-filter" type="button">&#128269;</button></span>'}}
          onChange={this.handleChange}
          filterPlaceholder= 'Поиск'
          multiple={ true }
          selectAllText="Выбрать все"
          nonSelectedText="Ничего не выбрано"
          onDropdownHidden={ this.handleDropdownHidden }
          allSelectedText="Выбраны все"
          onSelectAll={ this.handleSelectAll }
          onDeselectAll={ this.handleDeselectAll }
          nSelectedText="значени(й/я)"
          id={this.props.obj.id}
        />
      </div>
    );
  }
}

export default MultiselectSQL;