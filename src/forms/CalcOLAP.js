import React,{ useState,useRef } from 'react';

import Loading from '../components/Loading';
import AlertPlus from '../components/AlertPlus';
import TableOLAP from '../components/TableOLAP';
import BootstrapInput from '../components/BootstrapInput';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import {getDBType} from '../system.js';
/*import { format,startOfMonth } from 'date-fns';*/

import $ from 'jquery';

function CalcOLAP() {
  const dbType=getDBType();
  //хук для отслеживания изменения параметров компонетов (для упрощения взаимодействия компонентов)
  let [paramGroupV, setParamGroupV] = useState({begDate:/*format(startOfMonth(newDate),'yyyy-MM-dd')*/'2020-09-01',endDate:'2020-09-02'/*format(newDate,'yyyy-MM-dd')*/});
  //хук-ссылки на элементы для удобной работы с ними
  const refAlertPlus=useRef(),
        refLoading=useRef(),
        refTableOLAP=useRef(),
        refInputBegDate=useRef(),
        refInputEndDate=useRef();

  const inputBegDateObj={
    label:'Начало периода',
    id:"begDate",
    paramGroupV:paramGroupV,
    setParamGroupV:setParamGroupV,
    onBlur:(event,thisV) => {
        const valueL=event.target.value;
        thisV.props.obj.setParamGroupV({begDate:valueL,endDate:thisV.props.obj.paramGroupV.endDate});
    },
    type:'date',
    defaultValue:paramGroupV.begDate
  };

  const inputEndDateObj={
    label:'Окончание периода',
    id:"endDate",
    paramGroupV:paramGroupV,
    setParamGroupV:setParamGroupV,
    onBlur:(event,thisV) => {
        const valueL=event.target.value;
        thisV.props.obj.setParamGroupV({begDate:thisV.props.obj.paramGroupV.begDate,endDate:valueL});
    },
    type:'date',
    defaultValue:paramGroupV.endDate
  };

  const tableOLAPObj={
    id:'calc',
    stateLoadObj:refLoading,
    paramGroup:paramGroupV,
    setParamGroup:setParamGroupV,
    parParentID:['begDate','endDate'],
    data:{params_val: {},
          sql_true: ((dbType=='mssql')?`SET DATEFORMAT YMD;`:``)+
                     `WITH T AS (
                      SELECT *
                       FROM REP_CALC_OLAP
                      WHERE INVOICE_DATE >= `+((dbType=='mssql')?`@begDate`:`TO_DATE(:begDate,'YYYY-MM-DD')`)+`
                        AND INVOICE_DATE <= `+((dbType=='mssql')?`@endDate`:`TO_DATE(:endDate,'YYYY-MM-DD')`)+`
                      )
                      SELECT contract_refid
                             ,jur_ls_refid
                             ,payer_sname
                             ,/*'1.'||*/service service
                             ,calc_volume
                             ,0 calc_cost
                             ,calc_net
                             ,tariff
                             ,VAT_RATE
                             ,1 SORT
                      FROM T
                      /*UNION ALL
                      SELECT contract_refid
                             ,jur_ls_refid
                             ,payer_sname
                             ,'2.Итого' service
                             ,SUM(calc_volume) calc_volume
                             ,0 calc_cost
                             ,SUM(calc_net) calc_net
                             ,tariff
                             ,VAT_RATE
                             ,2 SORT
                      FROM T
                      GROUP BY contract_refid
                             ,jur_ls_refid
                             ,payer_sname
                             ,tariff
                             ,VAT_RATE*/`,
          tab_pok: [{"SYSNAME":"SERVICE","NAME":"Услуга"}],
          tab_pol: [],
          tab_str: [{"SYSNAME":"TARIFF","NAME":"Цена за ед.,<br>руб."},{"SYSNAME":"PAYER_SNAME","NAME":"Контрагент"},
                    {"SYSNAME":"CONTRACT_REFID","NAME":"Номер договора"},
                    {"SYSNAME":"JUR_LS_REFID","NAME":"ЛС"}
                   ],
          tab_val: [{"SYSNAME":"CALC_VOLUME","NAME":"Израсходаванно,<br>шт./МБ/мин.","AGGR":"SUM"},
                    {"SYSNAME":"CALC_NET","NAME":"Начислено, руб","AGGR":"SUM"},
                   ]
        },
    //общий итог
    strgrouping:{apply:true,
                 wrap:true,
                 onCalc:{/*'CALC_VOLUME':{
                          callback:(res,newVal) => {
                            return +res+(+newVal*2);
                          }
                        },*/
                        'CALC_COST':{
                           callback:(res,newVal) => {
                             return +res+(+newVal);
                           }
                         }
                        },
                 onSubItog:{'SERVICE':{
                              label:'Подытог тест',
                              callback:(itogID,thisItog,thisV) => {
                                //заполняем заготовку
                                const itogBlank=thisItog.itogBlank;
                                const tekTdItog=$(itogBlank).find('td.td_str_val[id="'+itogID+'"]');
                                if (tekTdItog.length>0) {
                                  let styleC=getComputedStyle(tekTdItog[0]);
                                  $(tekTdItog).html((!!thisV.state.strgrouping.onSubItog[itogID].label)?thisV.state.strgrouping.onSubItog[itogID].label:'Подытог')
                                              .css({'font-size':String(parseFloat(styleC.fontSize)+1)+'px','font-weight':800});
                                  const tekTdValItog=$(itogBlank).find('td.td_val_val');
                                  styleC=getComputedStyle($(tekTdValItog).first()[0]);
                                  const styleTdValC={'font-size':String(parseFloat(styleC.fontSize)+1)+'px','font-weight':800};
                                  $(itogBlank).find('td.td_val_val').each(function(i,elem) {
                                    $(elem).html(thisItog.res[i].value)
                                           .css(styleTdValC);
                                  });
                                }
                                return itogBlank;
                              }
                            },
                            'PAYER_SNAME':{
                               label:'Подытог тест',
                               /*callback:(itogID,thisItog,thisV) => {
                                 //заполняем заготовку
                                 const itogBlank=thisItog.itogBlank;
                                 const tekTdItog=$(itogBlank).find('td.td_str_val[id="'+itogID+'"]');
                                 if (tekTdItog.length>0) {
                                   let styleC=getComputedStyle(tekTdItog[0]);
                                   $(tekTdItog).html((!!thisV.state.strgrouping.onSubItog[itogID].label)?thisV.state.strgrouping.onSubItog[itogID].label:'Подытог')
                                               .css({'font-size':String(parseFloat(styleC.fontSize)+1)+'px','font-weight':800});
                                   const tekTdValItog=$(itogBlank).find('td.td_val_val');
                                   styleC=getComputedStyle($(tekTdValItog).first()[0]);
                                   const styleTdValC={'font-size':String(parseFloat(styleC.fontSize)+1)+'px','font-weight':800};
                                   $(itogBlank).find('td.td_val_val').each(function(i,elem) {
                                     $(elem).html(thisItog.res[i].value)
                                            .css(styleTdValC);
                                   });
                                 }
                                 return itogBlank;
                               }*/
                               format:(val)=>{
                                  return val.toFixed(2);
                               }
                             },
                            'CONTRACT_REFID':{}
                          }
                },
    //общий итог
    itogAll:{apply:true,
             onCalc:{'CALC_VOLUME':{
                      callback:(res,newVal) => {
                        return +res+(+newVal);
                      }
                     },
                    },
             /*onItogAll:(thisItog,tr,thisV) => {
                //console.log('res',thisItog);
                //заполняем заготовку
                const itogBlank=thisItog.itogBlank,
                      tdStrVal=$(itogBlank).find('td.td_str_val'),
                      tekTdItog=$(tdStrVal).first();
                let styleC=getComputedStyle(tekTdItog[0]);
                $(tekTdItog).html('Итог')
                            .css({'font-size':String(parseFloat(styleC.fontSize)+2)+'px','font-weight':800});
                const tekTdValItog=$(itogBlank).find('td.td_val_val');
                styleC=getComputedStyle($(tekTdValItog).first()[0]);
                const styleTdValC={'font-size':String(parseFloat(styleC.fontSize)+2)+'px','font-weight':800};
                $(itogBlank).find('td.td_val_val').each(function(i,elem) {
                  $(elem).html(thisItog.res[i].value);
                  $(elem).css(styleTdValC);
                });
                $(tr).after(itogBlank);
              },*/
              format:(val)=>{
                 return val.toFixed(3);
              }
            },
    componentDidMount:(thisV)=> {
        //переопределяем, т.к. по-умолчанию первый раз запращиваются данные только если нет параметров для запроса
        thisV.getDataSQL();
    },
    //отображение действия построения графика (по-умолчанию false)
    graf:true,
    grafFilter:(items)=>{
      $(items).find('td.td_pok:last,td.td_val_val:last-child,td.td_val_val:nth-last-child(2),td.td_val_name:last-child,td.td_val_name:nth-last-child(2)').remove();
      /*$(items).find('td.td_pok').each(function(i,elem) {
          $(elem).html($(elem).text().split('.')[1]);
      });*/
      return items;
    },
    /*beforeGrouping:(thisV)=> {
    },*/
    afterLoadData:(thisV)=> {
        //добавляем сбоку итоги
        let tabV=thisV.state.$itemsStrgrouping,
            tabB=thisV.state.$itemsStrgroupingBeg;
        if (typeof tabV!=='undefined') {
          /*$(tabV).find('td.td_pok').each(function(i,elem) {
              $(elem).html($(elem).text().split('.')[1]);
          });
          $(tabV).find('td.td_pok:last,td.td_val_val:last-child,td.td_val_val:nth-last-child(2)').css({'filter': 'invert(0.05)'});*/

          const addItogRight=(tabF)=>{
            $(tabF).find('td.td_val_val').each(function(i,elem) {
                const val=parseFloat($(elem).text());
                if (!isNaN(val)) {
                  $(elem).html(val.toFixed(2));
                }
            });
            //запоминаем все текущие значения полей
            let tdValName=$(tabF).find('tr.tr_name_col td.td_val_name'),
                tdValNameUniq=[],
                tdValNameElUniq=[];
            //оставляем уникальные
            $(tdValName).each(function(i,elem) {
              if (tdValNameUniq.indexOf(elem.id)===-1) {
                  tdValNameUniq.push(elem.id);
                  tdValNameElUniq.push(elem);
              }
            });
            $(tabF).find('tr.tr_pok td.td_pok:last').after('<td colspan="'+tdValNameUniq.length+'">Итого</td>');
            $(tdValNameElUniq).each(function(i,elem) {
              $(tabF).find('tr.tr_name_col td.td_val_name:last').after($(elem).clone());
            });

            $(tabF).find('tr.tr_tab').each(function(i,elem) {
              $(tdValNameUniq).each(function(i2,elem2) {
                let sumStr=0,
                    tdStr=$(elem).find('td.td_val_val[id="'+elem2+'"]');
                $(tdStr).each(function(i2,elem2) {
                  let sumTd=parseFloat($(elem2).text());
                  if (!isNaN(sumTd)) {
                      sumStr+=sumTd;
                  }
                });
                $(elem).find('td:last').after('<td class="td_val_val_itog" id="'+elem2+'">'+sumStr.toFixed(2)+'</td>');
              });
            });
            return tabF;
          }
          tabB=addItogRight(tabB);
          tabV=addItogRight(tabV);

          thisV.setState({itemsStrgrouping:tabV[0].outerHTML,$itemsStrgrouping:tabV,$itemsStrgroupingBeg:tabB});
        }
    }
  };

  return (
    <div className="App">
      <Loading ref={refLoading} />
      <AlertPlus ref={refAlertPlus}/>
      <Container fluid>
        <Row>
          <Col>
            <BootstrapInput ref={refInputBegDate} obj={inputBegDateObj}/>
          </Col>
          <Col>
            <BootstrapInput ref={refInputEndDate} obj={ inputEndDateObj }/>
          </Col>
        </Row>
        <Row style={{marginTop:'1rem'}}>
          <Col>
            <TableOLAP ref={refTableOLAP} obj={tableOLAPObj}/>
          </Col>
        </Row>

      </Container>
    </div>
  );
}

export default CalcOLAP;
