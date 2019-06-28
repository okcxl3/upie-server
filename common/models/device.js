'use strict';

module.exports = function(Device) {
  Device.validatesUniquenessOf('deviceId', {message: 'The device is already registered.'});
  Device.validatesLengthOf('deviceId', {min: 20, message: {min: 'The device identifier is too short'}});
  Device.validatesInclusionOf('deviceOS', {in: ['ios', 'android']});

  Device.findDeviceByUserId = function(userIdArr){
    return new Promise((resolve,reject)=>{
      if (!(Array.isArray(userIdArr) && userIdArr.length > 0)) resolve([]);
      Device.find(
        {where:{userId:{inq:userIdArr},appCenterToken:{nin:['',undefined,null]}}},
        (err,instances)=>{
          if (err) reject(err);
          if (!instances) instances = [];
          resolve(instances);
        }
      );
    });
  };


  Device.beforeRemote('registerDevice',(ctx,instance,cb)=>{
    const {headers} = ctx.req;
    // const isMobile = (!!headers['x-client'] || !!headers['X-Client']) && (headers['x-client'] || headers['X-Client']) === 'mobile';
    const isMobile = true;    //todo uncomment
    if (!isMobile){
      const err = new Error('not mobile');
      err.statusCode = 400;
      cb(err);
      return;
    }
    let {
      deviceId,appCenterToken,isPushEnabled,deviceOS,
      deviceManufacturer,deviceModel,deviceVersion,deviceName,deviceLocale,deviceCountry} = ctx.args;
    if (!deviceId || !appCenterToken || !deviceOS) {
      const err = new Error('no device Id || no app center token || unknown OS');
      err.statusCode = 400;
      cb(err);
      return;
    }
    const data = {deviceId,appCenterToken,deviceOS};
    data.deviceManufacturer = deviceManufacturer ? deviceManufacturer.toString() : '';
    data.deviceModel = deviceModel ? deviceModel.toString() : '';
    data.deviceVersion = deviceVersion ? deviceVersion.toString() : '';
    data.deviceName = deviceName ? deviceName.toString() : '';
    data.deviceLocale = deviceLocale ? deviceLocale.toString() : '';
    data.deviceCountry = deviceCountry ? deviceCountry.toString() : '';
    ctx.args = {
      ...ctx.args,
      ...data
    };
    cb();
  });

  Device.registerDevice = function(
    req,
    deviceId,appCenterToken,isPushEnabled,deviceOS,
    deviceManufacturer,deviceModel,deviceVersion,deviceName,deviceLocale,deviceCountry,cb){
    const userId = req.accessToken ? req.accessToken.userId.toString() : '';
    const data = {
      userId,appCenterToken,isPushEnabled,deviceOS,
      deviceManufacturer,deviceModel,deviceVersion,deviceName,deviceLocale,deviceCountry};
    Device.findOne({where:{deviceId}},(error,device)=>{
      if (error) {
        cb(error);
        return;
      }
      if (device){
        const {
          userId : _userId,
          appCenterToken : _appCenterToken,
          isPushEnabled : _isPushEnabled,
          deviceOS : _deviceOS,
          deviceManufacturer : _deviceManufacturer,
          deviceModel : _deviceModel,
          deviceVersion : _deviceVersion,
          deviceName : _deviceName,
          deviceLocale : _deviceLocale,
          deviceCountry : _deviceCountry
        } = device;
        if (
          userId !== _userId ||
          appCenterToken !== _appCenterToken ||
          isPushEnabled !== _isPushEnabled ||
          deviceOS !== _deviceOS ||
          deviceManufacturer !== _deviceManufacturer ||
          deviceModel !== _deviceModel ||
          deviceVersion !== _deviceVersion ||
          deviceLocale !== _deviceLocale ||
          deviceCountry !== _deviceCountry ||
          deviceName !== _deviceName
        ){
          device.updateAttributes(data,(err,instance)=>{
            console.log('update device');
            if (err) {
              cb(err);
              return;
            }
            cb(null,instance);
          });
        }else{
          console.log('no update device');
          cb(null,device);
        }
      }else{
        data.deviceId = deviceId;
        Device.create(data,(err,instance)=>{
          console.log('insert new device');
          if (err) {
            cb(err);
            return;
          }
          if (!instance){
            err = new Error("");
            err.statusCode = 500;
            cb(err);
          }else{
            cb(null,instance);
          }
        });
      }
    });
  };

  Device.remoteMethod(
    'registerDevice',
    {
      accepts: [
        {arg: 'req', type: 'object', http: { source: 'req' } },
        {arg:'deviceId',type:'string'},
        {arg:'appCenterToken',type:'string'},
        {arg:'isPushEnabled',type:'boolean',default:false},
        {arg:'deviceOS',type:'string'},
        {arg:'deviceManufacturer',type:'string',default:''},
        {arg:'deviceModel',type:'string',default:''},
        {arg:'deviceVersion',type:'string',default:''},
        {arg:'deviceName',type:'string',default:''},
        {arg:'deviceLocale',type:'string',default:''},
        {arg:'deviceCountry',type:'string',default:''}
        ],
      http: {path: '/registerDevice', verb: 'post', status: 201},
      returns: {arg: 'device', type: 'object'}
    }
  );
};
