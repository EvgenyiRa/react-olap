import React from 'react';
import Multiselect from 'react-bootstrap-multiselect';
import {getParamForSQL,getParamDiff,getSQLRun} from '../system.js';
import 'react-bootstrap-multiselect/css/bootstrap-multiselect.css';

//import $ from 'jquery'

class SelectDB extends React.Component {
  constructor(props) {
      super(props);
      //console.log('props',props);
      this.handleDropdownHidden = this.handleDropdownHidden.bind(this);
      this.handleChange = this.handleChange.bind(this);
      this.handleSelectAll = this.handleSelectAll.bind(this);
      this.handleDeselectAll = this.handleDeselectAll.bind(this);
      this.state = {
        options: [],
        selectOptions: undefined,
        selectOptionsLabel:undefined
      }
      this.getDataSQL = this.getDataSQL.bind(this);
      this.stateDefaultOptions=[{'value':-777,'label':'Ничего не найдено'}];
      this.setState({options:this.stateDefaultOptions});
      //console.log('parentP',props.pTableOut);
      this.multiple=false;
      if (typeof this.props.obj.multiple==="boolean") {
          this.multiple=this.props.obj.multiple;
      }
  }

  handleChange(option, checked) {
    if (checked) {
      if (!this.multiple) {
        this.setState({
          selectOptions: option[0].value,
          selectOptionsLabel: option[0].label
          //currPage: this.refs.table.state.currPage
        });
        //для единичного выбора обрабатываем изменение параметров формы здесь
        if ((!!this.props.obj.parChealdID) & (!!this.props.obj.setParamGroup) & (!!this.props.obj.paramGroup)) {
            let newObj = { ...this.props.obj.paramGroup };
            newObj[this.props.obj.parChealdID]=option[0].value;
            this.props.obj.setParamGroup(newObj);
        }
      }
      else {
         if (this.state.selectOptions===undefined) {
            this.setState({selectOptions:[option[0].value],selectOptionsLabel: [option[0].label]});
         }
         else {
           this.setState({selectOptions: [...this.state.selectOptions, option[0].value],
                          selectOptionsLabel: [...this.state.selectOptionsLabel, option[0].label]
                        });
        }
      }
    }
    else {
      if (this.multiple) {
        this.setState(() => ({
          selectOptions: this.state.selectOptions.filter(x => x !== option[0].value),
          selectOptionsLabel: this.state.selectOptionsLabel.filter(x => x !== option[0].label),
        }));
      }
    }
    if (!!this.props.obj.handleChange) {
        this.props.obj.handleChange(option, checked, this);
    }
  }

  getDataSQL() {
    const val=this;

    // Simple POST request with a JSON body using axios
    var data = {};
    data.params={};
    //let resp_data;
    if (!!val.props.obj.parSQL) {
        data.params=val.props.obj.parSQL;
    }
    data.sql=val.props.obj.sql;
    getParamForSQL(val.props.obj.paramGroup,val.props.obj.parParentID,data);
    //console.log(data.params);
    if (!!this.props.obj.beforeLoadData) {
        this.props.obj.beforeLoadData(this,data);
    }
    if (!((!!this.props.obj.beforeLoadData) && (typeof data.error === 'boolean'))) {
      getSQLRun(data,(response)=> {
                    if (response.data.length>0) {
                      this.setState({options:response.data});
                    }
                    else {
                      this.setState({options:this.stateDefaultOptions});
                    }
                    if (!this.multiple) {
                      this.state.selectOptions=this.state.options[0].value;
                      this.state.selectOptionsLabel=this.state.options[0].label;
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
  }

  componentDidMount() {
      this.setState({options:this.stateDefaultOptions});
      if (!!!this.props.obj.parParentID) {
          this.getDataSQL();
      }
      if (!!this.props.obj.componentDidMount) {
          this.props.obj.componentDidMount(this);
      }
  }

    componentDidUpdate(prevProps, prevState, snapshot) {
      // Популярный пример (не забудьте сравнить пропсы):
      //console.log(val.props);
      if (getParamDiff(this.props.obj.paramGroup,prevProps.obj.paramGroup,this.props.obj.parParentID)) {
          this.getDataSQL();
      }
      if (!!this.props.obj.componentDidUpdate) {
          this.props.obj.componentDidUpdate(this,prevProps, prevState, snapshot);
      }
    }

    handleDropdownHidden() {
      if ((!!this.state.selectOptions) & (this.multiple)) {
        //запоминаем выбранное при скрытии списка выбора только для множественного выбора,
        //для единичного выбора событие срабатывает до события handleChange, поэтому для него здесь изменять параметры формы не своевременно
        if ((!!this.props.obj.parChealdID) & (!!this.props.obj.setParamGroup) & (!!this.props.obj.paramGroup)) {
            let newObj = { ...this.props.obj.paramGroup };
            newObj[this.props.obj.parChealdID]=this.state.selectOptions;
            this.props.obj.setParamGroup(newObj);
        }
      }
      if (!!this.props.obj.handleDropdownHidden) {
        this.props.obj.handleDropdownHidden(this);
      }
    }

    handleSelectAll() {
      let mass_v=[],
          mass_l=[];
      this.state.options.forEach(function(item) {
        mass_v.push(item.value);
        mass_l.push(item.label);
      })
      this.setState({selectOptions:mass_v,selectOptionsLabel:mass_l});
    }

    handleDeselectAll() {
      this.setState({selectOptions:[],selectOptionsLabel:[]});
    }

  render() {
    return (
      <div className="divBootstrapMultiselectBlock" id={this.props.obj.divID}>
        <label className="labelBootstrapMultiselectBlock">{ this.props.obj.label }</label>
        <Multiselect
          data={this.state.options}
          includeSelectAllOption={true}
          enableFiltering={true}
          enableCaseInsensitiveFiltering={true}
          templates= {{filterClearBtn: '<span class="input-group-btn"><button class="btn btn-default multiselect-clear-filter" type="button">&#128269;</button></span>'}}
          onChange={this.handleChange}
          filterPlaceholder= 'Поиск'
          multiple={ this.multiple }
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

export default SelectDB;
