const config = require('../../server/config.json');
const path = require('path');
//Replace this address with your actual address
const senderAddress = 'noreply@loopback.com';

const ACCESS_TOKEN_TTL_MOBILE_APP = 4838400;     //TODO 5184000 seconds = two months time-to-live
const ACCESS_TOKEN_TTL_WEB_APP = 604800;         //TODO one week time-to-live

function getFilename(uploadingFile) {
  const userId = (this + '_') || '';
  const timestamp = Date.now();
  const random = Math.random().toString().substr(2,3);
  const {name} = uploadingFile;
  const ext = name.substr(name.indexOf('.')+1);
  return `${userId}avatar_${timestamp}_${random}.${ext}`;
}

module.exports = function(User) {
  User.beforeRemote('login', function(ctx,modelInstance,next){
    const {headers} = ctx.req;
    const isMobile = (!!headers['x-client'] || !!headers['X-Client']) && (headers['x-client'] || headers['X-Client']) === 'mobile';
    ctx.args.credentials.ttl = isMobile ? ACCESS_TOKEN_TTL_MOBILE_APP : ACCESS_TOKEN_TTL_WEB_APP;
    next();
  });

  User.afterRemote('login', function(context, remoteMethodOutput, next) {
    User.findById(context.result.userId,(err,userData)=>{
      if (err) next(err);
      if (!userData) {
        err = new Error("No user data found");
        err.statusCode = 401;
        err.code = "LOGIN_FAILED";
        next(err);
      }else{
        context.result.userData = userData;
        next();
      }
    });
  });

  //send verification email after registration
  User.afterRemote('create', function(context, user, next) {
    var options = {
      type: 'email',
      to: user.email,
      from: senderAddress,
      subject: 'Thanks for registering.',
      template: path.resolve(__dirname, '../../server/views/verify.ejs'),
      redirect: '/verified',
      user: user
    };

    user.verify(options, function(err, response) {
      if (err) {
        User.deleteById(user.id);
        return next(err);
      }
      context.res.render('response', {
        title: 'Signed up successfully',
        content: 'Please check your email and click on the verification link ' +
        'before logging in.',
        redirectTo: '/',
        redirectToLinkText: 'Log in'
      });
    });
  });

  // Method to render
  User.afterRemote('prototype.verify', function(context, user, next) {
    context.res.render('response', {
      title: 'A Link to reverify your identity has been sent '+
      'to your email successfully',
      content: 'Please check your email and click on the verification link '+
      'before logging in',
      redirectTo: '/',
      redirectToLinkText: 'Log in'
    });
  });

  //send password reset link when requested
  User.on('resetPasswordRequest', function(info) {
    var url = 'http://' + config.host + ':' + config.port + '/reset-password';
    var html = 'Click <a href="' + url + '?access_token=' +
      info.accessToken.id + '">here</a> to reset your password';

    User.app.models.Email.send({
      to: info.email,
      from: senderAddress,
      subject: 'Password reset',
      html: html
    }, function(err) {
      if (err) return console.log('> error sending password reset email');
      console.log('> sending password reset email to:', info.email);
    });
  });

  //render UI page after password change
  User.afterRemote('changePassword', function(context, user, next) {
    context.res.render('response', {
      title: 'Password changed successfully',
      content: 'Please login again with new password',
      redirectTo: '/',
      redirectToLinkText: 'Log in'
    });
  });

  //render UI page after password reset
  User.afterRemote('setPassword', function(context, user, next) {
    context.res.render('response', {
      title: 'Password reset success',
      content: 'Your password has been reset successfully',
      redirectTo: '/',
      redirectToLinkText: 'Log in'
    });
  });

  User.uploadAvatar = function(ctx,cb) {
    const {Container} = User.app.models;
    const userId = ctx.req.accessToken.userId.toString();
    // const form = new formidable.IncomingForm();
    // form.parse(ctx.req, function(err, fields, files) {
    //   console.log("err",err);
    //   console.log("fields",fields);
    //   console.log("files",files);
    // });

    Container.getContainer(userId).catch(err=>{
      if (err.status === 404 || err.statusCode === 404) {
        console.log('container not found,create a new container');
        return Container.createContainer({name:userId});
      }
      return Promise.reject(err);
    }).then(res=>{
      //res is the newly created container,
      // or a pre-existing container
      return Container.upload(
        userId,
        ctx.req,
        ctx.res,
        {
          getFilename : getFilename.bind(userId),
          allowedContentTypes: ['image/jpg', 'image/jpeg', 'image/png']
        });
    }).then(res=>{
      const {file0:file} = res.files;
      const dir = User.app.dataSources.storage.connector.client.root.substr(1);
      const avatarUrl = `${dir}/${file[0]['container']}/${file[0]['name']}`;
      User.updateAll({id: userId}, {'avatar-url': avatarUrl}, (err,info)=>{
        if (err) cb(err);
        if (info.count <= 0) {
          const error = new Error('update Failed');
          error.statusCode = 401;
          cb(error);
        }
        else {
          cb(null,avatarUrl);
        }
      });
    }).catch(err=>{
      console.log(err);
      cb(err);
    });
  };

  User.remoteMethod(
    'uploadAvatar',
    {
      accepts: [{ arg: 'ctx', type: 'object', http: { source: 'context' } }],
      http: {path: '/uploadAvatar', verb: 'post', status: 201},
      returns: {arg: 'avatarUrl', type: 'string'}
    }
  );

  User.getUsersWithPage = function(filter,pageNumber,pageSize,cb){
    User.findWithPage(filter,pageNumber,pageSize).then(res=>{
      cb(null,{result:res});
    }).catch(err=>cb(err));
  };

  User.remoteMethod(
    'getUsersWithPage',
    {
      accepts: [
        {arg: 'filter',type: 'object'},
        {arg: 'pageNumber', type: 'number'},
        {arg: 'pageSize', type:'number'}
      ],
      http: {path: '/getUsersWithPage', verb: 'get', status: 200},
      returns: [
        {arg:'result',type:'array'}
      ]
    }
  );

};
