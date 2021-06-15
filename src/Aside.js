import React from 'react';
import {Link} from 'react-router-dom'
import { useIntl } from 'react-intl';
import {
  ProSidebar,
  Menu,
  MenuItem,
  SubMenu,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
} from 'react-pro-sidebar';
import { FcHome } from 'react-icons/fc';
import { AiOutlineBank,AiOutlineColumnWidth } from 'react-icons/ai';
import { CgCloseR } from 'react-icons/cg';
import { GiExitDoor } from 'react-icons/gi';

import sidebarBg from './img/logo.png';

import {delAuth,getCheckRight} from './system.js';

const Aside = ({ image, collapsed, rtl, toggled, handleToggleSidebar,handleCollapsedChange,setIsAuth,userInfo }) => {
  const intl = useIntl();
  const op_cl_menu_icon=function(){
    if (collapsed) {
      return (<AiOutlineColumnWidth/>);
    }
    else {
        return (<CgCloseR/>);
    }
  };
  const exitF=()=>{
      delAuth(false);
      setIsAuth(false);
  }

  return (
    <ProSidebar
      image={image ? sidebarBg : false}
      rtl={rtl}
      collapsed={collapsed}
      toggled={toggled}
      breakPoint="md"
      onToggle={handleToggleSidebar}
    >
      <SidebarHeader>
        <div
          style={{
            padding: '24px',
            textTransform: 'uppercase',
            fontWeight: 'bold',
            fontSize: 14,
            letterSpacing: '1px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          <Link to='/'>
            <FcHome/>
          </Link>
          {intl.formatMessage({ id: 'sidebarTitle' })}
          <div className="menu-close" onClick={()=>handleCollapsedChange(!collapsed)}>
              {op_cl_menu_icon()}
          </div>

        </div>
      </SidebarHeader>

      <SidebarContent>
        <Menu iconShape="circle">
          <MenuItem>Администрирование OLAP
            <Link to='/admin'/>
          </MenuItem>
          <MenuItem>Пример Web-OLAP компонента
            <Link to='/calc_olap'/>
          </MenuItem>
          <MenuItem onClick={()=>exitF()} icon={<GiExitDoor/>}>
            {intl.formatMessage({ id: 'exit' })}
          </MenuItem>
        </Menu>
      </SidebarContent>

      <SidebarFooter style={{ textAlign: 'center' }}>
        <div
          className="sidebar-btn-wrapper"
          style={{
            padding: '20px 24px',
          }}
        >
          <a
            href="https://web-olap.ru/"
            target="_blank"
            className="sidebar-btn"
            rel="noopener noreferrer"
          >
            <span>web-olap.ru</span>
          </a>
        </div>
      </SidebarFooter>
    </ProSidebar>
  );
};

export default Aside;
