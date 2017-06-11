ProfilePictures.allow({
  insert: function (userId, doc) {
    return true;
  },
  update: function (userId, doc, fieldNames, modifier) {
    return true;
  },
  download: function (userId) {
    return true;
  }
});

Reservations.allow({
  insert: function (userId, doc) {
    return userId === doc.owner;
  },
  update: function (userId, doc, fields, modifier) {
    return userId === doc.owner;
  },
  remove: function (userId, doc) {
    return userId === doc.owner;
  }
});

Centers.allow({
  insert: function (userId, doc) {
    return userId === doc.owner;
  },
  update: function (userId, doc, fields, modifier) {
    return userId === doc.owner;
  },
  remove: function (userId, doc) {
    return userId === doc.owner;
  }
});

Rooms.allow({
  insert: function (userId, doc) {
    return userId === doc.owner;
  },
  update: function (userId, doc, fields, modifier) {
    return userId === doc.owner;
  },
  remove: function (userId, doc) {
    return userId === doc.owner;
  }
});

Districts.allow({
  insert: function (userId, doc) {
    return userId === doc.owner;
  },
  update: function (userId, doc, fields, modifier) {
    return userId === doc.owner;
  },
  remove: function (userId, doc) {
    return userId === doc.owner;
  }
});

RoomTypes.allow({
  insert: function (userId, doc) {
    return userId === doc.owner;
  },
  update: function (userId, doc, fields, modifier) {
    return userId === doc.owner;
  },
  remove: function (userId, doc) {
    return userId === doc.owner;
  }
});

RoomStatus.allow({
  insert: function (userId, doc) {
    return userId === doc.owner;
  },
  update: function (userId, doc, fields, modifier) {
    return userId === doc.owner;
  },
  remove: function (userId, doc) {
    return userId === doc.owner;
  }
});

Attachments.allow({
  insert: function (userId, doc) {
    return true;
  },
  update: function (userId, doc, fieldNames, modifier) {
    return true;
  },
  download: function () {
    return true;
  }
});

Meteor.users.allow({
  update: function (userId, doc, fieldNames, modifier) {
    if (userId === doc._id && !doc.username && fieldNames.length === 1 && fieldNames[0] === 'username') {
      return true;
    } else {
      return false;
    }
  }
});