import React, { useState } from 'react';
import {HashRouter} from 'react-router-dom'
import { IntlProvider } from 'react-intl';
import Layout from './Layout';
import messages from './messages';
import './styles/App.scss';
import Enter from './Enter'
import {getAuthorization} from './system.js';;

function App() {
  const [locale, setLocale] = useState('ru');
  const [isAuth, setIsAuth] = useState(getAuthorization());
  const caseStatus=function() {
      if (isAuth) {
        return (
          <HashRouter>
            <Layout setLocale={setLocale}  setIsAuth={setIsAuth}/>
          </HashRouter>
        );
      }
      else {
        return (
          <HashRouter>
            <Enter setIsAuth={setIsAuth}/>
          </HashRouter>
        );
      }
  }
  return (
    <IntlProvider locale={locale} messages={messages[locale]}>
      {caseStatus()}
    </IntlProvider>
  );
}

export default App;
