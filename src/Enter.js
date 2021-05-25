import React, { useState, useEffect } from 'react';
import './styles/enter.css';
import EnterLogin from './img/enter_login.png';
import EnterPassword from './img/enter_password.png';
import {setAuth} from './common.js';
import {Switch,Route} from 'react-router-dom';
import {setAuthByToken,createPool} from './common.js';

function Enter({setIsAuth}) {
  useEffect(() => {
    let cityV=localStorage.getItem('city');
    if (cityV===null) {
        cityV='def';
        localStorage.setItem('city', cityV);
    }
  }, []);

  let [resultAuth,setResultAuth]=useState(null);
  const butEnterClick=()=>{
    /*alert('click');
    console.log('setIsAuth',setIsAuth);*/
    let userL=document.getElementById('user').value.trim(),
        passwordL=document.getElementById('password').value.trim();
    if ((userL.length>0) & (passwordL.length>0)) {
      setAuth({"login":userL,"password":passwordL,"city":'def'},
        function(response) {
          if ((response.status===200) & (!!response.data.token)) {
              setIsAuth(true);
          }
          else {
            setResultAuth('Неправильное сочетание логин/пароль');
            setIsAuth(false);
          }
        }
      );
    }
    else {
      setResultAuth('Заполните поля "Логин" и "Пароль"');
      setIsAuth(false);
    }
  }

  const EnterByToken=(props) => {
    useEffect(() => {
      let pr_ok=true;
      if (!!props.match.params) {
        if (!((!!props.match.params.id) & (!!props.match.params.token) & (!!props.match.params.id))) {
          pr_ok=false;
        }
      }
      else {
          pr_ok=false;
      }
      if (pr_ok) {
        let data={id:props.match.params.id,token:props.match.params.token,database:props.match.params.database.toUpperCase()}
        //console.log(data);
        setAuthByToken(data,(response) => {
          if (!!!response.data.message) {
            setIsAuth(true);
            window.location.href = '#'+response.data.params;
          }
          else if (response.status===200) {
            //const tekResultAuth=<label style={{position:'absolute',top: '7.5rem',color:'white',left:'7%',fontSize:'14px',textShadow: '0 1px red'}}>{response.data.message}</label>;
            setResultAuth(response.data.message);
          }
        });
      }
      else {
        setResultAuth('Ошибка передачи параметров');
      }
    }, []);
    return null;
  }

  const CreatePool=(props) => {
    useEffect(() => {
      let pr_ok=true;
      if (!!props.match.params) {
        if (!((!!props.match.params.user) & (!!props.match.params.password) & (!!props.match.params.tnsname))) {
          pr_ok=false;
        }
      }
      else {
          pr_ok=false;
      }
      if (pr_ok) {
        let data={user:props.match.params.user,password:props.match.params.password,tnsname:props.match.params.tnsname.toUpperCase()}
        console.log(data);
        createPool(data,(response) => {
          if (!!response.data.message) {
            const questV=response.data.message+'\n'+
                        'Переназначить БД для работы значением '+props.match.params.tnsname+'?'
            if (window.confirm(questV)) {
              localStorage.setItem('city', props.match.params.tnsname);
            }
          }
          else if (response.status===200) {
            localStorage.setItem('city', props.match.params.tnsname);
            window.alert('Пул '+props.match.params.tnsname+' создан');
          }
        });
      }
      else {
        setResultAuth('Ошибка передачи параметров');
      }

    }, []);
    return null;
  }

  return(
    <div className="loginContainer">
      <div id="login" className="login">
          <h2>Авторизация</h2>
          <div className="divSelectCity">

          </div>
          <div className="divUsrPwd">
            <img htmlFor="user" className="icon-user" src={EnterLogin} title="Логин" alt="Логин" />
            <input className="user" id="user" />
            <img htmlFor="password" className="icon-user" src={EnterPassword} title="Пароль" alt="Пароль"/>
            <input type="password" className="password" id="password" />
            <label htmlFor="remember"><input type="checkbox" id="remember" /><span className="remember"/>Запомнить меня</label>
            <input type="submit" value="Войти" className="but_enter" onClick={()=>butEnterClick()}/>
            <label style={{position:'absolute',top: '7.5rem',color:'white',left:'7%',fontSize:'14px',textShadow: '0 1px red'}}>{resultAuth}</label>
            <Switch>
              <Route exact path='/enterbytoken/:id/:token/:database' component={EnterByToken}/>
            </Switch>
            <Switch>
              <Route exact path='/createpool/:user/:password/:tnsname' component={CreatePool}/>
            </Switch>
          </div>
      </div>
    </div>
  );
}

export default Enter;
