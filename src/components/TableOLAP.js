import React from 'react';
import AlertPlus from './AlertPlus';
import {getParamForSQL,getParamDiff,secondstotime,getTableOLAP,getCursorPosition,getSQLRun2,houreLifeCookies,getSQLRun,getTagExit,getDBType} from '../system.js';

import $ from 'jquery'

class TableOLAP extends React.Component {
    constructor(props) {
        super(props);
        this.getDataSQL = this.getDataSQL.bind(this);
        //события Drag and Drop
        this.dragStart = this.dragStart.bind(this);
        this.dragEnter = this.dragEnter.bind(this);
        this.dragOver = this.dragOver.bind(this);
        this.dragDrop = this.dragDrop.bind(this);
        this.getDropTable=this.getDropTable.bind(this);
        this.getDropTableOne=this.getDropTableOne.bind(this);
        this.getDropTableAll=this.getDropTableAll.bind(this);
        //cобытие вызова 3Д-графика
        this.getGraf = this.getGraf.bind(this);
        this.getStrgrouping = this.getStrgrouping.bind(this);
        this.state = {
          items: '',
          itemsStrgrouping:undefined,
          $itemsStrgrouping:undefined,
          $itemsStrgroupingBeg:undefined,
          selectRow:[],
          selectTd:[],
          tabname:undefined,
          countall:undefined,
          data:this.props.obj.data,
          strgrouping:(!!this.props.obj.strgrouping)?this.props.obj.strgrouping:{apply:false},
          itogAll:(!!this.props.obj.itogAll)?this.props.obj.itogAll:{apply:false},
          prRun:false
        };

        //переменная отображения графика
        this.graf=false;
        if (typeof this.props.obj.graf==='boolean') {
            this.graf=this.props.obj.graf
        }

        //Cоздаем панель действий если есть подходящие элементы
        this.panel=$(document.createDocumentFragment());
        let thisV=this;
        if ((!!thisV.props.obj.addRow) || (!!thisV.props.obj.deleteRow) || (!!thisV.props.obj.dopAction) || (!!thisV.props.obj.editRow) || (thisV.graf)){
          let b_tab=this.panel;
          $(b_tab).prepend('<ul class="ul_cons top-level" style="margin:0.3em 0 0.3em 0;padding: 0;">');
          var ul_v=$(b_tab).find('ul.ul_cons.top-level');
          if (!!thisV.props.obj.addRow) {
              $(ul_v).append(`<li id="`+thisV.props.obj.id+`" class="li_cons li_cons_top tableDBaddRow" style="background: none;">
                                  <a id="`+thisV.props.obj.id+`" title="Добавить строку" class="tableDBaddRow">
                                      <img src="`+require('../img/add.png')+`" style="height:1.8em;width:auto;">
                                  </a>
                              </li>`);
          }
          if (!!thisV.props.obj.editRow) {
              $(ul_v).append(`<li id="`+thisV.props.obj.id+`" class="li_cons li_cons_top tableDBeditRow" style="background: none;">
                                  <a id="`+thisV.props.obj.id+`" title="Редактировать строку" class="tableDBeditRow">
                                      <img src="`+require('../img/edit.png')+`" style="height:1.8em;width:auto;">
                                  </a>
                              </li>`);
          }
          if (!!thisV.props.obj.deleteRow) {
              $(ul_v).append(`<li id="`+thisV.props.obj.id+`" class="li_cons li_cons_top tableDBdeleteRow" style="background: none;">
                                  <a id="`+thisV.props.obj.id+`" title="Удалить строку" class="tableDBdeleteRow">
                                      <img src="`+require('../img/rep_del.png')+`" style="height:1.8em;width:auto;">
                                  </a>
                              </li>`);
          }
          if (!!thisV.props.obj.dopAction) {
              $(ul_v).append(`<li id="`+thisV.props.obj.id+`" class="li_cons li_cons_top tableDBdopActionBlok" style="background: none;">
                                <img src="`+require('../img/actions.png')+`" style="height:1.8em;width:auto;" title="Доп.действия">
                                <ul class="tableDBdopAction ul_cons second-level"></ul>
                              </li>`);

              var ul_sl=$(ul_v).find('ul.tableDBdopAction.ul_cons.second-level');
              thisV.props.obj.dopAction.forEach((item) => {
                $(ul_sl).append(`<li class="li_cons tableDBdopAction" id="`+item.id+`">
                                    <a id="`+item.id+`">`+item.label+`</a>
                                 </li>`);
              })
          }
          //график
          if (thisV.graf) {
              $(ul_v).append(`<li id="`+thisV.props.obj.id+`" class="li_cons li_cons_top table_graf" style="background: none;">
                                  <a id="`+thisV.props.obj.id+`" title="Построить 3D-график" class="tableDBaddRow">
                                      <img src="`+require('../img/graf_tab.png')+`" style="height:2.1em;width:auto;margin:0 0 0.3em 0;">
                                  </a>
                              </li>`);
          }
        }

        this.pr_tableDBdopAction_vis=false;
        this.ul_oda=undefined;
        /*this.panelScroll=() => {
          if (this.pr_tableDBdopAction_vis) {
            var li_v=$(this.ul_oda).closest('li'),
                this_top=$(li_v).offset().top+30,
                this_left=$(li_v).offset().left+3;
            $(this.ul_oda).css({'left':this_left+'px','top':this_top+'px'});
          }
        }*/

       //создаем список незадействованных полей
       this.getUlTabPol=() => {
         let res='<div style="position:relative">'+
                      '<a class="TabOLAPPol" id="'+props.obj.id+'" draggable="true">Поля&#9660;</a>'+
                      '<ul class="tableOLAP dbl-border" id="'+props.obj.id+'">';
         if (this.state.data.tab_pol.length>0) {
           this.state.data.tab_pol.forEach((item) => {
             res+='<li id="'+item.SYSNAME+'" draggable="true" class="tab_pol liTableOLAP"><a id="'+item.SYSNAME+'">'+item.NAME+'</a></li>';
           });
         }
         else {
            res+='<li id="null"><a>Отсутствуют</a></li>';
         }
         res+='</ul></div>';
         return res;
      }

      thisV.prPanelMove=false;

      this.refAlertPlus=React.createRef();
    }

    getGraf() {
      const newWin = window.open('/three/graf.html', '3D-график OLAP-куба');
      let itemsClone=$(this.state.items).clone();
      if (!!this.props.obj.grafFilter) {
          itemsClone=this.props.obj.grafFilter(itemsClone,this.state.$itemsStrgrouping,this.state.$itemsStrgroupingBeg);
      }
      newWin.tableHtml=itemsClone;
    }

    getStrgrouping() {
      const thisV=this;
      if ((thisV.state.strgrouping.apply) || (thisV.state.itogAll.apply)) {
          if (typeof thisV.state.strgrouping.wrap!=='boolean') {
              thisV.state.strgrouping.wrap=true;
          }
          //объединяем повторяющиеся строки, добавляем атрибуты для анимации сворачивания строк, считаем итоги и подытоги, да, все в одном цикле, производительность!
          //test
          let tbodyL=$(this.state.items),
              //b_tab=$(".divForTableOLAP[id='"+thisV.props.obj.id+"']"), //test
              //tbodyL=$(b_tab).find('table.tableOLAP tbody'),
              tabTr=$(tbodyL).find('tr.tr_tab');
          //текущая сохраненная строка
          let tekTr=$(tabTr).first();
          //объект для сравнения
          let tabTrFirstTd=$(tekTr).find('td.td_str_val');
          //первый подытог: необходимо для опции сворачивания/группировки
          let firstSubItogID;
          if (thisV.state.strgrouping.wrap) {
            for (var i = 0; i < tabTrFirstTd.length; i++) {
              if (!!thisV.state.strgrouping.onSubItog[tabTrFirstTd[i].id]) {
                  firstSubItogID=tabTrFirstTd[i].id;
                  break;
              }
            }
          }
          //запоминаем координаты по оси x, чтобы корректно отслеживать смену наименований
          let tabTrFirstTdMass=[];
          $(tabTrFirstTd).each(function(i,elem) {
              tabTrFirstTdMass.push(elem);
          });
          //формируем строку для нахождения ID у ячейки без id (такие ячейки возникают на строне бэкенда при заполнении пустот)
          const indexRow=[];
          $(tekTr).prev().find('td.td_val_name').each(function(i,elem) {
            indexRow[i]=elem.id;
          });
          function initOneSubItog(trInit) {
            const res=[];
            $(trInit).find('td.td_val_val').each(function(i,elem) {
               let resultInit=$(elem).text().trim();
               if (resultInit==='') {
                  resultInit=0;
               }
               else {
                  resultInit=parseFloat(resultInit.replace(',','.'));
                  if (isNaN(resultInit)) {
                      resultInit=0;
                  }
               }
               res.push({valID:indexRow[i],value:resultInit});
            });
            return res;
          }
          //заготовка для подытоговых и итоговой строк
          const trItogBlank=$(tekTr).clone();
          $(trItogBlank).find('td').each(function(i,elem) {
              $(elem).html('');
          });
          //устанавливаем ID, т.к. могут встречаться ячейки с неустановленным ID (возникают на стороне бэкенда при заполнении пустот)
          $(trItogBlank).find('td.td_val_val').each(function(i,elem) {
            $(elem).attr('id',indexRow[i]);
          });
          if (thisV.state.strgrouping.apply) {
            if (!!thisV.state.strgrouping.onSubItog) {
              //инициализируем подсчет подытогов
              //формируем заготовки для подытоговых строк
              for (let propIn in thisV.state.strgrouping.onSubItog) {
                thisV.state.strgrouping.onSubItog[propIn].res=initOneSubItog(tekTr);
                thisV.state.strgrouping.onSubItog[propIn].count=1;
                const trItogBlankOne=$(trItogBlank).clone();
                let prBeforeIDTd=true,
                    colspanTrTek=0;
                $(trItogBlankOne).find('td.td_str_val').each(function(i,elem) {
                    if (prBeforeIDTd) {
                      if (elem.id!==propIn) {
                        $(elem).attr('colspan',++colspanTrTek);
                        $(elem).remove();
                      }
                      else {
                          prBeforeIDTd=false;
                          colspanTrTek=1;
                      }
                    }
                    else {
                      $(elem).prev().attr('colspan',++colspanTrTek)
                      $(elem).remove();
                    }
                });
                $(trItogBlankOne).attr('pritog','').attr('itogid',propIn);
                thisV.state.strgrouping.onSubItog[propIn].itogBlankInit=trItogBlankOne;
              };
            }
          }
          const resItogAll={itogBlank:$(trItogBlank).clone().attr('pritog',''),res:[],count:0};
          if (thisV.state.itogAll.apply) {
              //подготавливаем шаблон
              const tdStrVal=$(resItogAll.itogBlank).find('td.td_str_val'),
                    tekTdItog=$(tdStrVal).first();
              $(tekTdItog).attr('colspan',tdStrVal.length);
              for (var ir = (tdStrVal.length-1); ir >0; ir--) {
                $(tdStrVal[ir]).remove();
              }

              //инициализируем подсчет общих итогов
              $(tekTr).find('td.td_val_val').each(function(i,elem) {
                 let resultInit=$(elem).text().trim();
                 if (resultInit==='') {
                    resultInit=0;
                 }
                 else {
                    resultInit=parseFloat(resultInit.replace(',','.'));
                    if (isNaN(resultInit)) {
                        resultInit=0;
                    }
                 }
                 resItogAll.res.push({valID:indexRow[i],value:resultInit});
                 resItogAll.count=1;
              });
          }

          let nameRowspan;
          if (thisV.state.strgrouping.wrap) {
            nameRowspan='rowspancalc';
          }
          else {
              nameRowspan='rowspan';
          }
          function calcSubItogOne(i3,itogID,tr,prLast,prevEl) {
            //вычисление одного подытога
            const thisItog=thisV.state.strgrouping.onSubItog[itogID];
            function calcSubItogDefault(itogID,thisItog) {
              //заполняем заготовку
              const itogBlank=$(thisItog.itogBlank);
              const tekTdItog=$(itogBlank).find('td.td_str_val[id="'+itogID+'"]');
              let styleC=getComputedStyle(tekTdItog[0]);
              $(tekTdItog).html((!!thisV.state.strgrouping.onSubItog[itogID].label)?thisV.state.strgrouping.onSubItog[itogID].label:'Подытог')
                          .css({'font-size':String(parseFloat(styleC.fontSize)+1)+'px','font-weight':800});
              const tekTdValItog=$(itogBlank).find('td.td_val_val');
              styleC=getComputedStyle($(tekTdValItog).first()[0]);
              const styleTdValC={'font-size':String(parseFloat(styleC.fontSize)+1)+'px','font-weight':800};
              if (!!thisV.state.strgrouping.onSubItog[itogID].format) {
                $(itogBlank).find('td.td_val_val').each(function(i,elem) {
                  $(elem).html(thisV.state.strgrouping.onSubItog[itogID].format(thisItog.res[i].value));
                  $(elem).css(styleTdValC);
                });
              }
              else {
                $(itogBlank).find('td.td_val_val').each(function(i,elem) {
                  $(elem).html(thisItog.res[i].value);
                  $(elem).css(styleTdValC);
                });
              }
              return itogBlank;
            }

            thisItog.itogBlank=$(thisItog.itogBlankInit).clone();
            let itogBlankCalc;
            if (!!thisItog.callback) {
              itogBlankCalc=thisItog.callback(itogID,thisItog,thisV);
            }
            else {
              //действия по-умолчанию для подытоговой строки
              itogBlankCalc=calcSubItogDefault(itogID,thisItog);
            }

            //
            let trPrev;
            if (!prLast) {
              trPrev=$(tr).prev();
            }
            else {
              trPrev=$(tr);
            }
            $(trPrev).after(itogBlankCalc);
            if (thisV.state.strgrouping.wrap) {
                const trNext=$(trPrev).next();
                $(trNext).hide();
                if (firstSubItogID===itogID) {
                  //при первой отрисовке необходимо отображать подытоги только для первого элемента из массива подытогов
                  const tekTr=$(prevEl).closest('tr'),
                        tekTrIndex=$(tekTr).index();
                  //thisV.setOneGroupe(itogID,tekTr,0,itogID,prevEl); не подходит, слишком много отличий,
                  //плюс здесь можно использовать более производительный алгоритм засчет tabTrFirstTdMass

                  $(tekTr).show();

                  //необходимо запомнить текущие подходящие ячейки, если они находятся на одной строке с обрабатываемой в текущий момент,
                  //т.к. при перереисовке ячейки поменяются и станут не актуальными, надо будет актуализировать
                  const tabTrFirstTdMassNew={};
                  tabTrFirstTdMass.forEach((item7,i7) => {
                      if ($(item7).closest('tr').index()===tekTrIndex) {
                          tabTrFirstTdMassNew[i7]=item7;
                      }
                  });


                  if ($(trNext).length>0) {
                    const trPrevClone=$(tekTr).clone(),
                          trPrevCloneTd=$(trPrevClone).find('td.td_str_val'),
                          endPrepend=$(tekTr).find('td.td_str_val[id="'+itogID+'"]').index();
                    $(tekTr).html(trNext[0].innerHTML);
                    let tekTrTdStrVal=$(tekTr).find('td.td_str_val');
                    $(tekTrTdStrVal).filter('#'+itogID)
                                    .html('<a class="unwrapTrOLAP" id="'+itogID+'" title="Развернуть/детализировать">&#9658;</a>'+$(trPrevCloneTd).filter('#'+itogID)[0].innerHTML)
                                    .attr('colspan',(tabTrFirstTdMass.length-i3));
                    for (var j = (endPrepend-1); j >=0; j--) {
                      $(tekTr).prepend($(trPrevCloneTd[j]).clone());
                    }
                    $(trNext).html(trPrevClone[0].innerHTML);
                    //восстанавливаем актуальные ячейки
                    tekTrTdStrVal=$(tekTr).find('td.td_str_val');
                    for (var prop in tabTrFirstTdMassNew) {
                        tabTrFirstTdMass[prop]=$(tekTrTdStrVal).filter('#'+tabTrFirstTdMassNew[prop].id)[0];
                    }
                  }

                  //необходимо всем идущим до этого объединениям, лежащим не на текущей строке, увеличить rowspan на единицу
                  for (var i4 = (i3-1); i4>=0; i4--) {
                    if (!!!tabTrFirstTdMassNew[i4]) {
                      let dopRowspan;
                      dopRowspan=+$(tabTrFirstTdMass[i4]).attr('rowspan');
                      if (isNaN(dopRowspan)) {
                          dopRowspan=1;
                      }
                      $(tabTrFirstTdMass[i4]).attr('rowspan',++dopRowspan);
                    }
                  }

                }
            }

            thisItog.res=initOneSubItog(tr);
            thisV.state.strgrouping.onSubItog[itogID]=thisItog;

            //необходимо всем идущим до этого объединениям увеличить rowspan на единицу, если сворачиваем, то просто считает на спец.атрибуте
            for (let i4 = (i3-1); i4>=0; i4--) {
              let dopRowspan;
              dopRowspan=+$(tabTrFirstTdMass[i4]).attr(nameRowspan);
              if (isNaN(dopRowspan)) {
                  dopRowspan=1;
              }
              $(tabTrFirstTdMass[i4]).attr(nameRowspan,++dopRowspan);
            }
          }

          $(tabTr).filter(':not(:first)').each(function(i,elem) {
              if (!!!$(elem).attr('pritog')) {
                if (thisV.state.itogAll.apply) {
                  ++resItogAll.count;
                  $(elem).find('td.td_val_val').each(function(i4,elem4) {
                      const tdID=indexRow[i4];
                      let resOne=$(elem4).text().trim();
                      if (resOne==='') {
                          resOne=0;
                      }
                      else {
                        resOne=parseFloat(resOne.replace(',','.'));
                        if (isNaN(resOne)) {
                            resOne=0;
                        }
                      }

                      let prExistCalc=false;
                      if (!!thisV.state.itogAll.onCalc) {
                        if (!!thisV.state.itogAll.onCalc[tdID]) {
                          if (!!thisV.state.itogAll.onCalc[tdID].callback) {
                             prExistCalc=true;
                             resOne=thisV.state.itogAll.onCalc[tdID].callback(resItogAll.res[i4].value,resOne);
                          }
                        }
                      }
                      if (!prExistCalc) {
                          //по-молчанию суммируем
                          if (!!resItogAll.res[i4]) {
                            resOne=resOne+resItogAll.res[i4].value;
                          }
                      }
                      if (!!resItogAll.res[i4]) {
                        resItogAll.res[i4].value=resOne;
                      }
                  });
                }
                if (thisV.state.strgrouping.apply) {
                  const tdStrVal=$(elem).find('td.td_str_val');
                  //считаем в обратном порядке для корректности алгоритма (правильное проставление rowspan у строк)
                  for (var i2 = (tdStrVal.length-1); i2>=0 ; i2--) {
                    const elem2=tdStrVal[i2];
                    if (elem2.parentNode!==null) {
                        const elem3=tabTrFirstTdMass[i2],
                              i3=i2;
                        if ($(elem3).text().trim()===$(elem2).text().trim()) {
                            if (thisV.state.strgrouping.wrap) {
                                $(elem).hide();
                            }

                            let prSubItog=false;
                            if (!!thisV.state.strgrouping.onSubItog) {
                                if (!!thisV.state.strgrouping.onSubItog[elem3.id]) {
                                  prSubItog=true;
                                }
                            }

                            let prOk=true;
                            //проверяем происходит ли смена строк для столбцов рангами выше
                            for (var i4 = i3-1; i4>=0 ; i4--) {
                              const elem4=tdStrVal[i4];
                              if (elem4.parentNode!==null) {
                                const elem5=tabTrFirstTdMass[i4];
                                if ($(elem4).text().trim()!==$(elem5).text().trim()) {
                                  prOk=false;
                                  if (!prSubItog) {
                                    //актуализируем элементы сравнения, если это не подытог (для этого случая обработка ниже)
                                    tabTrFirstTdMass[i3]=elem2;
                                  }
                                  break;
                                }
                              }
                            }

                            if (prOk) {
                              //если не происходит, то наращиваеем rowspan
                              let prevRowspan=+$(elem3).attr(nameRowspan);
                              if (isNaN(prevRowspan)) {
                                  prevRowspan=1;
                              }
                              $(elem3).attr(nameRowspan,(++prevRowspan));
                              $(elem2).remove();
                            }

                            if (prSubItog) {
                                ++thisV.state.strgrouping.onSubItog[elem3.id].count;
                                $(elem).find('td.td_val_val').each(function(i4,elem4) {
                                    const tdID=indexRow[i4];
                                    let resOne=$(elem4).text().trim();
                                    if (resOne==='') {
                                        resOne=0;
                                    }
                                    else {
                                      resOne=parseFloat(resOne.replace(',','.'));
                                      if (isNaN(resOne)) {
                                          resOne=0;
                                      }
                                    }

                                    let prExistCalc=false;
                                    if (!!thisV.state.strgrouping.onCalc) {
                                      if (!!thisV.state.strgrouping.onCalc[tdID]) {
                                        if (!!thisV.state.strgrouping.onCalc[tdID].callback) {
                                           prExistCalc=true;
                                           resOne=thisV.state.strgrouping.onCalc[tdID].callback(thisV.state.strgrouping.onSubItog[elem3.id].res[i4].value,resOne);
                                        }
                                      }
                                    }
                                    if (!prExistCalc) {
                                        //по-молчанию суммируем
                                        resOne=resOne+thisV.state.strgrouping.onSubItog[elem3.id].res[i4].value;
                                    }
                                    thisV.state.strgrouping.onSubItog[elem3.id].res[i4].value=resOne;
                                })
                            }

                            if ((!prOk) & (prSubItog)) {
                              //если текущий столбец подытоговый, а выше по рангу произошла смена строки, то выводим подытог
                              const prevEl=tabTrFirstTdMass[i3];
                              tabTrFirstTdMass[i3]=elem2;
                              calcSubItogOne(i3,elem2.id,elem,false,prevEl);
                            }
                        }
                        else {
                            const prevEl=tabTrFirstTdMass[i3];
                            tabTrFirstTdMass[i3]=elem2;
                            if (!!thisV.state.strgrouping.onSubItog) {
                              //действия с подытогами
                              if (!!thisV.state.strgrouping.onSubItog[elem2.id]) {
                                  calcSubItogOne(i3,elem2.id,elem,false,prevEl);
                              }
                            }
                        }
                    }
                };
                }
              }
          });
          let tabTrLast;
          if (thisV.state.strgrouping.apply) {
            //необходимо обработать последние подытоги
            if (!!thisV.state.strgrouping.onSubItog) {
              tabTrLast=$(tabTr).last();
              if ($(tabTrLast).length>0) {
                const tabTrFirstTd=$(tabTr).first().prev().find('td.td_str_name');
                for (var i3 = (tabTrFirstTd.length-1); i3>=0 ; i3--) {
                  const idC=tabTrFirstTd[i3].id;
                  if (!!thisV.state.strgrouping.onSubItog[idC]) {
                      calcSubItogOne(i3,idC,tabTrLast[0],true,tabTrFirstTdMass[i3]);
                      tabTrLast=$(tabTrLast).next();
                  }
                }
              }
            }
          }
          if ((!!!thisV.state.strgrouping.onSubItog) || (!thisV.state.strgrouping.apply)) {
              tabTrLast=$(tabTr).last();
          }
          if (thisV.state.itogAll.apply) {
              //выводим общий итог
              //console.log('resItogAll',resItogAll);
              if (!!thisV.state.itogAll.onItogAll) {
                  thisV.state.itogAll.onItogAll(resItogAll,tabTrLast,thisV)
              }
              else {
                const thisItog=resItogAll,
                      itogBlank=thisItog.itogBlank,
                      tdStrVal=$(itogBlank).find('td.td_str_val'),
                      tekTdItog=$(tdStrVal).first();
                let styleC;
                if (typeof tekTdItog[0]!=='undefined') {
                  styleC=getComputedStyle(tekTdItog[0]);
                  $(tekTdItog).html('Итог')
                              .css({'font-size':String(parseFloat(styleC.fontSize)+2)+'px','font-weight':800});
                }
                const tekTdValItog=$(itogBlank).find('td.td_val_val');
                if (typeof $(tekTdValItog).first()[0]!=='undefined') {
                  styleC=getComputedStyle($(tekTdValItog).first()[0]);
                  const styleTdValC={'font-size':String(parseFloat(styleC.fontSize)+2)+'px','font-weight':800};
                  if (!!thisV.state.itogAll.format) {
                    $(itogBlank).find('td.td_val_val').each(function(i,elem) {
                      $(elem).html(thisV.state.itogAll.format(thisItog.res[i].value));
                      $(elem).css(styleTdValC);
                    });
                  }
                  else {
                    $(itogBlank).find('td.td_val_val').each(function(i,elem) {
                      $(elem).html(thisItog.res[i].value);
                      $(elem).css(styleTdValC);
                    });
                  }
                }
                $(tabTrLast).after(itogBlank);
              }
              console.log('Всего строк ',resItogAll.count);
          }
          if (typeof tbodyL!=='undefined') {
            if (typeof tbodyL[0]!=='undefined') {
              thisV.setState({itemsStrgrouping:tbodyL[0].outerHTML,$itemsStrgrouping:tbodyL,$itemsStrgroupingBeg:$(tbodyL).clone()});
            }
          }
      }
    }

    dragStart(ev) {
       ev.originalEvent.dataTransfer.effectAllowed='move';
       if ($(ev.target).is('a.TabOLAPPol')) {
          ev.originalEvent.dataTransfer.setData("Text", 'nodrag');
          return false;
       }
       else if ($(ev.target).is('div.td_pok_name')) {
          ev.originalEvent.dataTransfer.setData("Text", 'nodrag');
          return false;
       }
       else if (($(ev.target).is('a.tab_sort_up')) || ($(ev.target).is('a.tab_sort_unup')) || ($(ev.target).is('img'))) {
          ev.originalEvent.dataTransfer.setData("Text", 'nodrag');
          return false;
       }
       else {
         ev.originalEvent.dataTransfer.setData("Text", ev.target.getAttribute('id'));
         return true;
       }
       ev.originalEvent.dataTransfer.setDragImage(ev.target,10,10);
       console.log('dragStart');
    }

    dragEnter(ev) {
      //console.log('dragEnter');
       ev.preventDefault();
       return true;
    }

    dragOver(ev) {
      //console.log('dragOver');
    	ev.preventDefault();
    }

    dragDrop(ev) {
      if (this.state.prRun) {
          //блокируем перетаскивание во время запроса данных
          return false;
      }
      const thisV=this;
      //пришедший ID
      const idIn=String(ev.originalEvent.dataTransfer.getData("Text"));
      if ((idIn==='nodrag') || (ev.originalEvent.dataTransfer.effectAllowed!=='move')) {
        return false;
      }
      //ячейки шапки таблицы
      const b_tab=$(".divForTableOLAP[id='"+thisV.props.obj.id+"']"),
            tabHeadTd=$(b_tab).find('td.td_pok_name,td.td_str_name,td.td_val_name');
      //определяем пришедший элемент
      let elIn=$(tabHeadTd).filter('[id="'+idIn+'"]:first');
      if ($(elIn).length===0) {
        //значит это несипользуемые поля
        elIn=$(b_tab).find('div.TabOLAPPol li.tab_pol[id="'+idIn+'"]');
      }
      //console.log(elIn);
      //текущий элемент
      let elOut=$(ev.target);
      if ((!$(elOut).is('a.TabOLAPPol')) & (!$(elOut).is('div.td_pok_name')) & ((!$(elOut).is('td')))) {
          elOut=$(elOut).closest('td');
      }
      const idOut=String($(elOut).attr('id'));
      //меняем OLAP-структуру в соответсвии с изменениями
      const dataNew={...this.state.data};

      //признак что можно делать переносы между категориями(осями:показатели/строки/значения показателей)
      let prOk=true;

      if (idIn===idOut) {
          return;
      }

      //переменная для запоминания положения в массиве(используется для корректного перемещения)
      let elInIndex,elInCat;
      function delIn(type) {
        elInCat=type;
        if ((dataNew[type].length>1) || (type==='tab_pol') || (type==='tab_pok')) {
          //удаляем из места объекта где находился, только если таких значений больше одного (чтобы строилось корректно и не делать доп.функционал+надежность)
          for (var i = 0; i < dataNew[type].length; i++) {
            if (dataNew[type][i].SYSNAME===idIn) {
              elInIndex=i;
              dataNew[type].splice(i,1)
              break;
            }
          }
        }
        else {
            thisV.refAlertPlus.current.setState({show:true,text:'Запрещается перемещение из категории, где находится менее двух элементов отображения'});
            prOk=false;
        }
      }
      if ($(elIn).hasClass('td_pok_name')) {
          delIn('tab_pok');
      }
      else if ($(elIn).hasClass('td_str_name')) {
          delIn('tab_str');
      }
      else if ($(elIn).hasClass('td_val_name')) {
          delIn('tab_val');
      }
      else if ($(elIn).hasClass('tab_pol')) {
          delIn('tab_pol');
      }

      function addOut(type) {
          //добавляем туда, куда отправили
          const newEl={"SYSNAME":idIn,"NAME":$(elIn).text().trim()}
          if ((type!=='tab_pol') & (type!=='tab_pok')) {
            for (var i = 0; i < dataNew[type].length; i++) {
              if (dataNew[type][i].SYSNAME===idOut) {
                if (type==='tab_val') {
                    newEl.AGGR="MAX";
                }
                if ((elInIndex<=i) & (type===elInCat)) {
                  dataNew[type].splice(i+1,0,newEl);
                }
                else {
                  dataNew[type].splice(i,0,newEl);
                }
                break;
              }
            }
          }
          else {
              if (!!!dataNew[type]) {
                  dataNew[type]=[];
              }
              dataNew[type].push(newEl);
          }
      }

      if (prOk) {
        if ($(elOut).hasClass('td_pok_name')) {
            addOut('tab_pok');
        }
        else if ($(elOut).hasClass('td_str_name')) {
            addOut('tab_str');
        }
        else if ($(elOut).hasClass('td_val_name')) {
            addOut('tab_val');
        }
        else if (($(elOut).is('a.TabOLAPPol')) || ($(elOut).find('a.TabOLAPPol').lenght>0)) {
            addOut('tab_pol');
        }

        //сохраняем без изменения состояния, производительность
        this.state.data=dataNew;
        this.getDataSQL();
      }
    }

    getDataSQL() {
      if (!this.state.prRun) {
        //не допускаем повторного запуска не дождавшись окончания предыдущего
        const data=this.state.data;
        data.tab_id= this.props.obj.id;
        let thisV=this;
        if (!!this.props.obj.stateLoadObj) {
            this.props.obj.stateLoadObj.current.handleShow();
        }

        //подготавливаем SQL согласно возможным существующим параметрам
        const dataCalc = {};
        dataCalc.params={};
        //let resp_data;
        if (!!this.props.obj.data.params_val) {
            data.params=this.props.obj.data.params_val;
        }
        dataCalc.sql=this.props.obj.data.sql_true;
        getParamForSQL(this.props.obj.paramGroup,this.props.obj.parParentID,dataCalc);

        //забираем полученный SQL и параметры
        data.sql_true=dataCalc.sql;
        data.params_val=dataCalc.params;

        //console.log(parSQL);
        if (!!this.props.obj.beforeLoadData) {
            this.props.obj.beforeLoadData(this,data);
        }
        if (!((!!this.props.obj.beforeLoadData) && (typeof data.error === 'boolean'))) {
          const dataIn={data:data};
          if (!!this.state.tabname) {
              dataIn.tabname=this.state.tabname;
              dataIn.countall=this.state.countall;
          }
          const time00 = performance.now();
          thisV.setState({prRun:true});
          getTableOLAP(dataIn,(response)=> {
                          console.log(response);
                          const data=response;
                          const time01 = performance.now();
                          console.log('Время получения данных '+secondstotime(time01,time00));
                          if (!!thisV.props.obj.stateLoadObj) {
                              if (thisV.props.obj.stateLoadObj.current!==null) {
                                thisV.props.obj.stateLoadObj.current.handleHide();
                              }
                          }

                          let b_tab=$(".divForTableOLAP[id='"+thisV.props.obj.id+"']");
                          data.tab_html=$(data.tab_html);
                          let b_tab_null=$(data.tab_html).find("tr.tr_pok.null td.null");
                          thisV.prPanelMove=false;
                          if ((!!thisV.props.obj.addRow) || (!!thisV.props.obj.deleteRow) || (!!thisV.props.obj.dopAction) || (!!thisV.props.obj.editRow) || (thisV.graf)) {
                              //перемещаем панель действий в подходящее место, если есть подходищие условия
                              if ($(b_tab_null).length>0) {
                                let tabOLAPPanelAction=$(b_tab).find('div.TabOLAPPanelAction');
                                if ($(tabOLAPPanelAction).length>0) {
                                  thisV.prPanelMove=true;
                                  $(tabOLAPPanelAction).remove();
                                  $(b_tab_null).append('<div class="TabOLAPPanelAction">'+thisV.panel[0].childNodes[0].innerHTML+'</div>')
                                               .append('<div class="TabOLAPPol">'+thisV.getUlTabPol()+'</div>');
                                }
                              }
                          }
                          else {
                            $(b_tab).find('div.TabOLAPPol').remove();
                            if (+data.countall>0) {
                              const tabOLAPPol='<div class="TabOLAPPol">'+thisV.getUlTabPol()+'</div>';
                              if ($(b_tab_null).length>0) {
                                  thisV.prPanelMove=true;
                                  $(b_tab_null).append(tabOLAPPol);
                              }
                            }
                          }
                          const newObj={items:data.tab_html[0].outerHTML,
                                          itemsStrgrouping:undefined,
                                          $itemsStrgrouping:undefined,
                                          $itemsStrgroupingBeg:undefined,
                                          tabname:data.tabname,
                                          countall:data.countall},
                                dbtype=getDBType();
                          if (dbtype==='mssql') {
                            if (+data.countall===0) {
                                //для MSSQL не создается таблица если нет строк
                                newObj.tabname=undefined;
                            }
                          }
                          thisV.setState(newObj);
                          if (!!thisV.props.obj.beforeGrouping) {
                              thisV.props.obj.beforeGrouping(thisV);
                          }
                          thisV.getStrgrouping();
                          if (!!thisV.props.obj.afterGrouping) {
                              thisV.props.obj.afterGrouping(thisV);
                          }
                          const time02 = performance.now();
                          console.log('Время обработки данных '+secondstotime(time02,time01));
                          console.log('Общее время '+secondstotime(time02,time00));

                          if (!!thisV.props.obj.afterLoadData) {
                              thisV.props.obj.afterLoadData(thisV,data);
                          }
                          thisV.setState({prRun:false});
                        },
                   this.props.obj.stateLoadObj
                 );


        }
      }
    }


    componentDidMount() {
        //this.getDropTableAll();
        if (!!!this.props.obj.parParentID) {
            this.getDataSQL();
        }

        //любые действия внутри таблицы
        let thisV=this;
        if (!!this.props.obj.freeAction) {
          this.props.obj.freeAction.forEach((item) => {
            $("div#root").on(item.event, "table.tableOLAP[id='"+this.props.obj.id+"'] "+item.element, function(event) {
                  item.function(event,this,thisV);
            });
          });
        }

        //события Drug and Drop
        $("div#root").on('dragstart', "table.tableOLAP[id='"+this.props.obj.id+"'] tbody tr td.td_pok_name,"+
                                      "table.tableOLAP[id='"+this.props.obj.id+"'] tbody tr td.td_str_name,"+
                                      "table.tableOLAP[id='"+this.props.obj.id+"'] tbody tr td.td_val_name,"+
                                      "a.TabOLAPPol[id='"+this.props.obj.id+"'],"+
                                      "ul.tableOLAP[id='"+this.props.obj.id+"'] li.liTableOLAP", this.dragStart);
        $("div#root").on('dragenter', "table.tableOLAP[id='"+this.props.obj.id+"'] tbody tr td.td_pok_name,"+
                                      "table.tableOLAP[id='"+this.props.obj.id+"'] tbody tr td.td_str_name,"+
                                      "table.tableOLAP[id='"+this.props.obj.id+"'] tbody tr td.td_val_name,"+
                                      "a.TabOLAPPol[id='"+this.props.obj.id+"'],"+
                                      "ul.tableOLAP[id='"+this.props.obj.id+"'] li.liTableOLAP,"+
                                      "div.divTableOLAP.td_pok_name[id='"+this.props.obj.id+"']", this.dragEnter);
        $("div#root").on('dragover', "table.tableOLAP[id='"+this.props.obj.id+"'] tbody tr td.td_pok_name,"+
                                      "table.tableOLAP[id='"+this.props.obj.id+"'] tbody tr td.td_str_name,"+
                                      "table.tableOLAP[id='"+this.props.obj.id+"'] tbody tr td.td_val_name,"+
                                      "a.TabOLAPPol[id='"+this.props.obj.id+"'],"+
                                      "ul.tableOLAP[id='"+this.props.obj.id+"'] li.liTableOLAP,"+
                                      "div.divTableOLAP.td_pok_name[id='"+this.props.obj.id+"']", this.dragOver);
        $("div#root").on('drop', "table.tableOLAP[id='"+this.props.obj.id+"'] tbody tr td.td_pok_name,"+
                                      "table.tableOLAP[id='"+this.props.obj.id+"'] tbody tr td.td_str_name,"+
                                      "table.tableOLAP[id='"+this.props.obj.id+"'] tbody tr td.td_val_name,"+
                                      "a.TabOLAPPol[id='"+this.props.obj.id+"'],"+
                                      "div.divTableOLAP.td_pok_name[id='"+this.props.obj.id+"']", this.dragDrop);
        $("div#root").on('click', "a.TabOLAPPol[id='"+this.props.obj.id+"']",function() {
            const elNext=$(this).next();
            if ($(elNext).is(':visible')) {
                $(elNext).hide();
            }
            else {
                $(elNext).show();
            }
        });

        //события контекстного меню
        $("div#root").on('contextmenu', "table.tableOLAP[id='"+this.props.obj.id+"'] tbody tr td.td_val_name",function(e) {
          if (thisV.state.prRun) {
              //блокируем во время запроса данных
              return false;
          }
          e.preventDefault();
          //определяем текущее значение
          const idC=$(this).attr('id');
          let tekAggr;
          for (var i = 0; i < thisV.state.data.tab_val.length; i++) {
            if (thisV.state.data.tab_val[i].SYSNAME===idC) {
              tekAggr=thisV.state.data.tab_val[i].AGGR;
              break;
            }
          }
          const posCursor=getCursorPosition(e);
          const b_tab=$(".divForTableOLAP[id='"+thisV.props.obj.id+"']");
          $(b_tab).find('div.divContextMenu')
                  .css({left:posCursor.x,top:posCursor.y})
                  .attr('idTabVal',idC)
                  .html('<p class="label">Вариант агригирования:</p>'+
                           '<p><input name="aggr" type="radio" id="MAX" value="MAX" '+((tekAggr==="MAX")?"checked":"")+' style="margin-right:1rem;"><label for="MAX">Максимум</label></p>'+
                            '<p><input name="aggr" type="radio" id="MIN" value="MIN" '+((tekAggr==="MIN")?"checked":"")+' style="margin-right:1rem;"><label for="MIN">Минимум</label></p>'+
                            '<p><input name="aggr" type="radio" id="SUM" value="SUM" '+((tekAggr==="SUM")?"checked":"")+' style="margin-right:1rem;"><label for="SUM">Сумма</label></p>'+
                            '<p><input name="aggr" type="radio" id="AVG" value="AVG" '+((tekAggr==="AVG")?"checked":"")+' style="margin-right:1rem;"><label for="AVG">Среднее значение</label></p>'+
                            '<p><input name="aggr" type="radio" id="COUNT" value="COUNT" '+((tekAggr==="COUNT")?"checked":"")+' style="margin-right:1rem;"><label for="COUNT">Количество</label></p>')
                  .show();
        });
        $("div#root").on('change', ".divForTableOLAP[id='"+thisV.props.obj.id+"'] div.divContextMenu input[name='aggr']",function(e) {
          const contextMenu=$(this).closest('div.divContextMenu'),
                idC=$(contextMenu).attr('idTabVal');
          for (var i = 0; i < thisV.state.data.tab_val.length; i++) {
            if (thisV.state.data.tab_val[i].SYSNAME===idC) {
              thisV.state.data.tab_val[i].AGGR=$(this).val();
              $(contextMenu).hide();
              thisV.getDataSQL();
              break;
            }
          }
        })

        //сортировка строк по клику
        $("div#root").on('click', "table.tableOLAP[id='"+this.props.obj.id+"'] tbody tr td a.tab_sort_up",function() {
          let olap_tab_id=thisV.props.obj.id;
          let table_tag=$(this).closest("table.tableOLAP[id='"+olap_tab_id+"']");
          //действия проводим на таблицей из состояния после загрузки, т.к. могла измениться засчет схлопывания строк
          $(table_tag).html(thisV.state.items);
          let index_col=$(this).closest('td').index();
          let tr_tab=$(table_tag).find('.tr_tab');

          let sort_tab=$(tr_tab).sort(function(a, b) { // сортируем
              var tek_str_a=$(a).find('td:eq('+index_col+')').text().replace(',',".");
              var tek_str_b=$(b).find('td:eq('+index_col+')').text().replace(',',".");
              var tek_num_a=parseFloat(tek_str_a);
              var tek_num_b=parseFloat(tek_str_b);
              if ((isNaN(tek_num_a)) || (isNaN(tek_num_b))) {
                  return tek_str_a.localeCompare(tek_str_b);
              }
              else {
                  return  tek_num_a - tek_num_b;
              }
          });
          $(tr_tab).remove();
          $(table_tag).find('tbody').append(sort_tab);
        });
        //сортировка строк по клику
        $("div#root").on('click', "table.tableOLAP[id='"+this.props.obj.id+"'] tbody tr td a.tab_sort_unup",function() {
          let olap_tab_id=thisV.props.obj.id;
          let table_tag=$(this).closest("table.tableOLAP[id='"+olap_tab_id+"']");
          //действия проводим на таблицей из состояния после загрузки, т.к. могла измениться засчет схлопывания строк
          $(table_tag).html(thisV.state.items);
          let index_col=$(this).closest('td').index();
          let tr_tab=$(table_tag).find('.tr_tab');

          let sort_tab=$(tr_tab).sort(function(a, b) { // сортируем
              var tek_str_a=$(a).find('td:eq('+index_col+')').text().replace(',',".");
              var tek_str_b=$(b).find('td:eq('+index_col+')').text().replace(',',".");
              var tek_num_a=parseFloat(tek_str_a);
              var tek_num_b=parseFloat(tek_str_b);
              if ((isNaN(tek_num_a)) || (isNaN(tek_num_b))) {
                  return tek_str_b.localeCompare(tek_str_a);
              }
              else {
                  return  tek_num_b - tek_num_a;
              }
          });
          $(tr_tab).remove();
          $(table_tag).find('tbody').append(sort_tab);
        });

        if ((!!thisV.props.obj.addRow) || (!!thisV.props.obj.deleteRow) || (!!thisV.props.obj.dopAction) || (!!thisV.props.obj.editRow) || (this.graf)) {
            //события панели
            if (!!thisV.props.obj.addRow) {
              $("div#root").on('click', ".divForTableOLAP[id='"+thisV.props.obj.id+"'] li.tableDBaddRow",function() {
                  thisV.props.obj.addRow(thisV)
              })
            }
            if (!!thisV.props.obj.editRow) {
                $("div#root").on('click', ".divForTableOLAP[id='"+thisV.props.obj.id+"'] li.tableDBeditRow",function() {
                    thisV.props.obj.editRow(thisV);
                });
            }
            if (!!thisV.props.obj.deleteRow) {
                $("div#root").on('click', ".divForTableOLAP[id='"+thisV.props.obj.id+"'] li.tableDBdeleteRow",function() {
                  thisV.props.obj.deleteRow(thisV);
                });
            }
            if (!!thisV.props.obj.dopAction) {
                $("div#root").on('click', ".divForTableOLAP[id='"+thisV.props.obj.id+"'] li.tableDBdopActionBlok",function() {
                    thisV.ul_oda=$(this).find('ul.tableDBdopAction');
                    if (!$(thisV.ul_oda).is(':visible')) {
                        $(thisV.ul_oda).show();
                        /*var this_top=$(this).offset().top+30,
                            this_left=$(this).offset().left+3;
                        $(thisV.ul_oda).css({'left':this_left+'px','top':this_top+'px'});*/
                        thisV.pr_tableDBdopAction_vis=true;
                    }
                    else {
                        $(thisV.ul_oda).hide();
                        thisV.pr_tableDBdopAction_vis=false;
                    }
                });

                //$('main').bind('scroll', thisV.panelScroll);

                thisV.props.obj.dopAction.forEach((item) => {
                  $("div#root").on('click', ".divForTableOLAP[id='"+thisV.props.obj.id+"'] ul.tableDBdopAction.ul_cons.second-level li.tableDBdopAction[id='"+item.id+"']",function() {
                      item.callback(thisV);
                  });
                })
            }

            //кнопка графика
            if (this.graf) {
              $("div#root").on('click', ".divForTableOLAP[id='"+thisV.props.obj.id+"'] li.table_graf",this.getGraf);
            }
        }

        //событие разворачивания свернутых/сгруппированых строк
        $("div#root").on('click', "table.tableOLAP[id='"+this.props.obj.id+"'] tbody tr td a.unwrapTrOLAP",function() {
          const time00 = performance.now();
          const tabTr=thisV.state.$itemsStrgrouping,
                //tabTr=$("table.tableOLAP[id='"+thisV.props.obj.id+"'] tbody"),
                thisID=this.id,
                tdStrName=$(tabTr).find('tr.tr_name_col td.td_str_name');
          //номер текущей группировки
          let i0;
          for (i0 = 0; i0 < tdStrName.length; i0++) {
            let tekID=tdStrName[i0].id;
            if ((!!thisV.state.strgrouping.onSubItog[tekID]) & (tekID===thisID)) {
                break;
            }
          }
          //ищем ближайшую группировку
          let idNext;
          let i;
          for (i = (i0+1); i < tdStrName.length; i++) {
            let tekID=tdStrName[i].id;
            if ((!!thisV.state.strgrouping.onSubItog[tekID]) & (tekID!==thisID)) {
                idNext=tekID;
                break;
            }
          }

          /*let tekTd=$(this).closest('td');
          const tekTrOld=$(tekTd).closest('tr');*/
          const tekTdTrue=$(this).closest('td'),
                tekTrOldTrue=$(tekTdTrue).closest('tr');
          //необходимо найти ячейку и строку в виртуальном DOM
          const tekTrOld=$(tabTr).find('tr:eq('+$(tekTrOldTrue).index()+')');
          let tekTd=$(tekTrOld).find('td:eq('+$(tekTdTrue).index()+')');
          let tekTr=tekTrOld;

          //считаем кол-во развернутых строк
          let countUnwrap=0;

          const tekTrNewIndex=$(tekTrOld).index();
          let maxRight;
          if (!!idNext) {
              maxRight=-1;
          }
          else {
              maxRight=tdStrName.length-1;
          }

          function incRowspanAbove(iFunc,tekTrNew) {
            //необходимо всем идущим до этого объединениям увеличить rowspan на единицу
            for (var i4 = (iFunc-1); i4>=0; i4--) {
              let prevTrTd;
              if (!!!tdRowspanAbove[tdStrName[i4].id]) {
                  let prevTr,
                      maxIndex=0;
                  if (i4>i0)  {
                      maxIndex=tekTrNewIndex;
                  }
                  //в случае наличия следующей группировки может передаваться строка с этой группировкой, поэтому запоминаем индекс на основе пришедшей строки
                  const  tekTrNewNextIndex=$(tekTrNew).index();
                  prevTr=$(tekTr);
                  prevTrTd=$(prevTr).find('td.td_str_val[id="'+tdStrName[i4].id+'"]');
                  //ищем ближайшую подходящую строку
                  while (($(prevTrTd).length===0) || ($(prevTr).is('[pritog]'))) {
                    prevTr=$(prevTr).prev();
                    const prevTrIndex=$(prevTr).index();
                    if (($(prevTr).length===0) || (maxIndex>prevTrIndex)) {
                      break;
                    }
                    else {
                      prevTrTd=$(prevTr).find('td.td_str_val[id="'+tdStrName[i4].id+'"]');
                    }
                  }
                  if ($(prevTrTd).length>0) {
                    const prevTrTdIndex=$(prevTr).index();
                    if (prevTrTdIndex!==tekTrNewNextIndex) {
                      if ((i4>i0) & (i4<maxRight)) {
                        let dopRowspan=+$(prevTrTd).attr('rowspancalc');
                        if (isNaN(dopRowspan)) {
                            dopRowspan=+$(prevTrTd).attr('rowspan');
                            if (isNaN(dopRowspan)) {
                              dopRowspan=1;
                            }
                            $(prevTrTd).attr('rowspan',++dopRowspan);
                        }
                        else {
                            $(prevTrTd).attr('rowspan',dopRowspan);
                        }

                      }
                      else {
                        let dopRowspan=+$(prevTrTd).attr('rowspan');
                        if (isNaN(dopRowspan)) {
                            dopRowspan=1;
                        }
                        $(prevTrTd).attr('rowspan',++dopRowspan);
                      }
                    }
                  }
              }
              else {
                prevTrTd=$(tdRowspanAbove[tdStrName[i4].id]);
                let dopRowspan=+$(prevTrTd).attr('rowspan');
                if (isNaN(dopRowspan)) {
                    dopRowspan=1;
                }
                $(prevTrTd).attr('rowspan',++dopRowspan);
              }
            }
          }

          //функция создания одной группировки
          function setOneGroupe(thisID,tekTrNew,begI2,idNext,prDopInc) {
            if (!!idNext) {
              if (typeof prDopInc!=='boolean') {
                  prDopInc=false;
              }
              const tdStrValTrue=$(tekTrNew).find('td.td_str_val'),
                    tdStrValNextIndex=$(tdStrValTrue).filter('#'+idNext).index(),
                    tdStrValTrueLength=$(tdStrValTrue).length;
              let tdStrVal=$(tdStrValTrue).clone();
              let firstTd;
              //ищем id первого подытога, чтобы понять что делать со строкой
              for (var i2 = begI2; i2 < tdStrName.length; i2++) {
                if (!!thisV.state.strgrouping.onSubItog[tdStrName[i2].id]) {
                  firstTd=$(tdStrVal).filter('#'+tdStrName[i2].id).clone()[0];
                  break;
                }
              }
              if (!!firstTd) {
                if (firstTd.id===idNext) {
                  //ищем ближайший подытог для найденного ID подытога, чтобы корректно отобразить группировку
                  let tekTrNext=$(tekTrNew).next();
                  while (!$(tekTrNext).is('[pritog][itogid="'+idNext+'"]')) {
                      tekTrNext=$(tekTrNext).next();
                  }
                  if ($(tekTrNext).length>0) {
                    const trPrevClone=$(tekTrNew).clone();
                    $(tekTrNew).html(tekTrNext[0].innerHTML);
                    const firstTdNew=$(tekTrNew).find('td.td_str_val[id="'+idNext+'"]:first'),
                          endPrepend=tdStrValTrueLength-tdStrValNextIndex;
                    $(firstTdNew).html('<a class="unwrapTrOLAP" id="'+idNext+'" title="Развернуть/детализировать">&#9658;</a>'+firstTd.innerHTML)
                                 .attr('colspan',endPrepend);
                    for (var j = 0; j < (tdStrValTrueLength-endPrepend); j++) {
                      $(firstTdNew).before($(tdStrVal[j]).clone());
                    }
                    if (prDopInc) {
                      $(tekTrNew).show();
                      ++countUnwrap;

                      //
                      incRowspanAbove(i,tekTrNew);

                    }
                    $(tekTrNext).html(trPrevClone[0].innerHTML);
                  }
                }
              }
            }
          }

          //находим строку подытогов и или воостанавливаем ячейки на этой строке либо формируем следующий подытог
          //иначе не сможем корректно обработать строку следующую за первой строкой
          while ($(tekTr).length>0) {
              tekTr=$(tekTr).next();
              if ($(tekTr).is('[pritog][itogid="'+thisID+'"]')) {
                break;
              }
          }
          if ($(tekTr).length>0) {
            const tekTrClone=$(tekTrOld).clone(),
                  tekTrCloneTdStrVal=$(tekTrClone).find('td.td_str_val');
            $(tekTrOld).html(tekTr[0].innerHTML);
            //восстанавливаем rowspan
            const tekTrOldTd=$(tekTrOld).find('td.td_str_val');
            $(tekTrOldTd).each(function(i5,elem5) {
                //необходимо в строке группировки всем ячейкам между текущим подытогом и максимальной ячейкой (в случае отсутствия следующего подытога: в этом случае maxRight равно -1) взять вычисленный
                //rowspan, т.к. в момент пересчета rowspan эти ячейки были недоступны и в принципе не нуждались в пересчете
                //смотрим принадлежность к таким ячейкам
                let prI6=false;
                for (var i6 = (i0+1); i6 < maxRight; i6++) {
                  if (tdStrName[i6].id===elem5.id) {
                    prI6=true;
                    break;
                  }
                }
                if (!prI6) {
                  let dopRowspan=+$(tekTrCloneTdStrVal).filter('#'+elem5.id).attr('rowspan');
                  if (!isNaN(dopRowspan)) {
                    $(elem5).attr('rowspan',dopRowspan);
                  }
                }
                else {
                  let dopRowspan=+$(elem5).attr('rowspancalc');
                  if (!isNaN(dopRowspan)) {
                      $(elem5).attr('rowspan',dopRowspan);
                  }
                  else {
                      const tekTrCloneTdStrValOne=$(tekTrCloneTdStrVal).filter('#'+elem5.id);
                      dopRowspan=$(tekTrCloneTdStrValOne).attr('rowspan');
                      if (!isNaN(dopRowspan)) {
                          $(elem5).attr('rowspan',dopRowspan);
                      }
                  }
                }
              });

            const tekTrOldTdThisID=$(tekTrOldTd).filter('#'+thisID);
            if ($(tekTrOldTdThisID).find('a.wrapTrOLAP').length===0) {
              $(tekTrOldTdThisID).prepend('<a class="wrapTrOLAP" id="'+thisID+'" title="Свернуть/сгруппировать">&#9660;</a>');
            }

            $(tekTr).html(tekTrClone[0].innerHTML)
                    .find('td.td_str_val[id="'+thisID+'"]').first()
                    .html((!!thisV.state.strgrouping.onSubItog[thisID].label)?thisV.state.strgrouping.onSubItog[thisID].label:'Подытог')
                    .attr('rowspan',1);
            $(tekTr).show();
            ++countUnwrap;
            //необходимо всем идущим до этого объединениям увеличить rowspan на единицу и удалить лишние ячейки в подытогах
            for (var i4 = (i0-1); i4>=0; i4--) {
              $(tekTr).find('td.td_str_val[id="'+tdStrName[i4].id+'"]').remove();
              let prevTr=$(tekTr).prev(),
                  prevTrTd=$(prevTr).find('td.td_str_val[id="'+tdStrName[i4].id+'"]');
              //ищем ближашую подходящую строку
              while (($(prevTrTd).length===0) || ($(prevTr).is('[pritog]'))) {
                prevTr=$(prevTr).prev();
                if ($(prevTr).length>0) {
                  prevTrTd=$(prevTr).find('td.td_str_val[id="'+tdStrName[i4].id+'"]');
                }
                else {
                  break;
                }
              }
              if ($(prevTrTd).length>0) {
                //if ($(prevTr).index()!==$(tekTrOld).index()) {
                  let dopRowspan=+$(prevTrTd).attr('rowspan');
                  if (isNaN(dopRowspan)) {
                      dopRowspan=1;
                  }
                  $(prevTrTd).attr('rowspan',++dopRowspan);
                //}

              }
            }

            //находим ближайшую группировку, если есть и обрабатываем
            setOneGroupe(thisID,tekTrOld,(i0+1),idNext);
          }

          //используется для повышения производительности засчет запоминания
          //ячеек для которых необходимо увеличивать rowspan, но которые находятся выше или на одном уровне с текущей выбранной строкой
          tekTd=$(tekTrOld).find('#'+thisID+'.td_str_val');
          const tdRowspanAbove={};
          tdRowspanAbove[tekTd[0].id]=tekTd[0];
          for (let i4 = (i0-1); i4>=0; i4--) {
            let prevTr=$(tekTrOld),
                prevTrTd=$(prevTr).find('td.td_str_val[id="'+tdStrName[i4].id+'"]');
            //ищем ближайшую подходящую строку
            while (($(prevTrTd).length===0) || ($(prevTr).is('[pritog]'))) {
              prevTr=$(prevTr).prev();
              prevTrTd=$(prevTr).find('td.td_str_val[id="'+tdStrName[i4].id+'"]');
            }
            if ($(prevTrTd).length>0) {
              tdRowspanAbove[prevTrTd[0].id]=prevTrTd[0];
            }
          }

          //обрабатываем остальные строки
          tekTr=tekTrOld;
          while ($(tekTr).length>0) {
              tekTr=$(tekTr).next();
              if ($(tekTr).is('[pritog][itogid="'+thisID+'"]')) {
                break;
              }
              else {
                  if (!!!idNext) {
                    //ищем номер этой ячейки, она точно нулевая, т.к. произведена подготовка после подгрузки данных
                    const tekTd=$(tekTr).find('td.td_str_val').first();
                    let i3;
                    for (i3 = 0; i3 < tdStrName.length; i3++) {
                      if (tdStrName[i3].id===tekTd[0].id) {
                          break;
                      }
                    }
                    $(tekTr).show();
                    ++countUnwrap;
                    //необходимо всем идущим до этого объединениям увеличить rowspan на единицу и удалить лишние ячейки в подытогах
                    incRowspanAbove(i3,tekTrOld);
                  }
                  else if (!$(tekTr).is('[pritog]')) {
                      //находим ближайшую группировку, если есть и обрабатываем
                      setOneGroupe(thisID,tekTr,(i0+1),idNext,true);
                  }
              }
          }

          thisV.setState({itemsStrgrouping:tabTr[0].outerHTML,$itemsStrgrouping:tabTr});
          const time01 = performance.now();
          console.log('Время разворачивания группировки '+secondstotime(time01,time00));
          console.log('Кол-во развернутых строк '+countUnwrap);
        });

        //событие сворачивания развернутых/несгруппированых строк
        $("div#root").on('click', "table.tableOLAP[id='"+this.props.obj.id+"'] tbody tr td a.wrapTrOLAP",function() {
          const time00 = performance.now();
          const tabTr=thisV.state.$itemsStrgrouping,
                //tabTr=$("table.tableOLAP[id='"+thisV.props.obj.id+"'] tbody"),
                thisID=this.id,
                //tdStrName=$(tabTr).filter('tr.tr_name_col').find('td.td_str_name');
                tdStrName=$(tabTr).find('tr.tr_name_col td.td_str_name'),
                firstIDSubItog=$(tabTr).find('tr.tr_tab:first').find('td a.wrapTrOLAP,td a.unwrapTrOLAP').first()[0].id;
          //номер текущей группировки
          let i0;
          for (i0 = 0; i0 < tdStrName.length; i0++) {
            let tekID=tdStrName[i0].id;
            if ((!!thisV.state.strgrouping.onSubItog[tekID]) & (tekID===thisID)) {
                break;
            }
          }

          /*const tekTd=$(this).closest('td'),
                tekTrOld=$(tekTd).closest('tr');*/
          const tekTdTrue=$(this).closest('td'),
                tekTrOldTrue=$(tekTdTrue).closest('tr');
          //необходимо найти ячейку и строку в виртуальном DOM
          const tekTrOld=$(tabTr).find('tr:eq('+$(tekTrOldTrue).index()+')'),
                tekTd=$(tekTrOld).find('td:eq('+$(tekTdTrue).index()+')');
          let tekTr=tekTrOld;

          //считаем кол-во свернутых строк
          let countWrap=0;

          //находим подытог для выбранного блока, скрываем все строки внутри
          while ($(tekTr).length>0) {
            tekTr=$(tekTr).next();
            if ($(tekTr).is('[pritog][itogid="'+thisID+'"]')) {
                break;
            }
            else {
                //метод is(':visible') работает только для реального DOM, поэтому смотрим на стиле
                if ($(tekTr).attr('style').indexOf('display: none')===-1) {
                  $(tekTr).hide();
                  ++countWrap;
                }
            }
          }

          const tekTrNew=tekTrOld,
                tekTdNew=$(tekTd).clone()[0],
                tekTrNewTdFirstIndex=$(tekTd).index();

          let trRecover;
          if (firstIDSubItog!==thisID) {
            //восстанавливаем первую строку и кладем её в подытоги для дальнейшего возможного повторного раскрытия
            //для первого подытога восстанавливаем дальше при замене блока строк
            trRecover=$(tekTrOld).clone();
            //ищем последний подытог в строке, если раскрыт, то берем строку восстановления текущую,
            //если нет, то надо строку восстановления достать из найденного последнего подытога
            const allASubItog=$(trRecover).find('td:gt('+(tekTrNewTdFirstIndex)+') a.wrapTrOLAP,td:gt('+(tekTrNewTdFirstIndex)+') a.unwrapTrOLAP'),
                  lastASubItog=$(allASubItog).last(),
                  lastTdSubItog=$(lastASubItog).closest('td'),
                  lastTdSubItogIndex=$(lastTdSubItog).index(),
                  trRecoverLength=$(trRecover).find('td').length;
            $(allASubItog).remove();
            if ($(lastASubItog).is('.unwrapTrOLAP')) {
              //ищем последний подытог, там лежат данные для восстановления
              let subItogRecover=$(tekTrOld).next();
              while ((!$(subItogRecover).is('[pritog][itogid="'+lastTdSubItog[0].id+'"]')) & ($(subItogRecover).length>0)) {
                subItogRecover=$(subItogRecover).next();
              }
              if ($(subItogRecover).length>0) {
                  $(trRecover).find('td:gt('+(lastTdSubItogIndex-1)+')').remove();
                  let lastTdSubItogColspan=+$(lastTdSubItog).attr('colspan');
                  if (isNaN(lastTdSubItogColspan)) {
                      lastTdSubItogColspan=0;
                  }
                  else {
                      --lastTdSubItogColspan;
                  }
                  const subItogRecoverTd=$(subItogRecover).find('td');
                  $(subItogRecoverTd).filter(':gt('+($(subItogRecoverTd).length-(trRecoverLength+lastTdSubItogColspan-lastTdSubItogIndex)-1)+')').each(function(i,elem) {
                    const elemClone=$(elem).clone();
                    if ($(elemClone).is('.td_str_val')) {
                        $(elemClone).find('a.wrapTrOLAP,a.unwrapTrOLAP').remove();
                    }
                    $(trRecover).append(elemClone);
                  });
                  //не можем удалить выше, т.к. удаляем с помощью gt - не включает текущий индекс, не удаляем сразу все,
                  //т.к. может содержать те, которые нельзя удалять (подытог рангом выше)
                  $(trRecover).find('td.td_str_val[id="'+thisID+'"] a.wrapTrOLAP').remove();
              }
            }

          }

          let tdStrVal=$(tekTrNew).find('td.td_str_val').clone();
          $(tekTrNew).html(tekTr[0].innerHTML);
          const tekTrNewTdFirst=$(tekTrNew).find('td.td_str_val[id="'+thisID+'"]:first');
          $(tekTrNewTdFirst).html(tekTdNew.innerHTML)
                  .attr('colspan',(tdStrName.length-i0))
                  .attr('rowspan',1)
                  .find('a.wrapTrOLAP')
                    .removeClass('wrapTrOLAP')
                    .addClass('unwrapTrOLAP')
                    .html(String.fromCharCode(9658));
          for (var j = 0; j < tekTrNewTdFirstIndex; j++) {
            $(tekTrNew).find('td.td_str_val[id="'+thisID+'"]:first').before(tdStrVal[j]);
          }
          $(tekTr).hide();
          ++countWrap;
          const rowspanBefore=countWrap;
          //необходимо всем идущим до этого объединениям уменьшить rowspan
          for (var i4 = (i0-1); i4>=0; i4--) {
            let prevTr=$(tekTr).prev(),
                prevTrTd=$(prevTr).find('td.td_str_val[id="'+tdStrName[i4].id+'"]');
            //ищем ближашую подходящую строку
            while (($(prevTrTd).length===0) || ($(prevTr).is('[pritog]'))) {
              prevTr=$(prevTr).prev();
              if ($(prevTr).length>0) {
                prevTrTd=$(prevTr).find('td.td_str_val[id="'+tdStrName[i4].id+'"]');
              }
              else {
                break;
              }
            }
            if ($(prevTrTd).length>0) {
              let dopRowspan=+$(prevTrTd).attr('rowspan');
              if (!isNaN(dopRowspan)) {
                  const tekRowspan=dopRowspan-rowspanBefore;
                  $(prevTrTd).attr('rowspan',tekRowspan);
              }
            }
          }

          if (firstIDSubItog!==thisID) {
            //восстанавливаем первую строку и кладем её в подытоги для дальнейшего возможного повторного раскрытия
            //для первого подытога восстанавливаем дальше при замене блока строк
            $(tekTr).html(trRecover[0].innerHTML);
          }

          //ищем блок строк в начальном сгруппированном состоянии, чтобы заменить им аналогичные строки
          function deltaIndex(trIn,begIndex,endIndex) {
            //функция поиска строк в диапазоне между индексами, одновременное применение gt, lt не работает
            const result=[];
            $(trIn).each(function(i,elem) {
              if ((i>begIndex) & (i<endIndex)) {
                  result.push(elem);
              }
              else if (i===endIndex) {
                  return false;
              }
            });
            return result;
          }
          const tekTrOldIndex=$(tekTrOld).index(),
                tekTrIndex=$(tekTr).index();
          if ((tekTrIndex-tekTrOldIndex)>1) {
              let trIn=$(thisV.state.$itemsStrgroupingBeg).find('tr'),
                  dopRowRemove=0;
              if (firstIDSubItog===thisID) {
                  //для первого подытога можно просто заменить строку подытога, этого достаточно
                  dopRowRemove=1;
              }
              const blockBegin=$(deltaIndex(trIn,tekTrOldIndex,tekTrIndex+dopRowRemove)).clone();
              trIn=$(tabTr).find('tr');
              $(deltaIndex(trIn,tekTrOldIndex,tekTrIndex+dopRowRemove)).remove();
              $(tabTr).find('tr:eq('+tekTrOldIndex+'):first').after(blockBegin);
          }

          thisV.setState({itemsStrgrouping:tabTr[0].outerHTML,$itemsStrgrouping:tabTr});
          const time01 = performance.now();
          console.log('Время сворачивания группировки '+secondstotime(time01,time00));
          console.log('Кол-во свернутых строк '+countWrap);
        });

        if (!!this.props.obj.componentDidMount) {
            this.props.obj.componentDidMount(this);
        }
    }

    componentWillUnmount() {
      if (!!this.props.obj.freeAction) {
        this.props.obj.freeAction.forEach((item) => {
          $("div#root").off(item.event, "table.tableOLAP[id='"+this.props.obj.id+"'] "+item.element);
        });
      }

      //события Drug and Drop
      $("div#root").off('dragstart', "table.tableOLAP[id='"+this.props.obj.id+"'] tbody tr td.td_pok_name,"+
                                    "table.tableOLAP[id='"+this.props.obj.id+"'] tbody tr td.td_str_name,"+
                                    "table.tableOLAP[id='"+this.props.obj.id+"'] tbody tr td.td_val_name,"+
                                    "a.TabOLAPPol[id='"+this.props.obj.id+"'],"+
                                    "ul.tableOLAP[id='"+this.props.obj.id+"'] li.liTableOLAP", this.dragStart);
      $("div#root").off('dragenter', "table.tableOLAP[id='"+this.props.obj.id+"'] tbody tr td.td_pok_name,"+
                                    "table.tableOLAP[id='"+this.props.obj.id+"'] tbody tr td.td_str_name,"+
                                    "table.tableOLAP[id='"+this.props.obj.id+"'] tbody tr td.td_val_name,"+
                                    "a.TabOLAPPol[id='"+this.props.obj.id+"'],"+
                                    "ul.tableOLAP[id='"+this.props.obj.id+"'] li.liTableOLAP", this.dragEnter);
      $("div#root").off('dragover', "table.tableOLAP[id='"+this.props.obj.id+"'] tbody tr td.td_pok_name,"+
                                    "table.tableOLAP[id='"+this.props.obj.id+"'] tbody tr td.td_str_name,"+
                                    "table.tableOLAP[id='"+this.props.obj.id+"'] tbody tr td.td_val_name,"+
                                    "a.TabOLAPPol[id='"+this.props.obj.id+"'],"+
                                    "ul.tableOLAP[id='"+this.props.obj.id+"'] li.liTableOLAP", this.dragOver);
      $("div#root").off('drop', "table.tableOLAP[id='"+this.props.obj.id+"'] tbody tr td.td_pok_name,"+
                                    "table.tableOLAP[id='"+this.props.obj.id+"'] tbody tr td.td_str_name,"+
                                    "table.tableOLAP[id='"+this.props.obj.id+"'] tbody tr td.td_val_name,"+
                                    "a.TabOLAPPol[id='"+this.props.obj.id+"']", this.dragDrop);
      $("div#root").off('click', "a.TabOLAPPol[id='"+this.props.obj.id+"']");

      //события контекстного меню
      $("div#root").off('contextmenu', "table.tableOLAP[id='"+this.props.obj.id+"'] tbody tr td.td_val_name");
      $("div#root").off('change', ".divForTableOLAP[id='"+this.props.obj.id+"'] div.divContextMenu input[name='aggr']");

      //сортировка строк по клику
      $("div#root").off('click', "table.tableOLAP[id='"+this.props.obj.id+"'] tbody tr td a.tab_sort_up");
      $("div#root").off('click', "table.tableOLAP[id='"+this.props.obj.id+"'] tbody tr td a.tab_sort_unup");

      if ((!!this.props.obj.addRow) || (!!this.props.obj.deleteRow) || (!!this.props.obj.dopAction) || (!!this.props.obj.editRow) || (this.graf)) {
          //события панели
          if (!!this.props.obj.addRow) {
            $("div#root").off('click', ".divForTableOLAP[id='"+this.props.obj.id+"'] li.tableDBaddRow");
          }
          if (!!this.props.obj.editRow) {
              $("div#root").off('click', ".divForTableOLAP[id='"+this.props.obj.id+"'] li.tableDBeditRow");
          }
          if (!!this.props.obj.deleteRow) {
              $("div#root").off('click', ".divForTableOLAP[id='"+this.props.obj.id+"'] li.tableDBdeleteRow");
          }
          if (!!this.props.obj.dopAction) {
              $("div#root").off('click', ".divForTableOLAP[id='"+this.props.obj.id+"'] li.tableDBdopActionBlok");

              //$('main').unbind('scroll', this.panelScroll);

              this.props.obj.dopAction.forEach((item) => {
                $("div#root").off('click', ".divForTableOLAP[id='"+this.props.obj.id+"'] ul.tableDBdopAction.ul_cons.second-level li.tableDBdopAction[id='"+item.id+"']");
              })
          }

          //кнопка графика
          if (this.graf) {
            $("div#root").off('click', ".divForTableOLAP[id='"+this.props.obj.id+"'] li.table_graf");
          }
      }

      $("div#root").off('click', "table.tableOLAP[id='"+this.props.obj.id+"'] tbody tr td a.unwrapTrOLAP");
      $("div#root").off('click', "table.tableOLAP[id='"+this.props.obj.id+"'] tbody tr td a.wrapTrOLAP");

      this.getDropTable();
    }

    getDropTableOne() {
      if (!!this.state.tabname) {
        const data={},
              tabname=this.state.tabname,
              dbtype=getDBType();
        if (dbtype==='ora') {
          data.execsql=`DROP TABLE `+tabname;
          this.state.tabname=undefined;
          getSQLRun2(data,function(response) {
                          console.log('Удаление таблицы '+tabname);
                          console.log(response);
                      });
        }
        else if (dbtype==='mssql') {
          data.sql=`DROP TABLE `+tabname;
          this.state.tabname=undefined;
          getSQLRun(data,function(response) {
                          console.log('Удаление таблицы '+tabname);
                          console.log(response);
                      });
        }
      }
    }

    getDropTableAll() {
      const dbtype=getDBType();
      let data;
      if (dbtype==='ora') {
        data={sql:`SELECT T.OBJECT_NAME
                      FROM dba_objects T
                     WHERE object_name LIKE 'REP_TAB_%'
                       AND object_type = 'TABLE'
                       AND 24*(SYSDATE-T.CREATED)>`+houreLifeCookies
               };
      }
      else if (dbtype==='mssql') {
        data={sql:`SELECT T.TABLE_NAME OBJECT_NAME
                    FROM INFORMATION_SCHEMA.TABLES T
                    JOIN sysobjects s
                    ON T.[TABLE_NAME] = s.[name]
                    WHERE T.TABLE_TYPE LIKE 'BASE_TABLE'
                    AND S.crdate<DATEADD(hh,-`+houreLifeCookies+`, GETDATE())
                    AND T.TABLE_NAME LIKE 'REP_TAB_%'`
                 };
      }



      if (!!this.state.tabname) {
        if (dbtype==='ora') {
          data.sql+=` AND object_name!='`+this.state.tabname+`'`;
        }
        else if (dbtype==='mssql') {
          data.sql+=` AND T.TABLE_NAME!='`+this.state.tabname+`'`;
        }
      }
      getSQLRun(data,(response)=> {
          if (response.data.length>0) {
            const data1={};
            if (dbtype==='ora') {
              data1.execsql=`BEGIN\n`;
              response.data.forEach((item) => {
                data1.execsql+=`EXECUTE IMMEDIATE 'DROP TABLE `+item.OBJECT_NAME+`';\n`;
                console.log('Удаление таблицы '+item.OBJECT_NAME);
              });
              data1.execsql+=`END;`;
              getSQLRun2(data1,function(response1) {
                console.log(response1);
              });
            }
            else if (dbtype==='mssql') {
              data1.sql=`BEGIN\n`;
              response.data.forEach((item) => {
                data1.sql+=`EXECUTE ('DROP TABLE `+item.OBJECT_NAME+`');\n`;
                console.log('Удаление таблицы '+item.OBJECT_NAME);
              });
              data1.sql+=`END;`;
              getSQLRun(data1,function(response1) {
                console.log(response1);
              });
            }
          }
      });
    }

    getDropTable() {
      if (!getTagExit()) {
        this.getDropTableAll();
        this.getDropTableOne();
      }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        // Популярный пример (не забудьте сравнить пропсы):
        //console.log(this.props);
        if (getParamDiff(this.props.obj.paramGroup,prevProps.obj.paramGroup,this.props.obj.parParentID)) {
            const thisV=this;
            if (!!thisV.state.tabname) {
              const data={},
                    dbtype=getDBType();
              if (dbtype==='ora') {
                data.execsql=`DROP TABLE `+thisV.state.tabname;
                thisV.state.tabname=undefined;
                getSQLRun2(data,function(response) {
                                thisV.getDataSQL();
                              },
                              thisV.props.obj.stateLoadObj
                            );
              }
              else if (dbtype==='mssql') {
                data.sql=`DROP TABLE `+thisV.state.tabname;
                thisV.state.tabname=undefined;
                getSQLRun(data,function(response) {
                            thisV.getDataSQL();
                          },
                          thisV.props.obj.stateLoadObj
                        );
              }
            }
            else {
                thisV.getDataSQL();
            }
        }
        else {
          let thisV=this,
              b_tab=$(".divForTableOLAP[id='"+thisV.props.obj.id+"']");
          //если существуют обработчики событий строки, то инициализируем их
          if (!!thisV.props.obj.rowEvents) {
            const trC=$(b_tab).find('tr');
            if (!!thisV.props.obj.rowEvents.onClick) {
              //$("div#root" ).on("click", "table.tableOLAP[id='"+thisV.props.obj.id+"'] tr", function(event) {
              $(trC).click(function(event) {
                  thisV.props.obj.rowEvents.onClick(event,this,thisV);
              });
            }
            if (!!thisV.props.obj.rowEvents.onDoubleClick) {
              //$("div#root" ).on("dblclick", "table.tableOLAP[id='"+thisV.props.obj.id+"'] tr", function(event) {
              $(trC).dblclick(function(event) {
                  thisV.props.obj.rowEvents.onDoubleClick(event,this,thisV);
              });
            }
            if (!!thisV.props.obj.rowEvents.onMouseout) {
              $(trC).mouseout(function(event) {
              //$("div#root" ).on("mouseout", "table.tableOLAP[id='"+thisV.props.obj.id+"'] tr", function(event) {
                  thisV.props.obj.rowEvents.onMouseout(event,this,thisV);
              });
            }
            if (!!thisV.props.obj.rowEvents.onMouseover) {
              //$("div#root" ).on("mouseover", "table.tableOLAP[id='"+thisV.props.obj.id+"'] tr", function(event) {
              $(trC).mouseover(function(event) {
                  thisV.props.obj.rowEvents.onMouseover(event,this,thisV);
              });
            }
            if (!!thisV.props.obj.rowEvents.onHover) {
              $(trC).hover(function(event) {
              //$("div#root" ).on("hover", "table.tableOLAP[id='"+thisV.props.obj.id+"'] tr", function(event) {
                  thisV.props.obj.rowEvents.onHover(event,this,thisV);
              });
            }
          }
        }

        if (!!this.props.obj.componentDidUpdate) {
            this.props.obj.componentDidUpdate(this,prevProps, prevState, snapshot);
        }
      }

    render() {
      const TableRender=({id,className}) => {
          if (!!this.props.obj) {
            const ulBlock=this.getUlTabPol();
            const panelBlock=() => {
              if (this.prPanelMove) {
                return null;
              }
              if ((!!this.props.obj.addRow) || (!!this.props.obj.deleteRow) || (!!this.props.obj.dopAction) || (!!this.props.obj.editRow) || (this.graf)){
                return <div className="TabOLAPPanelAction" dangerouslySetInnerHTML={{ __html:  this.panel[0].childNodes[0].innerHTML }}></div>;
              }
              else {
                return null;
              }
            }
            const tabOLAPPol=() => {
              if (this.prPanelMove) {
                return null;
              }
              else {
                if (this.state.countall>0) {
                  return <div className="TabOLAPPol" dangerouslySetInnerHTML={{ __html:  ulBlock }}>
                         </div>
                }
                else {
                  return null;
                }
              }
            }
            const dopBlockPok=() => {
              let prVis=false;
              if (!!!this.state.data.tab_pok) {
                  prVis=true;
              }
              else if (this.state.data.tab_pok.length===0) {
                prVis=true;
              }
              if (!prVis) {
                return null;
              }
              else {
                return <div className="divTableOLAP td_pok_name" draggable="true" id={id}
                            style={{border:'1px solid black',
                                    width: 'fit-content',
                                    padding: '0.1em 0.3em',
                                    borderRadius: '0.3em',
                                    display: 'inline-block',
                                    marginLeft: '3em'
                                  }}
                            title="Перетащите сюда элемент из другого измерения при необходимости"
                        >Измерение показателей</div>;
              }
            }
            let tabHtml;
            if (!!this.state.itemsStrgrouping) {
              tabHtml=this.state.itemsStrgrouping;
            }
            else {
                tabHtml=this.state.items;
            }
            return <div className="divForTableOLAP" id={id}>
                      <div className="divContextMenu">
                      </div>
                      {panelBlock()}
                      {tabOLAPPol()}
                      {dopBlockPok()}
                      <table id={id} className={'tableOLAP'+((!!className)?' '+className:'')} dangerouslySetInnerHTML={{ __html:tabHtml }}>
                      </table>
                   </div>;
         }
         else {
           return null;
         }
      }

        return (
              <div>
                <AlertPlus ref={this.refAlertPlus}/>
                <TableRender
                  id={this.props.obj.id}
                  className={this.props.obj.className}
                />
              </div>
        );
    }
}

export default TableOLAP;
