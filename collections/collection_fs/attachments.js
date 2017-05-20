this.Attachments = new FS.Collection("Attachments", {
  stores: [
    new FS.Store.GridFS("attachments", {
      transformWrite: function (fileObj, readStream, writeStream) {
        return readStream.pipe(writeStream);
      }
    })
  ],
  filter: {
    allow: {
      contentTypes: ['image/*'] //allow only images in this FS.Collection
    }
  },
  onInvalid: function (message) {
    if (Meteor.isClient) {
      alert(message);
    } else {
      console.log(message);
    }
  }
});