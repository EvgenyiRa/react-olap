import React,{ useState,useRef } from 'react';

import Loading from '../../components/Loading';
import AlertPlus from '../../components/AlertPlus';
import ConfirmPlus from '../../components/ConfirmPlus';
import WinModal from '../../components/WinModal';
import TableOLAP from '../../components/TableOLAP';
import MultiselectSQL from '../../components/MultiselectSQL';
import BootstrapInput from '../../components/BootstrapInput';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
//import InputGroup from 'react-bootstrap/InputGroup';

import $ from 'jquery'

import {getSQLRun2,getHashPwd,getSQLRun} from '../../system.js';

function Users() {
  //хук для отслеживания изменения параметров компонетов (для упрощения взаимодействия компонентов)
  let [paramGroupV, setParamGroupV] = useState({users:[],rights:[]});
  //хук-ссылки на элементы для удобной работы с ними
  const refAlertPlus=useRef(),
        refConfirmPlus=useRef(),
        refLoading=useRef(),
        refWinModal=useRef(),
        refInputFIO=useRef(),
        refInputLogin=useRef(),
        refInputPwdVis=useRef(),
        refInputEmail=useRef(),
        refInputPhone=useRef(),
        refSelectUser=useRef(),
        refSelectRight=useRef(),
        refTableOLAP=useRef(),
        refInputRightName=useRef(),
        refInputRightSysName=useRef();

  //объект для выпадающего списка с данными из БД
  const selectUserObj={stateLoadObj:refLoading,
                        label:'Пользователи',
                        paramGroup:paramGroupV,
                        setParamGroup:setParamGroupV,
                        //наименование параметра для зависимых(дочерних) элементов
                        parChealdID:"users",
                        //необходимо наличие двух полей с именами value,label
                        sql:`SELECT DISTINCT
                                    R.USER_ID "value",
                                    R.FIO "label"
                                FROM REP_USERS R
                                ORDER BY R.FIO`,
                        multiple:true
                       };

   //объект для выпадающего списка с данными из БД
   const selectRightObj={stateLoadObj:refLoading,
                         label:'Права',
                         paramGroup:paramGroupV,
                         setParamGroup:setParamGroupV,
                         //наименование параметра для зависимых(дочерних) элементов
                         parChealdID:"rights",
                         //необходимо наличие двух полей с именами value,label
                         sql:`select T.RIGHTS_ID "value",T.NAME "label"
                                from REP_RIGHTS t`,
                         multiple:true
                        };

  //получение объекта модального окна для работы с пользователями (добавление,редактирование)
  const getWinModalUser=(type,tr) => {
    const handleButtonNextL=() => {
      let data={};
      data.exec_params_in={};
      data.exec_params_in['fio']=refInputFIO.current.state.value;
      data.exec_params_in['login']=refInputLogin.current.state.value;
      let prErr=false;
      if ((!!!refInputFIO.current.state.value) || (!!!refInputLogin.current.state.value)) {
        prErr=true;
        if (!!!refInputFIO.current.state.value) {
          refInputFIO.current.setState({isInvalid:true,invalidText:'Поле обязательно к заполнению'});
        }
        if (!!!refInputLogin.current.state.value) {
          refInputLogin.current.setState({isInvalid:true,invalidText:'Поле обязательно к заполнению'});
        }
      }
      if (!prErr) {
        //проверяем существование пользователя с введенным логином
        let data1={};
        data1.params={login:data.exec_params_in['login']};
        //let resp_data;
        data1.sql=`SELECT COUNT(1) COUNT
                    FROM REP_USERS
                   WHERE login=:login`;
        if (type==='edit') {
          data.exec_params_in['user_id']=+$(tr).find('td#FIO input').val();
          data1.params.user_id=data.exec_params_in['user_id'];
          data1.sql+=` AND USER_ID!=:user_id`;
        }
        getSQLRun(data1,(response1)=> {
                  if (response1.data[0].COUNT>0) {
                      refInputLogin.current.setState({isInvalid:true,invalidText:'Уже существует, введите другое значение'});
                  }
                  else {
                    data.exec_params_in['email']=(!!!refInputEmail.current.state.value)?null:refInputEmail.current.state.value.trim();
                    data.exec_params_in['phone']=(!!!refInputPhone.current.state.value)?null:refInputPhone.current.state.value.trim();
                    if (type==='add') {
                        let data0={password:refInputPwdVis.current.state.value};
                        if (!!!refInputPwdVis.current.state.value) {
                          prErr=true;
                          refInputPwdVis.current.setState({isInvalid:true,invalidText:'Поле обязательно к заполнению'})
                        }
                        else if (refInputPwdVis.current.state.value.length<6) {
                          prErr=true;
                          refInputPwdVis.current.setState({isInvalid:true,invalidText:'Не менее 6 символов'})
                        }
                        if (!prErr) {
                          data.execsql=`INSERT INTO REP_USERS (USER_ID, FIO, LOGIN, PASSWORD, EMAIL, PHONE, SOL)
                                        VALUES (REP_USERS_ID_SQ.NEXTVAL, :fio, :login, :password, :email, :phone, :sol)
                                     RETURNING USER_ID INTO :user_id`;
                         data.exec_params_out=[];
                         data.exec_params_out.push({name:'user_id',type:'number'});
                          getHashPwd(data0,
                                     function(response) {
                                       data.exec_params_in['password']=response.hash;
                                       data.exec_params_in['sol']=response.sol;
                                       getSQLRun2(data,
                                                    function(response0) {
                                                       const newUsers=[...refSelectUser.current.state.options,{label:data.exec_params_in['fio'],value:response0.data.execout['user_id']}];
                                                       refSelectUser.current.setState({options:newUsers});
                                                       refTableOLAP.current.getDropTableOne();
                                                       refTableOLAP.current.getDataSQL();
                                                       refWinModal.current.setState({modalShow:false});
                                                    },
                                                    refLoading
                                                  );
                                     },
                                     refLoading
                                    );
                        }
                    }
                    else if (type==='edit') {
                        let data0;
                        if (!!refInputPwdVis.current.state.value) {
                          if (refInputPwdVis.current.state.value.length<6) {
                            prErr=true;
                            refInputPwdVis.current.setState({isInvalid:true,invalidText:'Не менее 6 символов'});
                          }
                          else {
                            data0={password:refInputPwdVis.current.state.value}
                          }
                        }
                        if (!prErr) {
                          data.exec_params_in['password']=null;
                          data.execsql=`UPDATE REP_USERS
                                           SET FIO=:fio,
                                               LOGIN=:login,
                                               PASSWORD=NVL(:password,PASSWORD),
                                               EMAIL=:email,
                                               PHONE=:phone
                                         WHERE USER_ID=:user_id`;
                         function updUser() {
                           getSQLRun2(data,
                                        function(response0) {
                                           //находим пользователя в списке, правим фамилию на случай если изменили
                                           const newUsers=[...refSelectUser.current.state.options];
                                           for (var i = 0; i < newUsers.length; i++) {
                                             if (+newUsers[i].value===data.exec_params_in['user_id']) {
                                               newUsers[i].label=data.exec_params_in['fio'];
                                               refSelectUser.current.setState({options:newUsers});
                                               break;
                                             }
                                           }
                                           refTableOLAP.current.getDropTableOne();
                                           refTableOLAP.current.getDataSQL();
                                           refWinModal.current.setState({modalShow:false});
                                        },
                                        refLoading
                                      );
                         }
                         if (!!refInputPwdVis.current.state.value) {
                          data0.sol=$(tr).find('td#LOGIN input').val();
                          getHashPwd(data0,
                                     function(response) {
                                       data.exec_params_in['password']=response.hash;
                                       updUser();
                                     },
                                     refLoading
                                    );
                          }
                          else {
                            updUser();
                          }
                        }
                    }
                  }
                 },
                 refLoading
                );
      }
    }
    let emailUpd;
    if (type==='edit') {
        emailUpd=$(tr).find('td#EMAIL').clone();
        $(emailUpd).find('div.div_hidden').remove();
        emailUpd=$(emailUpd).text();
    }
    else {
        emailUpd=null;
    }
    return {
        modalShow:true,
        header:(type==='add')?'Добавление пользователя':'Редактирование пользователя',
        nextButtonLabel:(type==='add')?'Добавить':'Изменить',
        handleButtonNext:handleButtonNextL,
        body:<Container fluid>
                <Row>
                  <Col>
                    <BootstrapInput
                      ref={refInputFIO}
                      obj={{
                        label:'ФИО',
                        id:"fio",
                        onChange:(event,thisV) => {
                            let valueL=String(event.target.value).trim();
                            if (thisV.state.isInvalid) {
                              if (valueL!=='') {
                                  thisV.setState({isInvalid:false});
                              }
                            }
                            thisV.setState({value:valueL});
                        },
                        defaultValue:(type==='edit')?$(tr).find('td#FIO').text():null
                      }}
                    />
                  </Col>
                  <Col>
                    <BootstrapInput
                      ref={refInputLogin}
                      obj={{
                        label:'Логин',
                        id:"login",
                        onChange:(event,thisV) => {
                            let valueL=String(event.target.value).trim();
                            if (thisV.state.isInvalid) {
                              if (valueL!=='') {
                                  thisV.setState({isInvalid:false});
                              }
                            }
                            thisV.setState({value:valueL});
                        },
                        defaultValue:(type==='edit')?$(tr).find('td#LOGIN').text():null
                      }}
                    />
                  </Col>
                </Row>
                <Row style={{marginTop:'1rem'}}>
                  <Col>
                    <BootstrapInput
                      ref={refInputPwdVis}
                      obj={{
                        label:'Пароль',
                        id:"password_vis",
                        onChange:(event,thisV) => {
                            let valueL=String(event.target.value).trim();
                            if (valueL.length>5) {
                              if (thisV.state.isInvalid) {
                                if (valueL!=='') {
                                    thisV.setState({isInvalid:false});
                                }
                              }
                            }
                            thisV.setState({value:valueL});
                        }
                      }}
                    />
                  </Col>
                  <Col>
                    <BootstrapInput
                      ref={refInputEmail}
                      obj={{
                        label:'Email',
                        id:"email",
                        type:"email",
                        defaultValue:emailUpd
                      }}
                    />
                  </Col>
                </Row>
                <Row style={{marginTop:'1rem'}}>
                  <Col>
                    <BootstrapInput
                      ref={refInputPhone}
                      obj={{
                        label:'Телефон',
                        id:"phone",
                        type:"tel",
                        defaultValue:(type==='edit')?$(tr).find('td#PHONE').text():null
                      }}
                    />
                  </Col>
                </Row>
              </Container>
    }
  }

  //получение объекта модального окна для работы с правами (добавление,редактирование)
  const getWinModalRight=(type,td) => {
    const handleButtonNextL=() => {
      let data={};
      data.exec_params_in={};
      data.exec_params_in['rightName']=refInputRightName.current.state.value;
      data.exec_params_in['rightSysName']=refInputRightSysName.current.state.value;
      let prErr=false;
      if ((!!!refInputRightName.current.state.value) || (!!!refInputRightSysName.current.state.value)) {
        prErr=true;
        if (!!!refInputRightName.current.state.value) {
          refInputRightName.current.setState({isInvalid:true,invalidText:'Поле обязательно к заполнению'});
        }
        if (!!!refInputRightSysName.current.state.value) {
          refInputRightSysName.current.setState({isInvalid:true,invalidText:'Поле обязательно к заполнению'});
        }
      }
      if (!prErr) {
        //проверяем существование права с введенными наименованиями
        let data1={};
        data1.params={sysname:data.exec_params_in['rightSysName']};
        //let resp_data;
        data1.sql=`SELECT COUNT(1) COUNT
                     FROM REP_RIGHTS
                    WHERE SYSNAME=:sysname`;
        if (type==='edit') {
          data.exec_params_in['right_id']=$(td).find('input').val();
          data1.params.right_id=data.exec_params_in['right_id'];
          data1.sql+=` AND RIGHTS_ID!=:right_id`;
        }
        getSQLRun(data1,(response1)=> {
                  if (response1.data[0].COUNT>0) {
                      refInputRightSysName.current.setState({isInvalid:true,invalidText:'Уже существует, введите другое значение'});
                  }
                  else {
                    if (type==='add') {
                        if (!prErr) {
                          data.execsql=`INSERT INTO REP_RIGHTS (RIGHTS_ID, NAME, SYSNAME) VALUES (REP_RIGHTS_ID_SQ.NEXTVAL, :rightName, :rightSysName)
                                           RETURNING RIGHTS_ID INTO :right_id`;
                           data.exec_params_out=[];
                           data.exec_params_out.push({name:'right_id',type:'number'});
                           getSQLRun2(data,
                                        function(response0) {
                                           const newRights=[...refSelectRight.current.state.options,{label:data.exec_params_in['rightName'],value:response0.data.execout['right_id']}];
                                           refSelectRight.current.setState({options:newRights});
                                           refTableOLAP.current.getDropTableOne();
                                           refTableOLAP.current.getDataSQL();
                                           refWinModal.current.setState({modalShow:false});
                                        },
                                        refLoading
                                      );
                        }
                    }
                    else if (type==='edit') {
                      if (!prErr) {
                        data.execsql=`UPDATE REP_RIGHTS
                                         SET NAME=:rightName, SYSNAME=:rightSysName
                                       WHERE RIGHTS_ID=:right_id`;
                         getSQLRun2(data,
                                      function(response0) {
                                         const newRights=[...refSelectRight.current.state.options];
                                         for (var i = 0; i < newRights.length; i++) {
                                           if (newRights[i].value==data.exec_params_in['right_id']) {
                                             newRights[i].label=data.exec_params_in['rightName'];
                                             refSelectRight.current.setState({options:newRights});
                                             break;
                                           }
                                         }
                                         refTableOLAP.current.getDropTableOne();
                                         refTableOLAP.current.getDataSQL();
                                         refWinModal.current.setState({modalShow:false});
                                      },
                                      refLoading
                                    );
                      }
                    }
                  }
                },
                refLoading
              );
      }
    }
    if (type==='edit') {
      //получаем сис.наименование права
      let data1={};
      data1.params={right_id:$(td).find('input').val()};
      //let resp_data;
      data1.sql=`SELECT SYSNAME
                   FROM REP_RIGHTS
                  WHERE RIGHTS_ID=:right_id`;
      getSQLRun(data1,(response1) => {
          $('input#'+refInputRightSysName.current.props.obj.id).val(response1.data[0].SYSNAME);
          refInputRightSysName.current.setState({value:response1.data[0].SYSNAME});
      });
    }
    return {
        modalShow:true,
        header:(type==='add')?'Добавление права':'Редактирование права',
        nextButtonLabel:(type==='add')?'Добавить':'Изменить',
        handleButtonNext:handleButtonNextL,
        body:<Container fluid>
                <Row>
                  <Col>
                    <BootstrapInput
                      ref={refInputRightName}
                      obj={{
                        label:'Наименование права',
                        id:"rightName",
                        onChange:(event,thisV) => {
                            let valueL=String(event.target.value).trim();
                            if (thisV.state.isInvalid) {
                              if (valueL!=='') {
                                  thisV.setState({isInvalid:false});
                              }
                            }
                            thisV.setState({value:valueL});
                        },
                        defaultValue:(type==='edit')?$(td).text():null
                      }}
                    />
                  </Col>
                </Row>
                <Row style={{marginTop:'1rem'}}>
                  <Col>
                    <BootstrapInput
                      ref={refInputRightSysName}
                      obj={{
                        label:'Сис.наименование права',
                        id:"rightSysName",
                        onChange:(event,thisV) => {
                            let valueL=String(event.target.value).trim();
                            if (thisV.state.isInvalid) {
                              if (valueL!=='') {
                                  thisV.setState({isInvalid:false});
                              }
                            }
                            thisV.setState({value:valueL});
                        },
                        defaultValue:null
                      }}
                    />
                  </Col>
                </Row>
              </Container>
    }
  }

  const tableOLAPObj={
    id:'tabUsers',
    stateLoadObj:refLoading,
    paramGroup:paramGroupV,
    setParamGroup:setParamGroupV,
    parParentID:['users','rights'],
    data:{params_val: {},
          sql_true: `SELECT NVL(U.FIO,'')||
                            '<input type="hidden" value="'||U.USER_ID||'">'  FIO,
                            U.LOGIN||
                            '<input type="hidden" value="'||U.SOL||'">' LOGIN,
                            U.EMAIL,
                            U.PHONE,
                            R.NAME||
                            '<input type="hidden" value="'||R.RIGHTS_ID||'">' RIGHTS_NAME,
                            '<input type="checkbox" class="usr_right_value" checked>' VALUE
                      FROM REP_RIGHTS R
                      JOIN REP_USERS_RIGHTS UR
                      ON R.RIGHTS_ID=UR.RIGHT_ID
                      JOIN REP_USERS U
                      ON UR.USER_ID=U.USER_ID
                      WHERE (U.USER_ID IN (:users) OR (exists(SELECT 1 from table(sys.ODCINumberList(:users)) where COLUMN_VALUE is null)))
                       AND (R.RIGHTS_ID IN (:rights) OR (exists(SELECT 1 from table(sys.ODCINumberList(:rights)) where COLUMN_VALUE is null)))
                      UNION ALL
                      SELECT *
                      FROM (SELECT U.FIO||
                            '<input type="hidden" value="'||U.USER_ID||'">'  FIO,
                            U.LOGIN||
                            '<input type="hidden" value="'||U.SOL||'">' LOGIN,
                            U.EMAIL,
                            U.PHONE,
                            R.NAME||
                            '<input type="hidden" value="'||R.RIGHTS_ID||'">' RIGHTS_NAME,
                            '<input type="checkbox" class="usr_right_value">' VALUE
                      FROM REP_USERS U
                      LEFT JOIN REP_RIGHTS R
                      ON 1=1
                      --WHERE U.USER_ID=2
                      AND NOT EXISTS(SELECT 1
                                     FROM REP_USERS_RIGHTS UR
                                    WHERE UR.USER_ID=U.USER_ID
                                      AND UR.RIGHT_ID=R.RIGHTS_ID
                                  )
                      WHERE (U.USER_ID IN (:users) OR (exists(SELECT 1 from table(sys.ODCINumberList(:users)) where COLUMN_VALUE is null)))
                       AND (R.RIGHTS_ID IN (:rights) OR (exists(SELECT 1 from table(sys.ODCINumberList(:rights)) where COLUMN_VALUE is null)))
                      ) T
                      WHERE T.RIGHTS_NAME!='<input type="hidden" value="">'`,
          tab_pok: [{"SYSNAME":"RIGHTS_NAME","NAME":"Наименование права"}],
          tab_pol: [],
          tab_str: [{"SYSNAME":"LOGIN","NAME":"Логин"},
                      {"SYSNAME":"FIO","NAME":"ФИО"},
                      {"SYSNAME":"EMAIL","NAME":"Email"},
                      {"SYSNAME":"PHONE","NAME":"Телефон"}
                     ],
          tab_val: [{"SYSNAME":"VALUE","NAME":"Значение","AGGR":"MAX"}]
        },
    componentDidMount:(thisV)=> {
        //переопределяем, т.к. по-умолчанию первый раз запращиваются данные только если нет параметров для запроса
        if ((!!!thisV.state.tabname) & (!thisV.state.prRun)) {
          //костыль, хз почему 2 раза иногда срабатывает
          thisV.getDataSQL();
        }
    },
    //отображение действия построения графика (по-умолчанию false)
    graf:true,
    //действия панели таблицы
    addRow:(thisV) => {
              refWinModal.current.setState(getWinModalUser('add'));
           },
    editRow:(thisV) => {
            if (thisV.state.selectRow.length===0) {
                refAlertPlus.current.setState({show:true,text:'Необходимо кликом левой кнопки мыши по строке таблицы выбрать пользователя'});
            }
            else {
                refWinModal.current.setState(getWinModalUser('edit',thisV.state.selectRow[0]));
            }
          },
    deleteRow:(thisV) => {
                if (thisV.state.selectRow.length===0) {
                    refAlertPlus.current.setState({show:true,text:'Необходимо кликом левой кнопки мыши по строке таблицы выбрать пользователя'});
                }
                else {
                    refConfirmPlus.current.setState({show:true,
                                                      text:'Вы действительно хотите удалить пользователя с ФИО "'+$(thisV.state.selectRow[0]).find('td#FIO').text()+'"',
                                                      callback:(res) => {
                                                          if (res) {
                                                            let user_id=$(thisV.state.selectRow[0]).find('td#FIO input').val();
                                                            if (!!user_id) {
                                                                let data={};
                                                                data.exec_params_in={};
                                                                data.execsql=`BEGIN
                                                                                DELETE FROM REP_USERS
                                                                                WHERE USER_ID=:user_id;
                                                                                DELETE FROM REP_USERS_RIGHTS
                                                                                WHERE USER_ID=:user_id;
                                                                              END;`;
                                                                data.exec_params_in['user_id']=+user_id;
                                                                getSQLRun2(data,
                                                                             function(response0) {
                                                                                //находим пользователя в списке, удаляем
                                                                                const newUsers=[...refSelectUser.current.state.options];
                                                                                for (var i = 0; i < newUsers.length; i++) {
                                                                                   if (+newUsers[i].value===data.exec_params_in['user_id']) {
                                                                                     newUsers.splice(i, 1);
                                                                                     refSelectUser.current.setState({options:newUsers});
                                                                                     break;
                                                                                   }
                                                                                }
                                                                                thisV.getDropTableOne();
                                                                                thisV.getDataSQL();
                                                                             },
                                                                             refLoading
                                                                           );
                                                            }
                                                          }
                                                      }});
                }
             },
    dopAction:[{id:'add_right',label:'Добавить право',
                callback:(thisV) => {
                  refWinModal.current.setState(getWinModalRight('add'));
                }},
               {id:'edit_right',label:'Редактировать право',
                callback:(thisV) => {
                  if (thisV.state.selectTd.length===0) {
                      refAlertPlus.current.setState({show:true,text:'Необходимо кликом левой кнопки мыши по ячейке выбрать право'});
                  }
                  else {
                      refWinModal.current.setState(getWinModalRight('edit',thisV.state.selectTd[0]));
                  }
                }},
                {id:'delete_right',label:'Удалить право',
                 callback:(thisV) => {
                   if (thisV.state.selectTd.length===0) {
                       refAlertPlus.current.setState({show:true,text:'Необходимо кликом левой кнопки мыши по ячейке выбрать право'});
                   }
                   else {
                       refConfirmPlus.current.setState({show:true,
                                                         text:'Вы действительно хотите удалить право с наименованием "'+$(thisV.state.selectTd[0]).text()+'"',
                                                         callback:(res) => {
                                                             if (res) {
                                                               let right_id=$(thisV.state.selectTd[0]).find('input').val();
                                                               if (!!right_id) {
                                                                   let data={};
                                                                   data.exec_params_in={};
                                                                   data.execsql=`BEGIN
                                                                                   DELETE FROM REP_USERS_RIGHTS
                                                                                    WHERE RIGHT_ID=:right_id;
                                                                                   DELETE
                                                                                    FROM REP_RIGHTS
                                                                                   WHERE RIGHTS_ID=:right_id;
                                                                                 END;`;
                                                                   data.exec_params_in['right_id']=+right_id;
                                                                   getSQLRun2(data,
                                                                                function(response0) {
                                                                                  //находим право в списке, удаляем
                                                                                  const newRights=[...refSelectRight.current.state.options];
                                                                                  for (var i = 0; i < newRights.length; i++) {
                                                                                    if (+newRights[i].value===data.exec_params_in['right_id']) {
                                                                                      newRights.splice(i, 1);
                                                                                      refSelectRight.current.setState({options:newRights});
                                                                                      break;
                                                                                    }
                                                                                  }
                                                                                  thisV.getDropTableOne();
                                                                                   thisV.getDataSQL();
                                                                                },
                                                                                refLoading
                                                                              );
                                                               }
                                                             }
                                                         }});
                   }
                 }},
              ],
    //любые события внутри таблицы
    freeAction:[{event:'change',element:'input.usr_right_value',
                 function:(event,element,thisV) => {
                   let tek_td=$(element).closest('td'),
                       user_id=$(tek_td).closest('tr').find('td#FIO input').val(),
                       tableL=$(tek_td).closest('table'),
                       tek_td_offset_left=$(tek_td).offset().left,
                       right_id;
                   //высчитываем ячейку точно над текущей кликнутой, по индексу нельзя из-за наличия colspan
                   $(tableL).find('tr.tr_pok[id="RIGHTS_NAME"] td.td_pok').each(function(i,elem) {
                     if ($(elem).offset().left===tek_td_offset_left) {
                       right_id=$(elem).find('input').val();
                       return false;
                     }
                   });
                   if ((!!user_id) & (!!right_id)) {
                       let data={};
                       data.exec_params_in={};
                       if ($(element).prop('checked')) {
                           data.execsql=`INSERT INTO REP_USERS_RIGHTS (RUR_ID, USER_ID, RIGHT_ID)
                                              VALUES (REP_USERS_RIGHTS_ID_SQ.NEXTVAL, :user_id,:right_id)`;
                       }
                       else {
                           data.execsql=`DELETE FROM REP_USERS_RIGHTS
                                          WHERE USER_ID=:user_id AND RIGHT_ID=:right_id`;
                       }
                       data.exec_params_in['user_id']=+user_id;
                       data.exec_params_in['right_id']=+right_id;
                       getSQLRun2(data,
                                    function(response0) {
                                       console.log(response0.data);
                                    }
                                  );
                   }
                 }},
                 {event:'click',element:'td.td_pok[id="RIGHTS_NAME"]',
                  function:(event,element,thisV) => {
                    refTableOLAP.current.state.selectTd=[element];
                    $(element).siblings().filter('.checked').removeClass('checked');
                    $(element).addClass('checked');
                  }}],
    rowEvents: {onClick: (event,tr, thisV) => {
                 if ($(tr).is('.tr_tab')) {
                   refTableOLAP.current.state.selectRow=[tr];
                   $(tr).siblings().filter('.checked').removeClass('checked');
                   $(tr).addClass('checked');
                 }
               }},
  };

  return (
    <div className="App">
      <Loading ref={refLoading} />
      <AlertPlus ref={refAlertPlus}/>
      <ConfirmPlus ref={refConfirmPlus}/>
      <Container fluid>
        <Row>
          <Col>
            <MultiselectSQL ref={refSelectUser} obj={selectUserObj}/>
          </Col>
          <Col>
            <MultiselectSQL ref={refSelectRight} obj={ selectRightObj }/>
          </Col>
        </Row>
        <Row style={{marginTop:'1rem'}}>
          <Col>
            <TableOLAP ref={refTableOLAP} obj={tableOLAPObj}/>
            <WinModal ref={refWinModal}/>
          </Col>
        </Row>

      </Container>
    </div>
  );
}

export default Users;
