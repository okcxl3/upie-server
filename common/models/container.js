// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: loopback-example-storage

// Now comes yet another crucial part, and this one isn’t documented very well.
// (Although I plan on doing some edits to the documentation soon!) To set up an API to handle file uploads, it needs a model.
//   As best as I can tell, the model only affects the process by giving a particular name to the API. It doesn’t do anything else.
// (Although see my notes at the bottom. I may be wrong about this.)
// So again, you can name this whatever you want, but I went with the name attachment.
//   Your model’s Base class will be “Model”, not “PersistedModel”, since you aren’t creating something that’s
// mapping to rows in a database or objects in a NoSQL db. (When you select your storage datasource, the CLI is smart enough to auto select “Model”.)
//https://loopback.io/doc/en/lb2/Storage-component.html#containers-and-files
//https://strongloop.com/strongblog/working-with-file-storage-and-loopback/


//Container groups files, similar to a directory or folder.
// A container defines the namespace for objects and is uniquely identified by its name, typically within a user account.
// NOTE: A container cannot have child containers.

module.exports = function(Container) {

};
