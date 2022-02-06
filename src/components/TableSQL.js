import React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import {getParamForSQL,getParamDiff,getSQLRun,getDBType} from '../system.js';

import $ from 'jquery'

class TableSQL extends React.Component {
    constructor(props) {
        super(props);
        this.getRowsBySQL = this.getRowsBySQL.bind(this);
        this.state = {
          rows: [],
          selectRow:undefined,
          selectRowFull:undefined,
        };
        this.pr_tableSQLdopAction_vis=false;
        this.ul_oda=undefined;
        this.panelScroll=() => {
          if (this.pr_tableSQLdopAction_vis) {
            var li_v=$(this.ul_oda).closest('li'),
                this_top=$(li_v).offset().top+30,
                this_left=$(li_v).offset().left+3;
            $(this.ul_oda).css({'left':this_left+'px','top':this_top+'px'});
          }
       }
       this.dbtype=getDBType();
    }

    getRowsBySQL() {
      const thisV=this;
      if (!!this.props.obj.sql) {
        var data = {};
        if (['mysql','pg'].indexOf(this.dbtype)>-1) {
            data.params=[];
        }
        else {
            data.params={};
        }
        data.sql=thisV.props.obj.sql;
        getParamForSQL(thisV.props.obj.paramGroup,thisV.props.obj.parParentID,data);
        //console.log(parSQL);
        getSQLRun(data,(response)=> {
                          thisV.setState({rows: response.data});
                          if (!!thisV.props.obj.afterLoadRows) {
                              thisV.props.obj.afterLoadRows(thisV,response.data);
                          }
                      },
                 this.props.obj.stateLoadObj
               );

      }
    }


    componentDidMount() {
        if (!!!this.props.obj.parParentID) {
            this.getRowsBySQL();
        }
        let thisV=this;
        if (!!this.props.obj.filterFactory) {
          //добавляем кнопку поиска, по-умолчанию скрываем все поля фильтрации
          var b_tab=$('div.react-bootstrap-table table#'+this.props.obj.tab_id).closest('div');
          if ($(b_tab).find('button.react-bootstrap-table-but-searche').length===0) {
            var bt_label=$(b_tab).find('th label.filter-label');
            $(b_tab).append('<button class="react-bootstrap-table-but-searche" type="button">&#128269;</button>');
            $(bt_label).hide();
            $(b_tab).on("click", "button.react-bootstrap-table-but-searche", function() {
              if ($(bt_label).first().is(':visible')) {
                  $(bt_label).hide();
              }
              else {
                  $(bt_label).show();
              }
            });
          }
        }
        //Добавляем панель действий если есть подъодящие элементы
        if ((!!this.props.obj.addRow) || (!!this.props.obj.deleteRow)
            || (!!this.props.obj.dopAction) || (!!this.props.obj.editRow)) {
          var b_tab=$('div.react-bootstrap-table table#'+this.props.obj.tab_id).closest('div');
          $(b_tab).prepend('<ul class="ul_cons top-level" style="margin:0.3em 0 0.3em 0;padding: 0;">');
          var ul_v=$(b_tab).find('ul.ul_cons.top-level');
          if (!!this.props.obj.addRow) {
              $(ul_v).append(`<li id="`+this.props.obj.tab_id+`" class="li_cons li_cons_top tableSQLaddRow" style="background: none;">
                                  <a id="`+this.props.obj.tab_id+`" title="Добавить строку" class="tableSQLaddRow">
                                      <img src="`+require('../img/add.png')+`" style="height:1.8em;width:auto;">
                                  </a>
                              </li>`);
              $(ul_v).find('li.tableSQLaddRow').click(()=>thisV.props.obj.addRow(thisV));
          }
          if (!!this.props.obj.editRow) {
              $(ul_v).append(`<li id="`+this.props.obj.tab_id+`" class="li_cons li_cons_top tableSQLeditRow" style="background: none;">
                                  <a id="`+this.props.obj.tab_id+`" title="Редактировать строку" class="tableSQLeditRow">
                                      <img src="`+require('../img/edit.png')+`" style="height:1.8em;width:auto;">
                                  </a>
                              </li>`);
              $(ul_v).find('li.tableSQLeditRow').click(()=>thisV.props.obj.editRow(thisV));
          }
          if (!!this.props.obj.deleteRow) {
              $(ul_v).append(`<li id="`+this.props.obj.tab_id+`" class="li_cons li_cons_top tableSQLdeleteRow" style="background: none;">
                                  <a id="`+this.props.obj.tab_id+`" title="Удалить строку" class="tableSQLdeleteRow">
                                      <img src="`+require('../img/rep_del.png')+`" style="height:1.8em;width:auto;">
                                  </a>
                              </li>`);
              $(ul_v).find('li.tableSQLdeleteRow').click(()=>thisV.props.obj.deleteRow(thisV));
          }
          if (!!this.props.obj.dopAction) {
              $(ul_v).append(`<li id="`+this.props.obj.tab_id+`" class="li_cons li_cons_top tableSQLdopActionBlok" style="background: none;">
                                <img src="`+require('../img/actions.png')+`" style="height:1.8em;width:auto;" title="Доп.действия">
                                <ul class="tableSQLdopAction ul_cons second-level"></ul>
                              </li>`);

              $(ul_v).find('li.li_cons.li_cons_top.tableSQLdopActionBlok[id="'+this.props.obj.tab_id+'"]').click(function() {
                  thisV.ul_oda=$(this).find('ul.tableSQLdopAction');
                  if (!$(thisV.ul_oda).is(':visible')) {
                      $(thisV.ul_oda).show();
                      var this_top=$(this).offset().top+30,
                          this_left=$(this).offset().left+3;
                      $(thisV.ul_oda).css({'left':this_left+'px','top':this_top+'px'});
                      thisV.pr_tableSQLdopAction_vis=true;
                  }
                  else {
                      $(thisV.ul_oda).hide();
                      thisV.pr_tableSQLdopAction_vis=false;
                  }
              });

              //$('div#root').on('scroll','main',this.panelScroll);
              $('main').bind('scroll', this.panelScroll);

              var ul_sl=$(ul_v).find('ul.tableSQLdopAction.ul_cons.second-level');
              this.props.obj.dopAction.forEach((item) => {
                $(ul_sl).append(`<li class="li_cons tableSQLdopAction" id="`+item.id+`">
                                    <a id="`+item.id+`">`+item.label+`</a>
                                 </li>`);
                $(ul_sl).find('li.tableSQLdopAction[id="'+item.id+'"]').click(()=>item.callback(thisV));
              })
          }
      }
      if (!!this.props.obj.componentDidMount) {
          this.props.obj.componentDidMount(this);
      }
    }

    componentWillUnmount() {
      if (!!this.props.obj.dopAction) {
          $('main').unbind('scroll', this.panelScroll);
      }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        // Популярный пример (не забудьте сравнить пропсы):
        //console.log(this.props);
        if (getParamDiff(this.props.obj.paramGroup,prevProps.obj.paramGroup,this.props.obj.parParentID)) {
            this.getRowsBySQL();
        }
      }

    render() {
      const NoDataIndication = () => (
        <div className="spinner">
          Отсутствуют данные для отображения
        </div>
      );
        return (
              <BootstrapTable
                id={ this.props.obj.tab_id }
                data={this.state.rows}
                keyField={ this.props.obj.keyField}
                columns={ this.props.obj.columns }
                classes={ this.props.obj.tableContainerClass}
                bodyClasses={ this.props.obj.bodyClasses}
                selectRow={this.props.obj.selectRowProp }
                pagination={ (!!this.props.obj.paginationFactory)? this.props.obj.paginationFactory( (!!this.props.obj.paginationOptions) ? this.props.obj.paginationOptions:undefined ):undefined }
                noDataIndication={ () => <NoDataIndication /> }
                filter={ (!!this.props.obj.filterFactory) ? this.props.obj.filterFactory((!!this.props.obj.filterFactoryIn) ? this.props.obj.filterFactoryIn:undefined):undefined }
                rowEvents={this.props.obj.rowEvents}
              />


        );
    }
}

export default TableSQL;
