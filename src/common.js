import axios from "axios";
import $ from 'jquery'

let dataServer,
    userInfo,
    tagExit=false,
    dbtype='mssql',
    prErrorData=false,
    axiosInstance;

//получаем файл конфигурации
$.ajax({
  type: "GET",
  url: '/config.json',
  //dataType:'json',
  async:false,
  success: function(data) {
    dataServer=data.dataServer;
    if (!!data.dbtype) {
      dbtype=data.dbtype;
    }
    axiosInstance= axios.create({
      baseURL: data.dataServer
    });
  },
  error: function(xhr, status, error) {
      alert("Не удалось прочитать файл конфигурации");
      console.log(xhr.responseText + '|\n' + status + '|\n' +error);
  }
});

const houreLifeCookies = 8;
export { houreLifeCookies };


function setDataError() {
  if (!prErrorData) {
    prErrorData=true;
    alert('Ошибка верификации данных');
    delAuth();
  }
  else {
    delAuth();
  }
}

export function getDBType() {
  return dbtype;
}

export function getDataServer() {
  return dataServer;
}

export function getTagExit() {
  return tagExit;
}

let token;

export function get_cookie(cookie_name)
{
  var results = document.cookie.match ( '(^|;) ?' + cookie_name + '=([^;]*)(;|$)' );
  if ( results )
    return ( unescape ( results[2] ) );
  else
    return null;
}

function set_cookie( name, value, houreLife, path, domain, secure)
{
  var cookie_string = name + "=" + escape ( value );
  if ( !!houreLife )
  {
    var expires = new Date();
    expires.setMilliseconds(houreLife * 60 * 60 * 1000);
    cookie_string += "; expires=" + expires.toGMTString();
  }
  if ( path )
        cookie_string += "; path=" + escape ( path );
  if ( domain )
        cookie_string += "; domain=" + escape ( domain );
  if ( secure )
        cookie_string += "; secure";
  document.cookie = cookie_string;
}

export function setAuth(data,callback) {
  //{"login":process.env.REACT_APP_DSL,"password": process.env.REACT_APP_DSP}
  axiosInstance.post('/auth/set',data)
  .then(function(response) {
    if (response.status !== 200) {
      console.log('Authentication failed.' + response.status);
    }
    else {
      if (!!response.data.token) {
        set_cookie ('auth',response.data.token, houreLifeCookies);
        token=response.data.token;
        localStorage.setItem('tokenOne', response.data.tokenOne);
      }
    }
    callback(response);
  });
}

function delete_cookie( cookie_name )
{
  var cookie_date = new Date ( );  // Текущая дата и время
  cookie_date.setTime ( cookie_date.getTime() - 1 );
  document.cookie = cookie_name += "=; expires=" + cookie_date.toGMTString();
}

export function delAuth(prReload) {
  if (typeof prReload!=='boolean') {
      prReload=true;
  }
  if (!!!token) {
      token=get_cookie('auth');
  }
  if (!!token) {
    tagExit=true;
    let token_local=token;
    delete_cookie('auth');
    token=undefined;
    axiosInstance.post('/auth/del',{authorization:token_local})
    .then(function(response) {
      if (response.status !== 200) {
        console.log('Exit failed.' + response.status);
      }
      else {
        let cityV=localStorage.getItem('city');
        localStorage.clear();
        localStorage.setItem('city', cityV);
        userInfo=undefined;
        tagExit=false;
        console.log('node exit',response.data);
      }
      if (prReload) {
        window.location.reload();
      }
    });
  }
  else if (prReload) {
    window.location.reload();
  }
}

export function getParamForSQL(paramGroup,parParentID,data) {
      if ((!!paramGroup) & (!!parParentID)) {
        parParentID.forEach(function(item) {
            if (!Array.isArray(paramGroup[item])) {
              data.params[item]=paramGroup[item];
            }
            else {
                if (paramGroup[item].length>0) {
                  let parSimv;
                  if (dbtype==='ora') {
                      parSimv=':';
                  }
                  else if (dbtype==='mssql') {
                      parSimv='@';
                  }
                  let str_for_sql_params=parSimv+item+'_0';
                  data.params[item+'_0']=paramGroup[item][0];
                  for (var i = 1; i < paramGroup[item].length; i++) {
                    data.params[item+'_'+i]=paramGroup[item][i];
                    str_for_sql_params+=','+parSimv+item+'_'+i;
                  }
                  data.sql=data.sql.split(parSimv+item).join(str_for_sql_params);
                }
                else {
                    if (dbtype==='ora') {
                        data.params[item]='';
                    }
                    else if (dbtype==='mssql') {
                        data.params[item]=null;
                    }
                }
            }
        });
      }
}

export function getDiffArray(a,b) {
  var result=false;
  if (a.length!==b.length) {
      result=true;
  }
  else {
    for (var i = 0; i < a.length; i++) {
        var resultOne=false;
        for (var z = 0; z < b.length; z++) {
            if (a[i] === b[z]) {
                resultOne=true;
                break;
            }
        }
        if (!resultOne) {
            result=true;
            break;
        }
    }
  }
  return result;
}

export function getParamDiff(t_paramGroup,p_paramGroup,parParentID) {
      var result=false;
      if ((!!t_paramGroup) & (!!p_paramGroup) & (!!parParentID)) {
        for (var j = 0; j < parParentID.length; j++) {
            if (!Array.isArray(t_paramGroup[parParentID[j]])) {
              if (t_paramGroup[parParentID[j]]!==p_paramGroup[parParentID[j]]) {
                  result=true;
                  break;
              }
            }
            else {
              if (getDiffArray(t_paramGroup[parParentID[j]],p_paramGroup[parParentID[j]])) {
                  result=true;
                  break;
              }
            }
        }
      }
      return result;
}

function getAuthorization(data,callback0) {
  //console.log(process.env);
  if (!!!token) {
      token=get_cookie('auth');
  }
  if (!!token) {
      data.authorization=token;
      data.tokenOne=localStorage.getItem('tokenOne');
      callback0(true);
  }
  else {
    alert('Вы не авторизованы');
    callback0(false);
  }
}

export function getQuery(data,callback,stateLoadObj) {
  getAuthorization(data,function(result){
    if (result) {
      if (!!stateLoadObj) {
          stateLoadObj.current.setState((state) => ({vis:++state.vis}));
      }
      function axiosInstanceFunc() {
        axiosInstance.post('/'+dbtype+'/query',data)
        .then(function(response) {
          if (response.status !== 200) {
            console.log('Authentication failed.' + response.status);
          }
          if (!!stateLoadObj) {
            if (stateLoadObj.current!==null) {
              stateLoadObj.current.setState((state) => ({vis:--state.vis}));
            }
          }
          if (!!!response.data.message) {
            //set_cookie('tokenOne',response.data.tokenOne, houreLifeCookies);
            localStorage.setItem('tokenOne', response.data.tokenOne);
            const responseNew={data:response.data.rows};
            if (!!response.data.output) {
                responseNew.output=response.data.output
            }
            callback(responseNew);
          }
          else {
            setDataError();
          }
        });
      }
      axiosInstanceFunc();
    }
  });
}

export function getHashPwd(data,callback,stateLoadObj) {
  getAuthorization(data,function(result){
      if (result) {
      if (!!stateLoadObj) {
          stateLoadObj.current.setState((state) => ({vis:++state.vis}));
      }
      function axiosInstanceFunc() {
        axiosInstance.post('/auth/gethashpwd',data)
        .then(function(response) {
          if (response.status !== 200) {
            console.log('Authentication failed.' + response.status);
          }
          if (!!stateLoadObj) {
            if (stateLoadObj.current!==null) {
              stateLoadObj.current.setState((state) => ({vis:--state.vis}));
            }
          }
          if (!!!response.data.message) {
            //set_cookie('tokenOne',response.data.tokenOne, houreLifeCookies);
            localStorage.setItem('tokenOne', response.data.tokenOne);
            callback({sol:response.data.sol,hash:response.data.hash});
          }
          else {
            setDataError();
          }
        });
      }
      axiosInstanceFunc();
    }
  });
}

export function getExecQuery(data,callback,stateLoadObj) {
  getAuthorization(data,function(result){
    if (result) {
      if (!!stateLoadObj) {
        stateLoadObj.current.setState((state) => ({vis:++state.vis}));
      }
      function axiosInstanceFunc() {
        axiosInstance.post('/'+dbtype+'/execquery',data)
        .then(function(response) {
          if (response.status !== 200) {
            console.log('Authentication failed.' + response.status);
          }
          if (!!stateLoadObj) {
            stateLoadObj.current.setState((state) => ({vis:--state.vis}));
          }
          if (!!!response.data.message) {
            //set_cookie('tokenOne',response.data.tokenOne, houreLifeCookies);
            localStorage.setItem('tokenOne', response.data.tokenOne);
            if (dbtype==='ora') {
              let responseDR={...response.data.rows};
              delete response.data;
              response.data=responseDR;
              callback(response);
            }
            else if (dbtype==='mssql') {
              let responseNew={result:response.data.result}
              callback(responseNew);
            }
          }
          else {
            setDataError();
          }
        });
      }
      axiosInstanceFunc();
    }
  });
}

export function getAuth(callback,stateLoadObj) {
  if (!!userInfo) {
      callback(userInfo);
  }
  else {
    let data={};
    getAuthorization(data,function(){
      if (!!stateLoadObj) {
          stateLoadObj.current.setState((state) => ({vis:++state.vis}));
      }
      function axiosInstanceFunc() {
        axiosInstance.post('/auth/get',data)
        .then(function(response) {
          if (response.status !== 200) {
            console.log('Authentication failed.' + response.status);
          }
          if (!!stateLoadObj) {
            if (stateLoadObj.current!==null) {
              stateLoadObj.current.setState((state) => ({vis:--state.vis}));
            }
          }
          if (!!!response.data.message) {
            //set_cookie('tokenOne',response.data.tokenOne, houreLifeCookies);
            localStorage.setItem('tokenOne', response.data.tokenOne);
            userInfo=response.data.user;
            callback(userInfo);
          }
          else {
            setDataError();
          }
        });
      }
      axiosInstanceFunc();
    });
  }
}

export function getCheckRight(rigth,callback) {
    //callback м.б. не функция, а массив с правами,
    //чтобы обойтись без функции обратного вызова, при этом проверить наличие права
    if ((!!rigth) & (!!callback)) {
      if (typeof callback==="function") {
        getAuth((result) => {
            if (!Array.isArray(result.rights)) {
                callback(false);
            }
            else {
              let res=false;
              for (var i = 0; i < result.rights.length; i++) {
                if (result.rights[i].RIGHT_SYSNAME===rigth) {
                    res=true;
                    break;
                }
              }
              callback(res);
            }
        });
      }
      else {
        if (!Array.isArray(callback)) {
            return false;
        }
        else {
          let res=false;
          for (var i = 0; i < callback.length; i++) {
            if (callback[i].RIGHT_SYSNAME===rigth) {
                res=true;
                break;
            }
          }
          return res;
        }
      }
    }
    else {
        callback('ошибка передачи параметров');
    }
}

export function getTableOLAP(data,callback,stateLoadObj) {
  getAuthorization(data,function(){
    if (!!stateLoadObj) {
        stateLoadObj.current.setState((state) => ({vis:++state.vis}));
    }
    function axiosInstanceFunc() {
      axiosInstance.post('/olap/gettable',data)
      .then(function(response) {
        if (response.status !== 200) {
          console.log('Authentication failed.' + response.status);
        }
        if (!!stateLoadObj) {
          if (stateLoadObj.current!==null) {
            stateLoadObj.current.setState((state) => ({vis:--state.vis}));
          }
        }
        if (!!!response.data.message) {
          //set_cookie('tokenOne',response.data.tokenOne, houreLifeCookies);
          localStorage.setItem('tokenOne', response.data.tokenOne);
          callback(response.data.object);
        }
        else {
          setDataError();
        }
      });
    }
    if (!!!axiosInstance) {
      var MyInt= setInterval(function(){
          if (!!axiosInstance) {
            clearInterval (MyInt);
            axiosInstanceFunc();
          }
      },500);
    }
    else {
      axiosInstanceFunc();
    }
  });
}

export function secondstotime(time01,time00,noMikro)
{
    if (typeof noMikro!=='boolean') {
        noMikro=false;
    }
    var secs=(time01-time00)/1000,
        t = new Date(1970,0,1);
    t.setSeconds(secs);
    var s = t.toTimeString().substr(0,8);
    if(secs > 86399)
        s = Math.floor((t - Date.parse("1/1/70")) / 3600000) + s.substr(2);
    s+=':'+String((time01-time00) % 1000);
    if (noMikro) {
        s=s.split('.')[0];
    }
    return s;
}

export function getCursorPosition(e) {
  let posx = 0,
      posy = 0;

  if (!e) var e = window.event;

  if (e.pageX || e.pageY) {
    posx = e.pageX;
    posy = e.pageY;
  }
  else if (e.clientX || e.clientY) {
    posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
    posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
  }
  return {x:posx,y:posy};
}
