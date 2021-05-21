import React,{ useState,useEffect } from 'react';
import {getReportServerLink} from '../common.js';

function Web_OLAP_Client(props) {
  useEffect(() => {
    if (!!props.match.params) {
      const params={};
      params['cat_id']=props.match.params.cat_id;
      params['form_id']=props.match.params.form_id;
      if (!!props.match.params.params) {
        params['forDB']=props.match.params.params;
      }
      getReportServerLink(params,(url)=>{
          setSrc(url);
      });
      document.getElementById('olap_frame').style.height = window.innerHeight+'px';
    }

    return () => {
      //
    };
  }, [props.match.params.cat_id,props.match.params.form_id,props.match.params.params]);
  let [src, setSrc] = useState('');
  return (
    <div className="App" style={{margin:0,padding:0}}>
      <iframe id="olap_frame" src={src} style={{width:'100%',height:'100%',border:'none'}}></iframe>
    </div>
  );
}

export default Web_OLAP_Client;
