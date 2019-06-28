const fetch = require('node-fetch');
const {X_API_TOKEN,IOS_PUSH_URL,ANDROID_PUSH_URL,getEnvironment} = require("../../globalConfig");
const env = getEnvironment(process.env.NODE_ENV);
const xApiToken = X_API_TOKEN[env];
const iosPushUrl = IOS_PUSH_URL[env];
const androidPushUrl = ANDROID_PUSH_URL[env];

module.exports = function(PushNotification) {

  /************************
   **                    **
   **   unexposed APIs   **
   **                    **
   ************************/

  PushNotification.pushToUsers = function(
    userIdArr = [],
    title = '',
    content = '',
    optionalData = null,
    isSilent = false){
    return PushNotification.app.models.Device.findDeviceByUserId(userIdArr).then(deviceArr=>{
      if (deviceArr.length <= 0) {
        const err = new Error('no user devices found');
        err.statusCode = 400;
        return Promise.reject(err);
      }
      const iosTokenArr = [];
      const androidTokenArr = [];
      deviceArr.forEach(device=>{
        const {appCenterToken,deviceOS,isPushEnabled} = device;
        if (!appCenterToken) return false;
        // if (!isPushEnabled) return false;
        deviceOS === 'ios' ? iosTokenArr.push(appCenterToken) : androidTokenArr.push(appCenterToken);
      });
      const postData = getPostData(title,content,optionalData,isSilent);
      if (iosTokenArr.length <= 0 && androidTokenArr.length <= 0){
        const err = new Error('no pushable devices');
        err.statusCode = 400;
        return Promise.reject(err);
      }
      let iosPushPromise = null;
      let androidPushPromise = null;
      if (iosTokenArr.length > 0) iosPushPromise = PushNotification.push(postData,'ios',iosTokenArr);
      if (androidTokenArr.length > 0) androidPushPromise = PushNotification.push(postData,'android',androidTokenArr);
      return Promise.all([iosPushPromise,androidPushPromise]).then(([iosPushResponse,androidPushResponse])=>{
        return {iosPushResponse,androidPushResponse};
      });
    });
  };

  PushNotification.pushToAllUsers = function(
    title = '',
    content = '',
    optionalData = null,
    isSilent = false){
    const postData = getPostData(title,content,optionalData,isSilent);
    postData['notification_target'] = null;
    const iosPushPromise = PushNotification.push(postData,'ios');
    const androidPushPromise = PushNotification.push(postData,'android');
    return Promise.all([iosPushPromise,androidPushPromise]).then(([iosPushResponse,androidPushResponse])=>{
      return {iosPushResponse,androidPushResponse};
    });
  };

  PushNotification.push = function(postData,os,appCenterTokenArr){
    if (appCenterTokenArr){
      postData['notification_target']['devices'] = appCenterTokenArr;
    }
    let fetchConfig = {
      method: 'POST',
      headers: {Accept: 'application/json', 'Content-Type': 'application/json', 'X-API-Token': xApiToken},
      body: JSON.stringify(postData)
    };
    const url = os === 'ios' ? iosPushUrl : androidPushUrl;
    return fetch(url, fetchConfig).then(res=> res.json()).then(res=>{
      os === 'ios' ? console.log('ios push response',res) : console.log('android push response',res);
      return res;
    }).catch(err=>{
      err.statusCode = 400;
      os === 'ios' ? console.log('ios push err',err) : console.log('android push err',err);
      return Promise.reject(err);
    });
  };


  /*******************
   *               *
   *   调试接口   *
   *           *
   *         *
   *       *
   *     *
   *   *
   * *
   */

  PushNotification.testPushToUsers = function(userIdArr,title,content,optionalData,isSilent,cb){
    PushNotification.pushToUsers(userIdArr,title,content,optionalData,isSilent).then(({iosPushResponse,androidPushResponse})=>{
      cb(null,{iosPushResponse,androidPushResponse});
    }).catch(err=>{
      cb(err);
    });
  };

  PushNotification.testPushToAllUsers = function(title,content,optionalData,isSilent,cb){
    PushNotification.pushToAllUsers(title,content,optionalData,isSilent).then(({iosPushResponse,androidPushResponse})=>{
      cb(null,{iosPushResponse,androidPushResponse});
    }).catch(err=>{
      cb(err);
    });
  };

  PushNotification.remoteMethod(
    'testPushToUsers',
    {
      accepts: [
        {arg: 'userIdArr', type: 'array'},
        {arg: 'title', type: 'string', default:'title'},
        {arg: 'content', type: 'string', default:'content' },
        {arg: 'optionalData', type: 'object', default:{} },
        {arg: 'isSilent', type:'boolean', default : false}
      ],
      http: {path: '/testPushToUsers', verb: 'post', status: 201},
      returns: [
        {arg:'iosPushResponse',type:'object'},
        {arg:'androidPushResponse',type:'object'}
      ]
    }
  );

  PushNotification.remoteMethod(
    'testPushToAllUsers',
    {
      accepts: [
        {arg: 'title', type: 'string', default:'title'},
        {arg: 'content', type: 'string', default:'content' },
        {arg: 'optionalData', type: 'object'},
        {arg: 'isSilent', type:'boolean', default : false}
      ],
      http: {path: '/testPushToAllUsers', verb: 'post', status: 201},
      returns: [
        {arg:'iosPushResponse',type:'object'},
        {arg:'androidPushResponse',type:'object'}
      ]
    }
  );
};

function getPostData(title,content,optionalData,isSilent){
  const postData = {
    notification_content : {
      name: 'Message from ApptMazter',
      title: title ? title : '',
      body: content ? content : '',
      custom_data : {badge:1,sound:'default'}
    },
    notification_target : {
      type: "devices_target",
      devices: []
    }
  };

  if (optionalData && Object.keys(optionalData).length > 0){
    Object.entries(optionalData).forEach(item=>{
      postData['notification_content']['custom_data'][item[0]+''] = item[1];
    });
  }
  if (isSilent){
    postData['notification_content']['title'] = '';
    postData['notification_content']['body'] = '';
    postData['notification_content']['custom_data'].badge = 0;
    postData['notification_content']['custom_data'].sound = '';
  }
  return postData;
}
