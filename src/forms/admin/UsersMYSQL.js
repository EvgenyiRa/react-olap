import React,{ useState,useRef } from 'react';

import Loading from '../../components/Loading';
import AlertPlus from '../../components/AlertPlus';
import ConfirmPlus from '../../components/ConfirmPlus';
import WinModal from '../../components/WinModal';
import TableOLAP from '../../components/TableOLAP';
import BootstrapInput from '../../components/BootstrapInput';
import MultiselectSQL from '../../components/MultiselectSQL';
import TableSQL from '../../components/TableSQL';
import Container from 'react-bootstrap/Container';
import paginationFactory from 'react-bootstrap-table2-paginator';
import CheckboxMUI from '../../components/CheckboxMUI';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import {getDBType,getSQLRun,getHashPwd} from '../../system.js';
import filterFactory, { textFilter } from 'react-bootstrap-table2-filter';
/*import { format,startOfMonth } from 'date-fns';*/

import $ from 'jquery';

function Users() {
  const dbType=getDBType();
  //хук для отслеживания изменения параметров компонетов (для упрощения взаимодействия компонентов)
  let [paramGroupV, setParamGroupV] = useState({rights:[],currentUser:-777});
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
        refInputRightSysName=useRef();

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
         thisV.state.selectRowFull=[];
         const newObj={...paramGroupV};
         $(tabUser).find('tr.checked').removeClass('checked');
         setParamGroupV(newObj);
     },
    rowEvents: {
      onClick: (e, row, rowIndex) => {
        //не устраивает работа selectRowProp-onSelect
        const tr=$(e.target).closest('tr'),
              newObj={...paramGroupV};
        if ($(tr).hasClass('checked')) {
           refTableSQL.current.state.selectRowFull=[];
           $(tr).removeClass('checked');
        }
        else {
          refTableSQL.current.state.selectRowFull=row;
          $(tabUser).find('tr.checked').removeClass('checked');
          $(tr).addClass('checked');
        }
        setParamGroupV(newObj);
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
            if (thisV.state.selectRowFull.length===0) {
                refAlertPlus.current.setState({show:true,text:'Необходимо кликом левой кнопки мыши по строке таблицы выбрать пользователя'});
            }
            else {
                refWinModal.current.setState(getWinModalUser('edit'));
            }
          },
    deleteRow:(thisV) => {
                if (thisV.state.selectRowFull.length===0) {
                    refAlertPlus.current.setState({show:true,text:'Необходимо кликом левой кнопки мыши по строке таблицы выбрать пользователя'});
                }
                else {
                    refConfirmPlus.current.setState({show:true,
                                                      text:'Вы действительно хотите удалить пользователя с логином "'+thisV.state.selectRowFull['LOGIN']+'"',
                                                      callback:(res) => {
                                                          if (res) {
                                                            let user_id=+thisV.state.selectRowFull['USER_ID'];
                                                            if (!!user_id) {
                                                                let data={};
                                                                data.sql=`DELETE FROM REP_USERS
                                                                           WHERE USER_ID=:user_id;
                                                                          DELETE FROM REP_USERS_RIGHTS
                                                                          WHERE USER_ID=:user_id;`;
                                                                data.params=[user_id];
                                                                getSQLRun(data,
                                                                             function(response0) {
                                                                                refAlertPlus.current.setState({show:true,text:'Выбранный пользователь успешно удалён'});
                                                                                thisV.getDataSQL();
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
          data.exec_params_in['user_id']=+refTableSQL.current.state.selectRowFull['USER_ID'];
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
                                       getSQLRun(data,
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
                          data.exec_params_in['password']=null;
                          data.execsql=`UPDATE REP_USERS
                                           SET FIO=:fio,
                                               LOGIN=:login,
                                               PASSWORD=NVL(:password,PASSWORD),
                                               EMAIL=:email,
                                               PHONE=:phone
                                         WHERE USER_ID=:user_id`;
                         function updUser() {
                           getSQLRun(data,
                                        function(response0) {
                                           //обновляем таблицу

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
    //получение объекта модального окна для работы с правами (добавление,редактирование)
    const getWinModalRights=(type) => {
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
            data.exec_params_in['right_id']=refTableRight.current.state.selectRowFull['RIGHTS_ID'];
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
                             getSQLRun(data,
                                          function(response0) {
                                             refTableRight.current.getRowsBySQL();
                                             refWinModalRigth.current.setState({modalShow:false});
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
                           getSQLRun(data,
                                        function(response0) {
                                           refTableRight.current.getRowsBySQL();
                                           refWinModalRigth.current.setState({modalShow:false});
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
    const tableSQLRightsObj={
       stateLoadObj:refLoading,
       tableContainerClass:'max-content',
       bodyClasses:'body_row_dblclick',
       tab_id:"tab2",
       paramGroup:paramGroupV,
       parParentID:['rights','userTab'],
       sql:`SELECT R.NAME,
                    R.SYSNAME,
                    R.RIGHTS_ID,
                    1 VALUE,
                    0 DISABLED
              FROM REP_RIGHTS R
              JOIN REP_USERS_RIGHTS UR
              ON R.RIGHTS_ID=UR.RIGHT_ID
              JOIN REP_USERS U
              ON UR.USER_ID=U.USER_ID
              WHERE U.USER_ID=:currentUser
              UNION ALL
              SELECT *
              FROM (SELECT R.NAME,
                           R.SYSNAME,
                            R.RIGHTS_ID,
                            0 VALUE,
                            1  DISABLED
                      FROM REP_USERS U
                      LEFT JOIN REP_RIGHTS R
                      ON 1=1
                      AND NOT EXISTS(SELECT 1
                                     FROM REP_USERS_RIGHTS UR
                                    WHERE UR.USER_ID=U.USER_ID
                                      AND UR.RIGHT_ID=R.RIGHTS_ID
                                  )
                    WHERE U.USER_ID=:currentUser
                  ) T
              WHERE T.NAME IS NOT NULL
              UNION ALL
              SELECT *
              FROM (SELECT R.NAME,
                           R.SYSNAME,
                            R.RIGHTS_ID,
                            0 VALUE,
                            CASE WHEN 'add'='`+type+`' THEN 0
                              ELSE 1
                            END DISABLED
                      FROM REP_RIGHTS R
                     WHERE :currentUser=-777
                  ) T
              WHERE T.NAME IS NOT NULL
              ORDER BY 1`,
       afterLoadData:(thisV)=>{
           thisV.state.selectRowFull=[];
           $(tabUser2).find('tr.checked').removeClass('checked');
       },
      rowEvents: {
        onClick: (e, row, rowIndex) => {
          //не устраивает работа selectRowProp-onSelect
          const el=$(e.target);
          if (!$(el).is('input[id^="checkRight-"]')) {
            const tr=$(el).closest('tr');
            if ($(tr).hasClass('checked')) {
               refTableRight.current.state.selectRowFull=[];
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
      columns:[{dataField:'NAME',text:'Наименование права',headerAttrs: (column, colIndex) => ({ 'width': `170px` })},
               {dataField:'SYSNAME',text:'Сис. наименование права',headerAttrs: (column, colIndex) => ({ 'width': `110px` })},
               {dataField:'VALUE',text:'Наличие',headerAttrs: (column, colIndex) => ({ 'width': `90px` }),
               formatter:(cell, row, rowIndex)=> {
                  if (+row['DISABLED']!==1) {
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
              }
            ],
      //действия панели таблицы
      addRow:(thisV) => {
                refWinModalRigth.current.setState(getWinModalRights('add'));
             },
      editRow:(thisV) => {
              if (thisV.state.selectRowFull.length===0) {
                  refAlertPlus.current.setState({show:true,text:'Необходимо кликом левой кнопки мыши по строке таблицы выбрать пользователя'});
              }
              else {
                  refWinModalRigth.current.setState(getWinModalRights('edit'));
              }
            },
      deleteRow:(thisV) => {
                  if (thisV.state.selectRowFull.length===0) {
                      refAlertPlus.current.setState({show:true,text:'Необходимо кликом левой кнопки мыши по строке таблицы выбрать право'});
                  }
                  else {
                      refConfirmPlus.current.setState({show:true,
                                                        text:'Вы действительно хотите удалить право с наименованием "'+thisV.state.selectRowFull['NAME']+'"',
                                                        callback:(res) => {
                                                            if (res) {
                                                              let right_id=+thisV.state.selectRowFull['RIGHTS_ID'];
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
                                                                  data.exec_params_in.right_id=right_id;
                                                                  getSQLRun(data,
                                                                               function(response0) {
                                                                                  refAlertPlus.current.setState({show:true,text:'Выбранный пользователь успешно удалён'});
                                                                                  thisV.getRowsBySQL();
                                                                               },
                                                                               refLoading
                                                                             );
                                                              }
                                                            }
                                                        }});
                  }
               },
       //paginationFactory:paginationFactory,
       //filterFactory:filterFactory,
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
            <MultiselectSQL obj={selectRightObj}/>
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
