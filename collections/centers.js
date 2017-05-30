this.Centers = new Mongo.Collection('centers');

Schemas.Centers = new SimpleSchema({
  name: {
    type: String,
    label: '中心名稱',
    max: 255
  },
  address: {
    type: String,
    label: '中心地址',
    max: 255
  },
  contactNumber: {
    type: String,
    label: '聯絡電話',
    max: 8,
    min: 8,
    custom: function () {
      console.log(this.field('contactNumber'));
    }
  },
  contactEmail: {
    type: String,
    label: '聯絡電郵',
    optional: true,
    max: 30
  },
  district: {
    type: String,
    label: '地區',
    allowedValues: function () {
      return Districts.find().map((district) => {
        return district._id;
      });
    },
    autoform: {
      options: function () {

        Meteor.subscribe('districts');

        return Districts.find().map((district) => {
          return {
            label: district.description,
            value: district._id
          };
        });

      }
    }
  },
  location: {
    type: Object,
    optional: true,
    autoform: {
      type: 'map',
      lable: "地圖",
      afFieldInput: {
        key: 'AIzaSyBA0f2XF7LxvhS-8ZZZtlex40s9fV8pw_0',
        zoom: 8,
        geolocation: true
      }
    }
  },
  'location.lat': {
    type: Number,
    decimal: true
  },
  'location.lng': {
    type: Number,
    decimal: true
  },
  businessHours: {
    type: [Object],
    label: "營業時間",
    maxCount: 1
  },
  "businessHours.$.sunday": {
    type: Object,
    label: "星期日"
  },
  "businessHours.$.sunday.isOpen": {
    type: Boolean,
    label: '營業日'
  },
  "businessHours.$.sunday.startTime": {
    type: String,
    label: '開門時間',
    autoform: {
      type: 'time'
    }
  },
  "businessHours.$.sunday.endTime": {
    type: String,
    label: '關門時間',
    autoform: {
      type: 'time'
    }
  },
  "businessHours.$.monday": {
    type: Object,
    label: "星期一"
  },
  "businessHours.$.monday.isOpen": {
    type: Boolean,
    label: '營業天'
  },
  "businessHours.$.monday.startTime": {
    type: Boolean,
    label: '開門時間'
  },
  "businessHours.$.monday.endTime": {
    type: Boolean,
    label: '關門時間'
  },
  "businessHours.$.tuesday": {
    type: Object,
    label: "星期二"
  },
  "businessHours.$.tuesday.isOpen": {
    type: Boolean,
    label: '營業天'
  },
  "businessHours.$.tuesday.startTime": {
    type: Boolean,
    label: '開門時間'
  },
  "businessHours.$.tuesday.endTime": {
    type: Boolean,
    label: '關門時間'
  },
  "businessHours.$.wednesday": {
    type: Object,
    label: "星期三"
  },
  "businessHours.$.wednesday.isOpen": {
    type: Boolean,
    label: '營業天'
  },
  "businessHours.$.wednesday.startTime": {
    type: Boolean,
    label: '開門時間'
  },
  "businessHours.$.wednesday.endTime": {
    type: Boolean,
    label: '關門時間'
  },
  "businessHours.$.thursday": {
    type: Object,
    label: "星期四"
  },
  "businessHours.$.thursday.isOpen": {
    type: Boolean,
    label: '營業天'
  },
  "businessHours.$.thursday.startTime": {
    type: Boolean,
    label: '開門時間'
  },
  "businessHours.$.thursday.endTime": {
    type: Boolean,
    label: '關門時間'
  },
  "businessHours.$.friday": {
    type: Object,
    label: "星期五"
  },
  "businessHours.$.friday.isOpen": {
    type: Boolean,
    label: '營業天'
  },
  "businessHours.$.friday.startTime": {
    type: Boolean,
    label: '開門時間'
  },
  "businessHours.$.friday.endTime": {
    type: Boolean,
    label: '關門時間'
  },
  "businessHours.$.saturday": {
    type: Object,
    label: "星期六"
  },
  "businessHours.$.saturday.isOpen": {
    type: Boolean,
    label: '營業天'
  },
  "businessHours.$.saturday.startTime": {
    type: Boolean,
    label: '開門時間'
  },
  "businessHours.$.saturday.endTime": {
    type: Boolean,
    label: '關門時間'
  },
  createdAt: {
    type: Date,
    autoValue: function () {
      if (this.isInsert) {
        return new Date();
      }
    }
  },
  updatedAt: {
    type: Date,
    optional: true,
    autoValue: function () {
      if (this.isUpdate) {
        return new Date();
      }
    }
  },
  owner: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    autoValue: function () {
      if (this.isInsert) {
        return Meteor.userId();
      }
    },
    autoform: {
      options: function () {
        return _.map(Meteor.users.find().fetch(), function (user) {
          return {
            label: user.emails[0].address,
            value: user._id
          };
        });
      }
    }
  }
});

Centers.attachSchema(Schemas.Centers);

SimpleSchema.messages({
  "timeValueIsInvalid": "時間格式為 hh:mm (E.g: 10:00, 22:00)"
})

Centers.helpers({
  author: function () {
    var ref, ref1, ref2, user;
    user = Meteor.users.findOne(this.owner);
    if (((user != null ? (ref = user.profile) != null ? ref.firstName : void 0 : void 0) != null) && (user != null ? (ref1 = user.profile) != null ? ref1.lastName : void 0 : void 0)) {
      return user.profile.firstName + ' ' + user.profile.lastName;
    } else {
      return user != null ? (ref2 = user.emails) != null ? ref2[0].address : void 0 : void 0;
    }
  }
});

function isValidTimeFormat(timeValue) {
  var isVaild = false;

  console.log(timeValue);

  var patt = new RegExp('^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$');
  isVaild = patt.test(timeValue);

  return isVaild;
}