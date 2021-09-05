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
import Checkbox from '@material-ui/core/Checkbox';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import {getDBType,getSQLRun} from '../../system.js';
import filterFactory, { textFilter } from 'react-bootstrap-table2-filter';
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
        refWinModal=useRef();

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
  columns:[{dataField:'FIO',text:'ФИО',headerAttrs: (column, colIndex) => ({ 'width': `150px` })},
           {dataField:'LOGIN',text:'Логин',headerAttrs: (column, colIndex) => ({ 'width': `110px` })},
           {dataField:'EMAIL',text:'E-mail',headerAttrs: (column, colIndex) => ({ 'width': `110px` })},
           {dataField:'PHONE',text:'Телефон',headerAttrs: (column, colIndex) => ({ 'width': `110px` })}
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
