import React,{ useState,useRef } from 'react';

import Loading from '../../components/Loading';
import AlertPlus from '../../components/AlertPlus';
import ConfirmPlus from '../../components/ConfirmPlus';
import WinModal from '../../components/WinModal';
import BootstrapInput from '../../components/BootstrapInput';
import MultiselectSQL from '../../components/MultiselectSQL';
import TableSQL from '../../components/TableSQL';
import Container from 'react-bootstrap/Container';
import paginationFactory from 'react-bootstrap-table2-paginator';
import filterFactory, { textFilter } from 'react-bootstrap-table2-filter';
import CheckboxMUI from '../../components/CheckboxMUI';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import {getDBType,getSQLRun,getSQLRun2,getHashPwd} from '../../system.js';
/*import { format,startOfMonth } from 'date-fns';*/

import $ from 'jquery';

function Users() {
  const dbType=getDBType();
  //хук для отслеживания изменения параметров компонетов (для упрощения взаимодействия компонентов)
  let [paramGroupV, setParamGroupV] = useState({rights:[]});
  //хук-ссылки на элементы для удобной работы с ними
  const refAlertPlus=useRef(),
        refConfirmPlus=useRef(),
        refLoading=useRef(),
        refTableSQL=useRef(),
        refWinModal=useRef(),
        refInputFIO=useRef(),
        refInputLogin=useRef(),
        refInputPwdVis=useRef(),
        refInputEmail=useRef(),
        refInputPhone=useRef(),
        refTableRight=useRef(),
        refWinModalRigth=useRef(),
        refInputRightName=useRef(),
        refInputRightSysName=useRef(),
        refMultiselectSQL=useRef();

  const tabUser='table#tab1 tbody';

  //объект для выпадающего списка с правами из БД
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

  //объект для таблицы с данными из БД
  const tableSQLObj={stateLoadObj:refLoading,
     tableContainerClass:'max-content',
     bodyClasses:'body_row_dblclick',
     tab_id:"tab1",
     paramGroup:paramGroupV,
     parParentID:['rights'],
     sql:`SELECT U.FIO,
                 U.USER_ID,
                 U.LOGIN,
                 U.SOL,
                 U.EMAIL,
                 U.PHONE
           FROM REP_USERS U
           WHERE U.USER_ID IN (SELECT RU.USER_ID
                                 FROM rep_users_rights RU
                                WHERE RU.RIGHT_ID IN (:rights) OR COALESCE(:rights,-777)=-777
                              )
           ORDER BY U.LOGIN`,
     afterLoadRows:(thisV)=>{
         thisV.state.selectRowFull=undefined;
         $(tabUser).find('tr.checked').removeClass('checked');
     },
    rowEvents: {
      onClick: (e, row, rowIndex) => {
        //не устраивает работа selectRowProp-onSelect
        const tr=$(e.target).closest('tr');
        if ($(tr).hasClass('checked')) {
           refTableSQL.current.state.selectRowFull=undefined;
           $(tr).removeClass('checked');
        }
        else {
          refTableSQL.current.state.selectRowFull=row;
          $(tabUser).find('tr.checked').removeClass('checked');
          $(tr).addClass('checked');
        }
      }
    },
    keyField:'USER_ID',
    columns:[{dataField:'FIO',text:'ФИО',headerAttrs: (column, colIndex) => ({ 'width': `150px` }),
              filter: textFilter({
                               delay: 1000,
                               placeholder: '...',
                             })},
             {dataField:'LOGIN',text:'Логин',headerAttrs: (column, colIndex) => ({ 'width': `110px` }),
              filter: textFilter({
                              delay: 1000,
                              placeholder: '...',
                            })},
             {dataField:'EMAIL',text:'E-mail',headerAttrs: (column, colIndex) => ({ 'width': `110px` }),
              filter: textFilter({
                              delay: 1000,
                              placeholder: '...',
                            })},
             {dataField:'PHONE',text:'Телефон',headerAttrs: (column, colIndex) => ({ 'width': `110px` }),
             filter: textFilter({
                      delay: 1000,
                      placeholder: '...',
                    })}
          ],
    //действия панели таблицы
    addRow:(thisV) => {
              refWinModal.current.setState(getWinModalUser('add'));
           },
    editRow:(thisV) => {
            if (!!!thisV.state.selectRowFull) {
                refAlertPlus.current.setState({show:true,text:'Необходимо кликом левой кнопки мыши по строке таблицы выбрать пользователя'});
            }
            else {
                refWinModal.current.setState(getWinModalUser('edit'));
            }
          },
    deleteRow:(thisV) => {
                if (!!!thisV.state.selectRowFull) {
                    refAlertPlus.current.setState({show:true,text:'Необходимо кликом левой кнопки мыши по строке таблицы выбрать пользователя'});
                }
                else {
                    refConfirmPlus.current.setState({show:true,
                                                      text:'Вы действительно хотите удалить пользователя с логином "'+thisV.state.selectRowFull['LOGIN']+'"',
                                                      callback:(res) => {
                                                          if (res) {
                                                            let user_id=+thisV.state.selectRowFull['USER_ID'];
                                                            if (!!user_id) {
                                                                let data={
                                                                  execsql:[
                                                                    {sql:`DELETE FROM REP_USERS
                                                                           WHERE USER_ID=?`,
                                                                     params:[user_id]
                                                                    },
                                                                    {sql:`DELETE FROM REP_USERS_RIGHTS
                                                                                WHERE USER_ID=?`,
                                                                     params:[user_id]}
                                                                  ]
                                                                }
                                                                getSQLRun2(data,
                                                                             function(response0) {
                                                                                refAlertPlus.current.setState({show:true,text:'Выбранный пользователь успешно удалён'});
                                                                                thisV.getRowsBySQL();
                                                                                //обновление строк таблицы
                                                                             },
                                                                             refLoading
                                                                           );
                                                            }
                                                          }
                                                      }});
                }
             },
     paginationFactory:paginationFactory,
     paginationOptions:{paginationSize: 7,
                         sizePerPageList: [{
                             text: '10', value: 10
                           }, {
                             text: '50', value: 50
                           }, {
                             text: '100', value:100
                           }, {
                             text: '500', value:500
                           }]
                       },
     componentDidMount:(thisV)=>{
         thisV.getRowsBySQL();
     },
     filterFactory:filterFactory
    };

  //получение объекта модального окна для работы с пользователями и их правами (добавление,редактирование)
  const getWinModalUser=(type) => {
    const tabUser2='table#tab2 tbody';
    const handleButtonNextL=() => {
      let data={};
      data.params=[refInputFIO.current.state.value.trim(),refInputLogin.current.state.value]
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
        data1.params=[data.params[0]];
        //let resp_data;
        data1.sql=`SELECT COUNT(1) COUNT
                    FROM REP_USERS
                   WHERE login=?`;
        if (type==='edit') {
          data1.params.push(+refTableSQL.current.state.selectRowFull['USER_ID']);
          data1.sql+=` AND USER_ID!=?`;
        }
        getSQLRun(data1,(response1)=> {
                  if (response1.data[0].COUNT>0) {
                      refInputLogin.current.setState({isInvalid:true,invalidText:'Уже существует, введите другое значение'});
                  }
                  else {
                    data.params.push((!!!refInputEmail.current.state.value)?null:refInputEmail.current.state.value.trim());
                    data.params.push((!!!refInputPhone.current.state.value)?null:refInputPhone.current.state.value.trim());
                    const setSQLright=(dataTrueIn)=>{
                      refTableRight.current.state.rows.forEach((item, i) => {
                         if (item.VALUE===1) {
                             dataTrueIn.execsql.push({
                                 params:[item.RIGHTS_ID],
                                 sql:`INSERT INTO REP_USERS_RIGHTS (USER_ID, RIGHT_ID)
                                           VALUES (@user_id,?)`
                             });
                         }
                      });
                    }
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
                          data.sql=`INSERT INTO REP_USERS (FIO, LOGIN, EMAIL, PHONE, PASSWORD, SOL)
                                        VALUES (?, ?, ?, ?, ?, ?)`;
                          getHashPwd(data0,
                                     function(response) {
                                       data.params.push(response.hash);
                                       data.params.push(response.sol);
                                       const dataTrue={
                                          execsql:[
                                            data,
                                            {sql:`SET @user_id = LAST_INSERT_ID()`}
                                          ]
                                       };
                                       setSQLright(dataTrue);
                                       getSQLRun2(dataTrue,
                                          function(response0) {
                                              refTableSQL.current.getRowsBySQL();
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
                          //пароль
                          let pwdIndex=data.params.push(null)-1;
                          data.sql=`UPDATE REP_USERS
                                       SET FIO=?,
                                           LOGIN=?,
                                           EMAIL=?,
                                           PHONE=?,
                                           PASSWORD=COALESCE(?,PASSWORD)
                                     WHERE USER_ID=@user_id`;
                          function updUser() {
                           const dataTrue={
                              execsql:[
                                  {sql:`SET @user_id = ?`,params:[+refTableSQL.current.state.selectRowFull['USER_ID']]},
                                  data,
                                  {sql:`DELETE FROM REP_USERS_RIGHTS WHERE USER_ID=@user_id`},
                              ]
                           };
                           setSQLright(dataTrue);
                           getSQLRun2(dataTrue,
                                        function(response0) {
                                          refTableSQL.current.getRowsBySQL();
                                          refWinModal.current.setState({
                                              modalShow:false,
                                              header:'',
                                              nextButtonLabel:'Далее',
                                              handleButtonNext:undefined,
                                              body:null
                                          });
                                          //refSelectUser.current.getDataSQL();
                                        },
                                        refLoading
                                      );
                         }
                          if (!!refInputPwdVis.current.state.value) {
                            data0.sol=refTableSQL.current.state.selectRowFull['SOL'];
                            getHashPwd(data0,
                                       function(response) {
                                         data.params[pwdIndex]=response.hash;
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
    //получение объекта модального окна для работы с правами (добавление,редактирование)
    const getWinModalRights=(type) => {
      $('div.fade.modal.show:first').hide();
      const handleButtonNextL=() => {
        let data={};
        data.params=[];
        data.params.push(refInputRightName.current.state.value);
        data.params.push(refInputRightSysName.current.state.value);
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
          data1.params=[refInputRightSysName.current.state.value];
          //let resp_data;
          data1.sql=`SELECT COUNT(1) COUNT
                       FROM REP_RIGHTS
                      WHERE SYSNAME=?`;
          if (type==='edit') {
            data.params.push(refTableRight.current.state.selectRowFull['RIGHTS_ID']);
            data1.params.push(refTableRight.current.state.selectRowFull['RIGHTS_ID']);
            data1.sql+=` AND RIGHTS_ID!=?`;
          }
          getSQLRun(data1,(response1)=> {
                    if (response1.data[0].COUNT>0) {
                        refInputRightSysName.current.setState({isInvalid:true,invalidText:'Уже существует, введите другое значение'});
                    }
                    else {
                      if (type==='add') {
                          if (!prErr) {
                             data.sql=`INSERT INTO REP_RIGHTS (NAME, SYSNAME) VALUES (?, ?)`;
                             const dataTrue={execsql:[data]};
                             let data2={sql:`SELECT LAST_INSERT_ID() RIGHT_ID_V`};
                             dataTrue.execsql.push(data2);
                             getSQLRun2(dataTrue,
                                          function(response0) {
                                             refTableRight.current.getRowsBySQL();
                                             $('div.fade.modal.show:first').show();
                                             //добавляем новое право в фильтр по правам
                                             const newOption=[...refMultiselectSQL.current.state.options];
                                             newOption.push({value:response0.result[1][0][0]['RIGHT_ID_V'],label:refInputRightName.current.state.value});
                                             refMultiselectSQL.current.setState({options:newOption});
                                             refWinModalRigth.current.setModalShow(false);
                                          },
                                          refLoading
                                        );
                          }
                      }
                      else if (type==='edit') {
                        if (!prErr) {
                          data.sql=`UPDATE REP_RIGHTS
                                       SET NAME=?, SYSNAME=?
                                     WHERE RIGHTS_ID=?`;
                           getSQLRun(data,
                                        function(response0) {
                                           refTableRight.current.getRowsBySQL();
                                           $('div.fade.modal.show:first').show();
                                           refWinModalRigth.current.setModalShow(false);
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
      return {
          modalShow:true,
          header:(type==='add')?'Добавление права':'Редактирование права',
          nextButtonLabel:(type==='add')?'Добавить':'Изменить',
          handleButtonNext:handleButtonNextL,
          handleButtonCancel:(thisV)=>{
            thisV.setModalShow(false);
            $('div.fade.modal.show:first').show();
          },
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
                          defaultValue:(type==='edit')?refTableRight.current.state.selectRowFull['NAME']:null
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
                          defaultValue:(type==='edit')?refTableRight.current.state.selectRowFull['SYSNAME']:null
                        }}
                      />
                    </Col>
                  </Row>
                </Container>
      }
    }
    //объект для таблицы с данными из БД
    let currentUser;
    if ((!!refTableSQL.current.state.selectRowFull) & (type==='edit')) {
        currentUser=refTableSQL.current.state.selectRowFull['USER_ID']
    }
    else {
        currentUser='-777'
    };
    const tableSQLRightsObj={
       stateLoadObj:refLoading,
       tableContainerClass:'max-content',
       bodyClasses:'body_row_dblclick',
       tab_id:"tab2",
       sql:`SELECT R.NAME,
                    R.SYSNAME,
                    R.RIGHTS_ID,
                    1 VALUE
              FROM REP_RIGHTS R
              JOIN REP_USERS_RIGHTS UR
              ON R.RIGHTS_ID=UR.RIGHT_ID
              JOIN REP_USERS U
              ON UR.USER_ID=U.USER_ID
              WHERE U.USER_ID=`+currentUser+`
              UNION ALL
              SELECT *
              FROM (SELECT R.NAME,
                           R.SYSNAME,
                            R.RIGHTS_ID,
                            0 VALUE
                      FROM REP_USERS U
                      LEFT JOIN REP_RIGHTS R
                      ON 1=1
                      AND NOT EXISTS(SELECT 1
                                     FROM REP_USERS_RIGHTS UR
                                    WHERE UR.USER_ID=U.USER_ID
                                      AND UR.RIGHT_ID=R.RIGHTS_ID
                                  )
                    WHERE U.USER_ID=`+currentUser+`
                  ) T
              WHERE T.NAME IS NOT NULL
              UNION ALL
              SELECT *
              FROM (SELECT R.NAME,
                           R.SYSNAME,
                            R.RIGHTS_ID,
                            0 VALUE
                      FROM REP_RIGHTS R
                     WHERE `+currentUser+`=-777
                  ) T
              WHERE T.NAME IS NOT NULL
              ORDER BY 1`,
       afterLoadData:(thisV)=>{
           thisV.state.selectRowFull=undefined;
           $(tabUser2).find('tr.checked').removeClass('checked');
       },
      rowEvents: {
        onClick: (e, row, rowIndex) => {
          //не устраивает работа selectRowProp-onSelect
          const el=$(e.target);
          if (!$(el).is('input[id^="checkRight-"]')) {
            const tr=$(el).closest('tr');
            if ($(tr).hasClass('checked')) {
               refTableRight.current.state.selectRowFull=undefined;
               $(tr).removeClass('checked');
            }
            else {
              refTableRight.current.state.selectRowFull=row;
              $(tabUser2).find('tr.checked').removeClass('checked');
              $(tr).addClass('checked');
            }
          }
        }
      },
      keyField:'RIGHTS_ID',
      columns:[{dataField:'NAME',text:'Наименование права',headerAttrs: (column, colIndex) => ({ 'width': `170px` }),
                filter: textFilter({
                  delay: 1000,
                  placeholder: '...',
                })},
               {dataField:'SYSNAME',text:'Сис. наименование права',headerAttrs: (column, colIndex) => ({ 'width': `110px` }),
                filter: textFilter({
                  delay: 1000,
                  placeholder: '...',
                })},
               {dataField:'VALUE',text:'Наличие',headerAttrs: (column, colIndex) => ({ 'width': `90px` }),
               formatter:(cell, row, rowIndex)=> {
                  return (
                      <CheckboxMUI obj={{
                          beginChecked:+cell===1,
                          onChange:(e,thisV)=> {
                              refTableRight.current.state.rows[rowIndex]['VALUE']=(e.target.checked)?1:0;
                              thisV.setState({checked:e.target.checked})
                          }
                        }}
                      />
                  );
                }
              }
            ],
      //действия панели таблицы
      addRow:(thisV) => {
                refWinModalRigth.current.setState(getWinModalRights('add'));
             },
      editRow:(thisV) => {
              if (!!!thisV.state.selectRowFull) {
                  refAlertPlus.current.setState({show:true,text:'Необходимо кликом левой кнопки мыши по строке таблицы выбрать право'});
              }
              else {
                  refWinModalRigth.current.setState(getWinModalRights('edit'));
              }
            },
      deleteRow:(thisV) => {
                  if (!!!thisV.state.selectRowFull) {
                      refAlertPlus.current.setState({show:true,text:'Необходимо кликом левой кнопки мыши по строке таблицы выбрать право'});
                  }
                  else {
                      refConfirmPlus.current.setState({
                        show:true,
                        text:'Вы действительно хотите удалить право с наименованием "'+thisV.state.selectRowFull['NAME']+'"',
                        callback:(res) => {
                            if (res) {
                              let right_id=+thisV.state.selectRowFull['RIGHTS_ID'];
                              if (!!right_id) {
                                  let data={
                                    execsql:[
                                      {sql:`DELETE FROM REP_USERS_RIGHTS
                                            WHERE RIGHT_ID=?`,
                                       params:[right_id]
                                      },
                                      {sql:`DELETE FROM REP_RIGHTS
                                             WHERE RIGHTS_ID=?`,
                                       params:[right_id]
                                      }
                                    ]
                                  }
                                  getSQLRun2(data,
                                     function(response0) {
                                        refAlertPlus.current.setState({show:true,text:'Выбранное право успешно удалёно'});
                                        thisV.getRowsBySQL();
                                        //удаляем пользователя из фильтра прав
                                        const newOption=[...refMultiselectSQL.current.state.options];
                                        for (var i = 0; i < newOption.length; i++) {
                                          if (newOption[i].value==right_id) {
                                            newOption.splice(i, 1);
                                            break;
                                          }
                                        }
                                        refMultiselectSQL.current.setState({options:newOption});
                                     },
                                     refLoading
                                   );
                              }
                            }
                      }});
                  }
               },
       //paginationFactory:paginationFactory,
      filterFactory:filterFactory,
      componentDidMount:(thisV)=>{
          thisV.getRowsBySQL();
      }
    };
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
                            let valueL=String(event.target.value);
                            if (thisV.state.isInvalid) {
                              if (valueL!=='') {
                                  thisV.setState({isInvalid:false});
                              }
                            }
                            thisV.setState({value:valueL});
                        },
                        defaultValue:(type==='edit')?refTableSQL.current.state.selectRowFull['FIO']:null
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
                        defaultValue:(type==='edit')?refTableSQL.current.state.selectRowFull['LOGIN']:null
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
                        defaultValue:(type==='edit')?refTableSQL.current.state.selectRowFull['EMAIL']:null
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
                        defaultValue:(type==='edit')?refTableSQL.current.state.selectRowFull['PHONE']:null
                      }}
                    />
                  </Col>
                </Row>
                <Row style={{marginTop:'1rem'}}>
                  <Col>
                    <TableSQL
                      ref={refTableRight}
                      obj={tableSQLRightsObj}
                    />
                    <WinModal ref={refWinModalRigth}/>
                  </Col>
                </Row>
              </Container>
    }
  }

  return (
    <div className="App">
      <Loading ref={refLoading} />
      <AlertPlus ref={refAlertPlus}/>
      <ConfirmPlus ref={refConfirmPlus}/>
      <Container fluid>
        <Row>
          <Col>
            <MultiselectSQL ref={refMultiselectSQL} obj={selectRightObj}/>
          </Col>
        </Row>
        <Row style={{marginTop:'1rem'}}>
          <Col>
            <TableSQL ref={refTableSQL} obj={ tableSQLObj }/>
            <WinModal ref={refWinModal}/>
          </Col>
        </Row>

      </Container>
    </div>
  );
}

export default Users;
