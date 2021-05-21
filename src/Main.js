import React,{ useState } from 'react';
import {Switch,Route} from 'react-router-dom'
import { useIntl } from 'react-intl';
//import SwitchR from 'react-switch';
import { CgMenuRound } from 'react-icons/cg';
import 'bootstrap/dist/css/bootstrap.min.css';

import rvkLogo from './assets/logo.png';

import Admin_users from './forms/admin/Users';
import Web_OLAP_Client from './forms/Web_OLAP_Client';
import CalcOLAP from './forms/CalcOLAP';
import {getAuth,getCheckRight} from './common.js';


const Main = ({
  collapsed,
  rtl,
  image,
  toggled,
  handleToggleSidebar,
  handleCollapsedChange,
  handleRtlChange,
  handleImageChange,
  userInfo
}) => {
  const intl = useIntl();


  const Home = () => (
    <div>
      <header>
        <h1>
          <img width={80} src={rvkLogo} alt="rosvodokanal logo" /> {intl.formatMessage({ id: 'title' })}
        </h1>
        <p>{intl.formatMessage({ id: 'description' })}</p>

      </header>

      {/*<div className="block">
        <SwitchR
          height={16}
          width={30}
          checkedIcon={false}
          uncheckedIcon={false}
          onChange={handleRtlChange}
          checked={rtl}
          onColor="#219de9"
          offColor="#bbbbbb"
        />
        <span> {intl.formatMessage({ id: 'rtl' })}</span>
      </div>
      <div className="block">
        <SwitchR
          height={16}
          width={30}
          checkedIcon={false}
          uncheckedIcon={false}
          onChange={handleImageChange}
          checked={image}
          onColor="#219de9"
          offColor="#bbbbbb"
        />
        <span> {intl.formatMessage({ id: 'image' })}</span>
      </div>*/}
    </div>
  )


  return (
    <main>

      <div className="btn-toggle" onClick={() => handleToggleSidebar(true)} title="Меню">
        <CgMenuRound />
      </div>

      <Switch>
        <Route exact path='/web_olap_client/:cat_id/:form_id' component={Web_OLAP_Client}/>
        <Route exact path='/web_olap_client/:cat_id/:form_id/:params' component={Web_OLAP_Client}/>
      </Switch>
      <Switch>
          <Route exact path='/admin' component={Admin_users}/>
      </Switch>
      <Switch>
          <Route exact path='/calc_olap' component={CalcOLAP}/>
     </Switch>

      <footer>
        <small>
          © 2021 WEB-OLAP
        </small>
        <br />
        <div className="social-bagdes">
          При наличии ошибок и пожеланий писать в WatsAPP +79204452901
        </div>
      </footer>
    </main>
  );
};

export default Main;
