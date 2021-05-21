import React,{ useState,useRef } from 'react';

import paginationFactory from 'react-bootstrap-table2-paginator'
import SelectDB from '../../components/SelectDB';
import TableDB from '../../components/TableDB';
import DivImgClick from '../../components/DivImgClick';
import LoadState from '../../components/LoadState';
import InputDB from '../../components/InputDB';
import CustomAlert from '../../components/CustomAlert';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import FormControl from 'react-bootstrap/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Button from 'react-bootstrap/Button';
//import InputGroup from 'react-bootstrap/InputGroup';

import $ from 'jquery'

import {getExecQuery} from '../../common.js';

function Load_watermeter_values() {
  //хук для отслеживания изменения параметров компонетов (для упрощения взаимодействия компонентов)
  let [paramGroupV, setParamGroupV] = useState({lsNum:'-888',placeName:'',checkWtrmtrs:true});
  //хук-ссылки на элементы для удобной работы с ними
  let refTableDB=useRef(),
      refLoadState=useRef(),
      refInputDB=useRef(),
      refCustomAlert=useRef();

  //строка текста по найденному абоненту
  let [abonentSearhe,setAbonentSearhe] = useState('');

  $(document).ready(function(){
     $('input#ls').focus().select();
  });

  $(document).off( "keyup");
  $(document).on( "keyup", function(event) {
    var param1=event.which;
    if(param1 == 121) {
        //F10 - сохранить
        divImgClickObj.handleClick();
    }
    else if(param1 == 120) {
        //F9 - перемиститься в поле поиска по ЛС
        $('input#ls').focus().select();
    }
    else if(param1 == 119) {
        //F8 - Запуск поиска
        $('#butSearcheLS').trigger('click');
    }
    else if(param1 == 118) {
        //F7 - Переместиться в поле поиска "Улица"
        $('input#street').focus().select();
    }
  });


  const divImgClickObj={id:'saveWtrmtrs',
                        img:{src:require('../../img/save.png').default,style:{height:'33px',width:'auto',cursor:'pointer'},title:"Сохранить"},
                        handleClick:function(event) {
                            /*console.log('pTableOutRef',refTableDB.current);
                            console.log('event.target',event.target);*/
                            //удаляем предыдущие ошибки
                            let m_wtrmts=[],
                                pr_ok=true,
                                err_text='',
                                tab_wtrmts_tbody=$('table.tab_wtrmtrs tbody');
                            if (refTableDB.current.state.items.length===0) {
                              refCustomAlert.current.setState({show:true,text:'Отсутствуют ПУ, сохранение показаний не возможно'});
                              return false;
                            }
                            //проверки,удаляем предыдущие ошибки
                            refTableDB.current.state.items.forEach(function(item,index) {
                              delete refTableDB.current.state.items[index]['NEW_VALUE_ERROR'];
                              if ((item['PR_OPEN']!=='Закрыт') && (item.NEW_VALUE_NUMBER>0)) {
                                var in_lv_val=item['NEW_VALUE_NUMBER'],
                                    in_ld_val=item['NEW_DATE'],
                                    z_num_v=item['SERNUM'],
                                    err_beg='Для ПУ с заводским № '+z_num_v,
                                    wtrmtr_id=item['RVKP_W_ID'];
                                if (!isNaN(in_lv_val)){
                                    if (isNaN(wtrmtr_id)) {
                                        pr_ok=false;
                                        //customAlert(err_beg+' не существует соответствующего ПУ в РВК.П');
                                        err_text+=err_beg+' не существует соответствующего ПУ в РВК.П\n';
                                    }
                                    var prev_val=parseFloat(item['LAST_VALUE']);
                                    if (prev_val>in_lv_val) {
                                        //customAlert(err_beg+' "Новое показание" должно быть больше последнего "Показания"');
                                        err_text+=err_beg+' "Новое показание" должно быть больше последнего "Показания"\n';
                                        pr_ok=false;
                                    }
                                }
                                if (!isNaN(in_lv_val)){
                                    if (in_ld_val.length===0) {
                                        pr_ok=false;
                                        //customAlert(err_beg+' не заполнено поле "Новая дата снятия"');
                                        err_text+=err_beg+' не заполнено поле "Новая дата снятия"\n';
                                    }
                                    else {
                                        var dateH=item['LAST_DATE'],
                                            mass_date=dateH.split("."),
                                            dayH=parseInt(mass_date[0]),
                                            monthH=parseInt(mass_date[1]),
                                            yearH=parseInt(mass_date[2]);
                                        mass_date= in_ld_val.split("-");
                                        var year=parseInt(mass_date[0]),
                                            month=parseInt(mass_date[1]),
                                            day=parseInt(mass_date[2]);
                                        if ((monthH===month) & (yearH===year) & (dayH)) {
                                            pr_ok=false;
                                            //customAlert(err_beg+' показания за текущий расчетный месяц уже внесены');
                                            err_text+=err_beg+' показания за текущий расчетный месяц уже внесены\n';
                                        }
                                        else if (((monthH>month) & (yearH===year)) || (yearH>year)) {
                                            pr_ok=false;
                                            err_text+=err_beg+' дата вносимых показаний меньше уже внесенных в систему\n';
                                        }
                                    }
                                }
                                if (pr_ok) {
                                  m_wtrmts.push(item);
                                }
                              }
                            });

                            if ((pr_ok) && (m_wtrmts.length===0)) {
                                pr_ok=false;
                                err_text+='Отсутствуют показания для внесения';
                            }

                            if (!pr_ok) {
                                refCustomAlert.current.setState({show:true,text:err_text});
                                return false;
                            }

                            refTableDB.current.setState({items:[...refTableDB.current.state.items]});

                            //Сортируем массив ПУ: сначала "обратка
                            m_wtrmts.sort(function(a,b){
                              return +a.RETURN_COMBINED_ID - +b.RETURN_COMBINED_ID;
                            });
                            var data = {};
                            data.exec_params_in={};
                            //data.query_params={};
                            data.execsql=`DECLARE\n
                                            watermeter_list AbWatermeterList := AbWatermeterList();\n
                                          BEGIN\n`;
                            var accdate,
                                ind=0;
                            m_wtrmts.forEach(function(item,index) {
                                ++ind;
                                var watermeter_id = item.RVKP_W_ID,
                                    new_watermeter_value = +item.NEW_VALUE_NUMBER;
                                accdate=item.NEW_DATE;
                                data.exec_params_in['wtrmtr_id_'+ind]=watermeter_id;
                                data.exec_params_in['val_'+ind]= new_watermeter_value;

                                data.execsql+=`watermeter_list.EXTEND();\n`;
                                data.execsql+=`watermeter_list(${ind}) := AbWatermeterType(:wtrmtr_id_${ind}`;
                                data.execsql+=`,NULL`; // pipe_name
                                data.execsql+=`,:service`; // service
                                data.execsql+=`,NULL`;// factory_number
                                data.execsql+=`,NULL`;// last_value
                                data.execsql+=`,NULL`;// last_accdate
                                data.execsql+=`,:val_${ind}`; // new_value
                                data.execsql+=`,NULL`; // last_check_endaccdate
                                data.execsql+=`,0`;// status
                                data.execsql+=`,NULL);\n`;// error_text
                            });

                            data.exec_params_in['accdate']= accdate;
                            data.execsql+=`ab_terminal_pkg.load_watermeter_values(`;
                            data.execsql+=`TO_DATE(:accdate, 'RRRR-MM-DD'), `;
                            data.execsql+=`watermeter_list, `;
                            data.execsql+=`:service); END;`;
                            //data.exec_params_in['async_mode']= ($('#loadAsyncMode').prop('checked'))? 1:0;
                            data.exec_params_in['service']='Терминал';
                            //data.exec_params_in['usr_fio']='Тест-реакт';

                            data.sql=`SELECT watermeter_id
                                            ,status
                                            ,error_text
                                        FROM TABLE (ab_terminal_pkg.get_watermeter_values_result())`;
                            if (!!data.exec_params_in['wtrmtr_id_1']) {
                              getExecQuery(data,function(response) {
                                                  console.log(response);
                                                  var pr_ok=true,
                                                      tab_wtrmts_tbody=$('table.tab_wtrmtrs tbody');
                                                  $(tab_wtrmts_tbody).find('tr div.usr_error').text('');
                                                  response.data.sqlrows.forEach(function(item0) {
                                                    if (+item0['STATUS']===0) {
                                                      pr_ok=false;
                                                      //ищем нужный ПУ для сохранения текста ошибки
                                                      refTableDB.current.state.items.forEach(function(item,index) {
                                                          if (item['RVKP_W_ID']==item0['WATERMETER_ID']) {
                                                            refTableDB.current.state.items[index]['NEW_VALUE_ERROR']=item0['ERROR_TEXT'];
                                                            $(tab_wtrmts_tbody).find('tr:eq('+index+') div.usr_error').text(item0['ERROR_TEXT']);
                                                          }
                                                      });
                                                    }
                                                  });
                                                  if (pr_ok) {
                                                    //если нет ошибок, то пытаемся положить в историческую БД, если все ок, то перезапрашиваем данные из БД для их обновления в таблице
                                                    refLoadState.current.setState((state) => ({vis:++state.vis}));
                                                    var pr_ok_idb=true;
                                                    refTableDB.current.state.items.forEach(function(item,index) {
                                                        refTableDB.current.state.items[index]['STATE_QUERY_HBD']=true;
                                                        if ((item['PR_OPEN']!=='Закрыт') && (item.NEW_VALUE_NUMBER>0)) {
                                                          refTableDB.current.state.items[index]['STATE_QUERY_HBD']=false;
                                                          var data0={};
                                                          data0.exec_params_in={};
                                                          data0.exec_params_in.wtrmtr_id_h=item['W_ID_H'];
                                                          data0.exec_params_in.CurrValue=item['NEW_VALUE_NUMBER'];
                                                          data0.exec_params_in.CurrDate=item['NEW_DATE'];
                                                          data0.exec_params_in.item_index_in=index;
                                                          data0.exec_params_out=[];
                                                          data0.exec_params_out.push({name:'t_error',type:'number'});
                                                          data0.exec_params_out.push({name:'t_error_text',type:'string'});
                                                          data0.exec_params_out.push({name:'item_index_out',type:'number'});
                                                          data0.execsql=`declare
                                                                            vHouseId Number;
                                                                            ID_H_NUM NUMBER;
                                                                            t_error_text VARCHAR2(1000);
                                                                            t_error       NUMBER(1);
                                                                          begin
                                                                              t_error := 1;
                                                                              t_error_text:='';
                                                                              BEGIN
                                                                                ID_H_NUM:=TO_NUMBER(:wtrmtr_id_h);
                                                                                Update prvp.prvCounterValue@RH set Value = :CurrValue, cDate = TO_DATE(:CurrDate, 'RRRR-MM-DD')
                                                                                 where prvCounterId = ID_H_NUM
                                                                                   and cDate between Trunc(LAST_DAY(TO_DATE(:CurrDate, 'RRRR-MM-DD')), 'MM') and LAST_DAY(TO_DATE(:CurrDate, 'RRRR-MM-DD'));
                                                                                if SQL%NotFound then
                                                                                  SELECT Max(hd.houseid) into vHouseId
                                                                                   FROM prvp.prvhouseaddress@RH hd, prvp.prvaddress@RH ad, prvp.prvaccount@RH ac, prvp.prvCounter@RH c
                                                                                   WHERE ac.prvaddressid = ad.id AND ad.houseid = hd.houseid
                                                                                     AND ac.accountid = c.AccountId
                                                                                     and c.id = ID_H_NUM;
                                                                                  INSERT INTO prvp.prvCounterValue@RH
                                                                                     (ID, PRVCOUNTERID, CDATE, VALUE, INPUTDATE, USERNAME, HOUSEID)
                                                                                   VALUES
                                                                                     (prvp.sq_prvCounterValue.NextVal@RH, ID_H_NUM, TO_DATE(:CurrDate, 'RRRR-MM-DD'), :CurrValue, sysDate, 'internet_rvkp', vHouseId);
                                                                                end if;
                                                                                prvp.FILL_COMMUNA_COUNTER_VALUES@RH(ID_H_NUM, Pac_Month.Date_To_Month@RH(LAST_DAY(TO_DATE(:CurrDate, 'RRRR-MM-DD'))));
                                                                                Commit;
                                                                               EXCEPTION
                                                                                    WHEN OTHERS THEN
                                                                                      ROLLBACK;
                                                                                      t_error := 0;
                                                                                      t_error_text := SUBSTR(SQLERRM, 1, 1000);
                                                                               END;
                                                                               :t_error:=t_error;
                                                                               :t_error_text:=t_error_text;
                                                                               :item_index_out:=:item_index_in;
                                                                          end;`;
                                                          getExecQuery(data0,
                                                                       function(response0) {
                                                                          var item_index=response0.data.execout['item_index_out'];
                                                                          if (response0.data.execout['t_error']===0) {
                                                                              pr_ok_idb=false;
                                                                              var t_error_text=response0.data.execout['t_error_text'];
                                                                              refTableDB.current.state.items[item_index]['NEW_VALUE_ERROR']=t_error_text;
                                                                              $(tab_wtrmts_tbody).find('tr:eq('+item_index+') div.usr_error').text(t_error_text);
                                                                          }
                                                                          refTableDB.current.state.items[item_index]['STATE_QUERY_HBD']=true;
                                                                       }
                                                                     );
                                                       }
                                                    });
                                                    var MyInt= setInterval(function(){
                                                        var pr_end=true;
                                                        refTableDB.current.state.items.forEach(function(item,index) {
                                                          if (!item['STATE_QUERY_HBD']) {
                                                              pr_end=false;
                                                          }
                                                        });
                                                        if (pr_end) {
                                                            clearInterval (MyInt);
                                                            refLoadState.current.setState((state) => ({vis:--state.vis}));
                                                            if (pr_ok_idb) {
                                                                refTableDB.current.getDataSQL();
                                                            }
                                                            else {
                                                                refTableDB.current.setState({items:[...refTableDB.current.state.items]});
                                                            }
                                                        }
                                                    },500);

                                                  }
                                                  else {
                                                    //перерисовка таблицы с текстом ошибок
                                                    //refTableDB.current.setState({items:newItems});
                                                    refTableDB.current.setState({items:[...refTableDB.current.state.items]})
                                                  }
                                              },
                                          refLoadState
                                          );
                            }
                        },
                        div:{style:null}
                      };
  //объект для выпадающего списка с данными из БД
  const selectDBobj={stateLoadObj:refLoadState,
                    label:'Населённый пункт',
                    paramGroup:paramGroupV,
                    setParamGroup:setParamGroupV,
                    //наименование параметра для зависимых(дочерних) элементов
                    parChealdID:"placeName",
                    //необходимо наличие двух полей с именами value,label
                    sql:`SELECT DISTINCT p.name "value",
                                p.name "label"
                           FROM ab_places p
                          WHERE p.name IS NOT NULL
                          ORDER BY p.name`
                   };
  //объект для таблицы с данными из БД
  const tableDBObj={stateLoadObj:refLoadState,
                    tableContainerClass:'tab_wtrmtrs',
                    paramGroup:paramGroupV,
                    parParentID:['lsNum'],
                    sql:`WITH WTRM AS (
                          SELECT /*+ MATERIALIZE */
                              x.id watermeter_id
                             ,x.unit
                             ,x.unit_short
                             ,x.factory_number_and_pipe
                             ,x.last_check_endaccdate
                             ,x.transblock w_transblock
                             ,w_accdate
                             ,w_endaccdate
                             ,case when (NVL(last_check_endaccdate,TO_DATE('01.01.4000','DD.MM.RRRR'))<ADD_MONTHS(trunc(sysdate,'mm'),-1))
                                        OR (w_accdate>SYSDATE OR w_endaccdate < sysdate)
                                        OR x.transblock<1 THEN 'Закрыт'
                                    else 'Действует'
                               end PR_OPEN
                             ,WH.ID watermeter_id_h
                             ,CASE WHEN WH.closeDate is null and NVL(WH.EndDate,TO_DATE('31.12.4000','DD.MM.RRRR')) > ADD_MONTHS(trunc(sysdate,'mm'),-1) THEN 'Действует'
                                      ELSE 'Закрыт'
                                 END PR_OPEN_H
                             ,ROW_NUMBER() OVER (PARTITION BY x.unit ORDER BY x.unit DESC, w_accdate DESC,x.id) watermeter_num
                             FROM (
                              SELECT
                               DECODE(u.unit
                                  ,'ВодопотрГор.1гр', 'гор. водоснабжение'
                                  ,'ВодопотрХол.1гр', 'хол. водоснабжение'
                                  ,'ВодопотрОсн.2гр', 'Полив и др. нужды'
                                  ,'---') unit
                              ,DECODE(u.unit
                                  ,'ВодопотрГор.1гр', 'ГВС'
                                  ,'ВодопотрХол.1гр', 'ХВС'
                                  ,'ВодопотрОсн.2гр', 'полив'
                                  ,'---') unit_short
                              ,w.factory_number||' '||p.pipe_name factory_number_and_pipe
                              ,MAX(c.endaccdate) last_check_endaccdate
                              ,ls_squid
                              ,w.id
                              ,w.transblock
                              ,w.accdate w_accdate
                              ,w.endaccdate w_endaccdate
                              FROM
                               documents ls
                              ,ab_pipe2ls p2l
                              ,ab_watermeters w
                              ,ab_pipes p
                              ,w_watermeter_checks c
                              ,units u
                              WHERE ls.refid=:lsNum
                              AND ls.transblock = 1
                              AND ls.type = 'ЛицевойСчет'
                              AND p2l.ls_squid = ls.squid
                              AND p2l.accdate < SYSDATE
                              AND p2l.endaccdate > SYSDATE
                              AND p2l.transblock >= 1
                              AND w.pipe_id = p2l.pipe_id
                              AND p.id = w.pipe_id
                              AND p.accdate < SYSDATE
                              AND p.endaccdate > SYSDATE
                              AND p.transblock >= 1
                              AND c.ab_watermeter_id(+) = w.id
                              AND c.transblock(+) >= 1
                              AND u.squid = p.unit
                            GROUP BY
                               DECODE(u.unit
                                  ,'ВодопотрГор.1гр', 'гор. водоснабжение'
                                  ,'ВодопотрХол.1гр', 'хол. водоснабжение'
                                  ,'ВодопотрОсн.2гр', 'Полив и др. нужды'
                                  ,'---')
                              ,DECODE(u.unit
                               ,'ВодопотрГор.1гр', 'ГВС'
                               ,'ВодопотрХол.1гр', 'ХВС'
                               ,'ВодопотрОсн.2гр', 'полив'
                               ,'---')
                              ,w.factory_number||' '||p.pipe_name
                              ,DECODE(u.unit, 'ВодопотрГор.1гр', 3, 'ВодопотрХол.1гр', 1, 10)
                              ,ls_squid
                              ,w.id
                              ,w.transblock
                              ,w.accdate
                              ,w.endaccdate
                             ) x
                             LEFT JOIN MAPS_HIST MH
                              ON MH.TABLE_NAME='load_ab_watermeters'
                             AND MH.PREFIX='P'
                             AND MH.ID=X.id
                             LEFT JOIN prvp.prvCounter@RH WH
                              ON WH.ID=TO_NUMBER(substr(MH.EXTERNAL_ID,2))
                          ),
                          WTRM_V AS (
                          SELECT
                              v.watermeter_id
                             ,v.accdate
                             ,v.value
                             ,v.info_from
                             ,ROW_NUMBER() OVER (PARTITION BY v.watermeter_id ORDER BY v.accdate DESC) rn
                             FROM ab_watermeter_values v
                             JOIN WTRM W ON W.watermeter_id=v.watermeter_id
                             WHERE v.type = 'Показание'
                               AND v.status = 'Действует'
                          ),
                          WTRM_H_V AS (
                          SELECT w_id_h
                                ,VALUE
                                ,accdate
                                ,watermeter_id
                                ,PR_OPEN
                            FROM TABLE(WTRMTRS_FROM_DBH.AB_GET_ROWS(:lsNum))
                          )

                        SELECT w.watermeter_id RVKP_W_ID
                                ,w.factory_number_and_pipe SERNUM
                                ,TO_CHAR(w.last_check_endaccdate, 'DD.MM.YYYY') DATETEST
                                ,NVL(TO_CHAR(v.accdate, 'DD.MM.YYYY'), '-') LAST_DATE
                                ,NVL(v.value, 0) last_value
                                ,v.info_from last_info_from
                                ,NVL(v.value, 0)-NVL(v2.value,0) VOLUME
                                ,TRIM(w.unit_short) NAME
                                ,W.PR_OPEN
                                ,null new_value
                               ,NVL(ND.VAL,TO_CHAR(LAST_DAY(SYSDATE), 'RRRR-MM-DD')) new_date
                               ,0 NEW_VOLUME
                               --,T.USR
                               ,vh.w_id_h
                               ,vh.pr_open pr_open_h
                               ,NVL(TO_CHAR(VH.accdate, 'DD.MM.YYYY'), '-') LAST_DATE_H
                               ,VH.value last_value_h
                          FROM WTRM W
                          JOIN WTRM_V V
                            ON V.watermeter_id=W.watermeter_id
                          LEFT JOIN WTRM_V v2
                            ON w.watermeter_id = v2.watermeter_id and v2.rn=2
                          LEFT JOIN  WTRM_H_V VH
                            ON VH.watermeter_id=W.watermeter_id
                          LEFT JOIN (SELECT TO_CHAR(SYSDATE,'RRRR-MM-DD') VAL FROM DUAL
                                    /*select TO_CHAR(max(p.endaccdate),'RRRR-MM-DD') VAL from POSTS p
                                    where nvl(p.transblock,2)=1
                                      and p.cracc='ПредельнаяДата_WATER'
                                      and p.crhid='0'*/
                                   ) ND ON 1=1
                          WHERE V.rn=1
                         ORDER BY watermeter_num`,
                   /*selectRowProp: {mode: 'radio',
                                   bgColor: '#0070BA', // you should give a bgcolor, otherwise, you can't regonize which row has been selected
                                   hideSelectColumn: true,  // enable hide selection column.
                                   clickToSelect: true,  // you should enable clickToSelect, otherwise, you can't select column.
                                   selected:['RVKP_W_ID']
                                 },*/
                   keyField:'RVKP_W_ID',
                   columns:[{dataField:'RVKP_W_ID',text:'ID ПУ',hidden:true},
                           {dataField:'W_ID_H',text:'ID исторического ПУ',hidden:true},
                           {dataField:'NAME',text:'Усл.',headerAttrs: (column, colIndex) => ({ 'width': `50px` })},
                           {dataField:'SERNUM',text:'Заводской номер, место установки',headerAttrs: (column, colIndex) => ({ 'width': `120px` })},
                           {dataField:'DATETEST',text:'РВК.П окончание поверки',headerAttrs: (column, colIndex) => ({ 'width': `110px` })},
                           {dataField:'LAST_DATE',text:'РВК.П дата снятия',classes:'LAST_DATE',headerAttrs: (column, colIndex) => ({ 'width': `110px` })},
                           {dataField:'LAST_VALUE',text:'РВК.П показание',headerAttrs: (column, colIndex) => ({ 'width': `110px` })},
                           {dataField:'VOLUME',text:'РВК.П расход',headerAttrs: (column, colIndex) => ({ 'width': `90px` })},
                           {dataField:'LAST_INFO_FROM',text:'РВК.П источник',headerAttrs: (column, colIndex) => ({ 'width': `110px` })},
                           {dataField:'PR_OPEN',text:'РВК.П статус',headerAttrs: (column, colIndex) => ({ 'width': `110px` })},
                           {dataField:'LAST_DATE_H',text:'ИС дата снятия',classes:'LAST_DATE_H',headerAttrs: (column, colIndex) => ({ 'width': `110px` })},
                           {dataField:'LAST_VALUE_H',text:'ИС показание',headerAttrs: (column, colIndex) => ({ 'width': `110px` })},
                           {dataField:'PR_OPEN_H',text:'ИС статус',headerAttrs: (column, colIndex) => ({ 'width': `110px` })},
                           {dataField:'NEW_DATE',text:'Новая дата снятия',headerAttrs: (column, colIndex) => ({ 'width': `110px` }),
                            formatter:(cell, row, rowIndex)=>{
                                const thisV=refTableDB.current;
                                function handleChange(event) {
                                  thisV.state.items[rowIndex]['NEW_DATE']=event.target.value;
                                  thisV.setState({items:thisV.state.items});
                                }
                                if (row['PR_OPEN']!=='Закрыт') {
                                  return (
                                  <FormControl
                                    aria-describedby="basic-addon2"
                                    type="date"
                                    onChange={handleChange}
                                    defaultValue={cell}
                                    id={'ld_'+row['RVKP_W_ID']}
                                    style={{width:'10em'}}
                                  />);
                                }
                              }
                           },
                           {dataField:'NEW_VALUE',text:'Новое показание',headerAttrs: (column, colIndex) => ({ 'width': `110px` }),
                            formatter:(cell, row, rowIndex)=> {
                               const thisV=refTableDB.current;

                               function handleChange(event) {
                                 var value=0;
                                 if (row['PR_OPEN']!=='Закрыт') {
                                   if (!!event.target.value) {
                                     if (!!row['LAST_VALUE']) {
                                         value=+event.target.value-+row['LAST_VALUE'];
                                     }
                                     thisV.state.items[rowIndex]['NEW_VOLUME']=value;
                                     thisV.state.items[rowIndex]['NEW_VALUE_NUMBER']=+event.target.value;
                                     thisV.setState({items:[...thisV.state.items]});
                                     //таблица не перерисовывается автоматически, т.к. это происходит внутри formatter, а это блокировано самим компонентом
                                     $(event.target).closest('td').next().html(value);
                                   }
                                 }
                               }

                               function handleKeyDown(event) {
                                 if (event.keyCode === 13) {
                                    //ищем ближайшую строку, если нету, сохраняем
                                    var tr_tek=$(event.target).closest('tr');
                                    if ((+event.target.value>0) & (!$(tr_tek).hasClass('usr_sel'))) {
                                        $(tr_tek).addClass('usr_sel');
                                    }
                                    tr_tek=$(tr_tek).next();
                                    while (($(tr_tek).is('tr')) & ($(tr_tek).find("div[id='new_volume_block']").length===0)) {
                                        tr_tek=$(tr_tek).next();
                                    }
                                    if ($(tr_tek).is('tr')) {
                                        $(tr_tek).find("div[id='new_volume_block'] input").focus().select();
                                    }
                                    else {
                                        $('#saveWtrmtrs').trigger('click');
                                    }
                                 }
                               }

                               if (row['PR_OPEN']!=='Закрыт') {
                                 return (
                                     <div id="new_volume_block">
                                       <FormControl
                                         aria-describedby="basic-addon2"
                                         type="number"
                                         onChange={handleChange}
                                         onKeyDown={handleKeyDown}
                                         style={{width:'7em'}}
                                       />
                                       <div className="usr_error"></div>
                                     </div>
                                 );
                               }
                             }
                           },
                           {dataField:'NEW_VOLUME',text:'Новый расход',headerAttrs: (column, colIndex) => ({ 'width': `110px` })},
                           {dataField:'RETURN_COMBINED_NAME',text:'Вид ПУ',headerAttrs: (column, colIndex) => ({ 'width': `110px` })},
                           {dataField:'MOUNT_ACCDATE',text:'Дата последней опломбировки',headerAttrs: (column, colIndex) => ({ 'width': `110px` })},
                           {dataField:'RETURN_COMBINED_ID',text:'ID Вида ПУ',hidden:true},
                         ],
                    afterLoadData:function() {
                        deltaCheckWtrmtrs(paramGroupV['checkWtrmtrs']);
                    }
                   };
  //classLoad=classes.root;
  const deltaCheckWtrmtrs=(checked)=>{
    $('.tab_wtrmtrs tbody tr').each(function(i,elem) {
      $(elem).show();
      var el_wtrmtr_val=$(elem).find('div[id="new_volume_block"] input');
      if (($(elem).find('td').length>1) && ($(el_wtrmtr_val).length===0) && (checked)) {
        $(elem).hide();
      }

      if ($(el_wtrmtr_val).length>0) {
          var in_ld_val=$(elem).find('input[id^="ld_"]').val().trim(),
              dateH=$(elem).find('td.LAST_DATE').text();
          var mass_date=dateH.split("."),
              dayH=parseInt(mass_date[0]),
              monthH=parseInt(mass_date[1]),
              yearH=parseInt(mass_date[2]);
          mass_date=in_ld_val.split("-");
          var year=parseInt(mass_date[0]),
              month=parseInt(mass_date[1]),
              day=parseInt(mass_date[2]);
          if ((dayH===1) & (month===monthH) & (year===yearH)) {
              monthH-=1;
          }
          if (monthH==0) {
              monthH=12;
              yearH-=1;
          }
          if (((monthH>=month) & (yearH>=year)) || (yearH>year)) {
              $(elem).addClass('usr_sel');
          }
      }
    });
  }
  deltaCheckWtrmtrs(paramGroupV['checkWtrmtrs']);

  const checkWtrmtrsHandleChange = (event) => {
    let newObj = { ...paramGroupV };
    newObj['checkWtrmtrs']=event.target.checked;
    setParamGroupV(newObj);
  };

  const handleClickSearche=() => {
      refInputDB.current.funcHandleChange();
  }

  //объект для поля с данными из БД подгружаемых по нажатию Enter
  const inputeDBObj={stateLoadObj:refLoadState,
                       in_id:"ls",
                       tab_id:"idbt1",
                       modal_header:"Выберите ЛС",
                       label:'Поиск по ЛС:',
                       paramGroup:paramGroupV,
                       setParamGroup:setParamGroupV,
                       parParentID:['placeName'],
                       //наименование параметра для зависимых(дочерних) элементов
                       parChealdID:"lsNum",
                       sql:`SELECT  LS.REFID VAL,
                                    LS.REFID NAME,
                                   MAX(c.fname) keep(dense_rank FIRST order by v3.accdate DESC) FIO,
                                   p.name||', '||s.name||case when nvl(h.house,'')='' then ''
                                                         else ', д. '||h.house
                                                    end||
                                                    case when ls.textinfo is null then ''
                                                         else ', кв. '||ls.textinfo
                                                    end ADRES,
                                   CASE WHEN MLS.LSID IS NOT NULL THEN 'ДА'
                                        ELSE 'НЕТ'
                                   END PR_MARKER
                              FROM documents ls
                              LEFT JOIN ab_ls_not_calc mls
                                ON mls.lsid = ls.squid
                               AND mls.status = 1
                             inner join attr_ids ai_lg
                                on ai_lg.obj_id = ls.squid
                               AND ai_lg.type_id = mc.type_id('ЛицевойСчетПоГруппе')
                               AND ai_lg.accdate <= sysdate
                               AND ai_lg.endaccdate > sysdate
                               AND ai_lg.transblock >= 1
                             inner join attr_ids v1
                                on v1.obj_id = ai_lg.value
                               AND v1.type_id = mc.type_id('ОбъектВодоснабженияДляГруппы')
                               AND v1.transblock >= 1
                               AND v1.accdate <= sysdate
                               AND v1.endaccdate > sysdate
                             inner join attr_ids v2
                                on v2.obj_id = v1.value
                               AND v2.type_id = mc.type_id('АдресОбъектаВодоснабжения')
                               AND v2.transblock >= 1
                               AND v2.accdate <= sysdate
                               AND v2.endaccdate > sysdate
                             inner join ab_houses h
                                on h.id = v2.value
                               AND h.transblock >= 1
                             inner join ab_streets s
                                on s.id = h.id_street
                             inner join ab_places p
                                on p.id = s.place_id
                              JOIN attr_ids v3
                                ON v3.obj_id = ls.squid
                               AND v3.type_id = mc.type_id('АбонентПоЛицСчету') -- АбонентПоЛицСчету 16
                               AND v3.transblock >= 1
                               AND v3.value_table_id = 2
                              JOIN counterparties c
                                ON v3.value = c.squid
                             WHERE ls.transblock = 1
                               and ls.type = 'ЛицевойСчет'
                               and p.name like :placeName\n`,
                      selectRowProp: {mode: 'radio',
                                      //mode: 'checkbox',
                                      bgColor: '#0070BA', // you should give a bgcolor, otherwise, you can't regonize which row has been selected
                                      hideSelectColumn: true,  // enable hide selection column.
                                      clickToSelect: true
                                    },
                      /*наличие полей(колонок) со служебными именами NAME и VAL(ключевое поле) обязательно*/
                      columns:[{dataField:'VAL',text:'Номер ЛС',hidden:true},
                               {dataField:'NAME',text:'Номер ЛС'},
                                {dataField:'ADRES',text:'Адрес'},
                                {dataField:'PR_MARKER',text:'Маркированный'},
                              ],
                      paginationFactory:paginationFactory,
                      paginationOptions:{paginationSize: 7,
                                          sizePerPageList: [{
                                              text: '10', value: 10
                                            }, {
                                              text: '50', value: 10
                                            }, {
                                              text: '100', value:100
                                            }, {
                                              text: '500', value:500
                                            }]
                                        },
                      //filterFactory:filterFactory,
                      beforeLoadData:function(thisV,data) {
                        var ls_obj=$('input#ls'),
                                ls_v=$(ls_obj).val().trim(),
                                street_v=$('input#street').val().trim(),
                                house_v=$('input#house').val().trim(),
                                kv_v=$('input#flat').val().trim();
                            if ((ls_v.length===0) & (street_v.length===0) & (house_v.length===0)) {
                                thisV.setState({alertshow:true,
                                                alertText:'Для поиска ЛС необходимо ввести или его номер или привязанный к нему адрес'
                                              });
                                data.error=true;
                            }
                            else {
                                //получаем id ЛС
                                if (ls_v.length!==0) {
                                    data.sql+="and LS.REFID like :lsNum\n";
                                    data.params.lsNum=ls_v;
                                }
                                if (street_v.length!==0) {
                                    street_v=street_v.split(' ').join('%')+'%';
                                    data.sql+="and UPPER(s.name) like UPPER(:street)\n";
                                    data.params.street=street_v;
                                }
                                if (house_v.length!==0) {
                                    house_v=house_v.split(' ').join('%');
                                    data.sql+="and UPPER(h.house) like UPPER(:house)\n";
                                    data.params.house=house_v;
                                }
                                if (kv_v.length!==0) {
                                    kv_v=kv_v.split(' ').join('%')+'%';
                                    data.sql+="and UPPER(ls.textinfo) like UPPER(:kv)\n";
                                    data.params.kv=kv_v;
                                }
                                data.sql+=`GROUP BY p.name
                                                  ,MLS.LSID
                                                  ,s.name
                                                  ,h.house
                                                  ,ls.textinfo
                                                  ,LS.REFID
                                                 ORDER BY s.name,h.house,ls.textinfo`;
                                setAbonentSearhe('');
                            }
                      },
                      afterLoadData:function(thisV,response) {
                        if (response.data.length===1) {
                          setAbonentSearhe('Найден абонент: '+response.data[0]['NAME']+'; '+
                                             response.data[0]['FIO']+'; '+
                                             response.data[0]['ADRES']+
                                             '; Наличие маркера:'+response.data[0]['PR_MARKER']
                                          );
                        }
                      },
                      afterChangeRowTab:function(thisV) {
                        setAbonentSearhe('Найден абонент: '+thisV.state.selectRowFull['NAME']+'; '+
                                           thisV.state.selectRowFull['FIO']+'; '+
                                           thisV.state.selectRowFull['ADRES']+
                                           '; Наличие маркера:'+thisV.state.selectRowFull['PR_MARKER']
                                        );
                      }
              }

  return (
    <div className="App">
      <LoadState ref={refLoadState} />
      <CustomAlert ref={refCustomAlert}/>
      <Container fluid>
        <Row>
          <Col>
            <InputDB ref={refInputDB} obj={ inputeDBObj }/>
          </Col>
          <Col>
            <DivImgClick obj={ divImgClickObj } />
          </Col>
        </Row>
        <Row style={{'margin-top':'1%'}}>
          <Col>
            <label htmlFor="basic-url">Поиск по адресу:</label>
          </Col>
        </Row>
        <Row>
          <Col>
            <SelectDB obj={ selectDBobj }/>
          </Col>
          <Col>
            <label htmlFor="basic-url">Улица</label>
            <FormControl
                placeholder="Введите значение"
                aria-label="Введите значение"
                aria-describedby="basic-addon2"
                id="street"
              />
          </Col>
          <Col>
            <label htmlFor="basic-url">Дом</label>
            <FormControl
                placeholder="Введите значение"
                aria-label="Введите значение"
                aria-describedby="basic-addon2"
                id="house"
              />
          </Col>
          <Col>
            <label htmlFor="basic-url">Кв.</label>
            <FormControl
                placeholder="Введите значение"
                aria-label="Введите значение"
                aria-describedby="basic-addon2"
                id="flat"
              />
          </Col>
        </Row>
        <Row style={{'margin-top':'1%'}}>
          <Col >
            <Button onClick={()=>handleClickSearche()} id="butSearcheLS">Найти</Button>
          </Col>
          <Col >
            <FormControlLabel
              control={
                <Checkbox
                  checked={paramGroupV.checkWtrmtrs}
                  onChange={checkWtrmtrsHandleChange}
                  id="checkWTRMTRS"
                  color="primary"
                />
              }
              label="Скрывать недействующие ПУ"
            />
          </Col>
        </Row>
        <Row>
          <Col >
             {abonentSearhe}
          </Col>
        </Row>
        <Row style={{'margin-top':'1%'}} fluid>
          <Col fluid>
            <TableDB ref={refTableDB} obj={ tableDBObj }/>
          </Col>
        </Row>
        <Row style={{'margin-top':'1%'}}>
          <Col >
             F10 - сохранить
          </Col>
        </Row>
        <Row>
          <Col >
             F9 - переместиться в поле поиска ЛС
          </Col>
        </Row>
        <Row>
          <Col >
             F8 - Запустить поиск (аналог нажатия кнопки "Найти")
          </Col>
        </Row>
        <Row>
          <Col >
             F7 - Переместиться в поле поиска "Улица"
          </Col>
        </Row>
        <Row>
          <Col >
             Enter при нахождении в поле поиска ЛС - запуск поиска
          </Col>
        </Row>
        <Row>
          <Col >
             Tab - переход к следующему "Полю ввода"/кнопке
          </Col>
        </Row>
        <Row>
          <Col >
             Enter при нахождении в поле "Новое показание" - переход к следующему показанию или сохранение (если текущий ПУ последний в списке)
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Load_watermeter_values;
