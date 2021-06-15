import React, { useState } from 'react';
import Aside from './Aside';
import Main from './Main';
import {getAuth} from './system.js';

function Layout({ setLocale,setIsAuth }) {
  const [rtl, setRtl] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [image, setImage] = useState(true);
  const [toggled, setToggled] = useState(false);
  
  //информация о пользователе
  const [userInfo, setUserInfo] = useState({});
  if (Object.keys(userInfo).length === 0) {
    getAuth((result) => {
        setUserInfo(result);
    });
  }

  const handleCollapsedChange = (checked) => {
    setCollapsed(checked);
  };

  const handleRtlChange = (checked) => {
    setRtl(checked);
    setLocale(checked ? 'en' : 'ru');
  };
  const handleImageChange = (checked) => {
    setImage(checked);
  };

  const handleToggleSidebar = (value) => {
    setToggled(value);
  };

  return (
    <div className={`app ${rtl ? 'rtl' : ''} ${toggled ? 'toggled' : ''}`}>
      <Aside
        image={image}
        collapsed={collapsed}
        rtl={rtl}
        toggled={toggled}
        handleToggleSidebar={handleToggleSidebar}
        handleCollapsedChange={handleCollapsedChange}
        setIsAuth={setIsAuth}
        userInfo={userInfo}
      />
      <Main
        image={image}
        toggled={toggled}
        collapsed={collapsed}
        rtl={rtl}
        handleToggleSidebar={handleToggleSidebar}
        handleRtlChange={handleRtlChange}
        handleImageChange={handleImageChange}
        userInfo={userInfo}
      />
    </div>
  );
}

export default Layout;
