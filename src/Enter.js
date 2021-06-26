import React, { useState } from 'react';
import './styles/enter.css';
import EnterLogin from './img/enter_login.png';
import EnterPassword from './img/enter_password.png';
import {setAuth} from './system.js';

function Enter({setIsAuth}) {
  let [resultAuth,setResultAuth]=useState(null);
  const handleEnterClick=()=>{
    let userL=document.getElementById('user').value.trim(),
        passwordL=document.getElementById('password').value.trim();
    if ((userL.length>0) & (passwordL.length>0)) {
      setAuth({"login":userL,"password":passwordL},
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

  return(
    <div className="backgroundContainer">
      <div className="loginContainer">
        <div id="login" className="login">
            <h2>Авторизация</h2>
            <div className="divUsrPwd">
              <img htmlFor="user" className="icon-user" src={EnterLogin} title="Логин" alt="Логин" />
              <input className="user" id="user" />
              <img htmlFor="password" className="icon-user" src={EnterPassword} title="Пароль" alt="Пароль"/>
              <input type="password" className="password" id="password" />
              <label htmlFor="remember"><input type="checkbox" id="remember" /><span className="remember"/>Запомнить меня</label>
              <input type="submit" value="Войти" className="but_enter" onClick={()=>handleEnterClick()}/>
              <label style={{position:'absolute',top: '7.5rem',color:'white',left:'7%',fontSize:'14px',textShadow: '0 1px red'}}>{resultAuth}</label>
            </div>
        </div>
      </div>
    </div>
  );
}

export default Enter;
