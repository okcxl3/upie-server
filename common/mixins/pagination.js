module.exports = function(Model, options) {
  Model.findWithPage = function(filter = {},pageNumber = 1,pageSize = 10){
    return new Promise((resolve,reject)=>{
      if (!(filter && typeof filter === 'object')) filter = {};
      if (!pageNumber) pageNumber = 1;
      if (!pageSize) pageSize = 10;
      // if (pageSize === 0) return resolve([]);
      if (pageNumber < 0) {
        const err = new Error('pageNumber cannot be a negative number');
        err.statusCode = 400;
        return reject(err);
      }
      if (pageSize < 0){
        const err = new Error('pageSize cannot be a negative number');
        err.statusCode = 400;
        return reject(err);
      }
      const limit = pageSize;
      const skip = limit * (pageNumber - 1);
      filter = {...filter,limit,skip};
      Model.find(filter,(err,instances)=>{
        if (err) return reject(err);
        if (!instances) instances = [];
        resolve(instances);
      });
    });
  }
};
