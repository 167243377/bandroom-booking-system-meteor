this.Rooms = new Mongo.Collection('rooms');
Schemas.Rooms = new SimpleSchema({


    center: {


        type: String,


        label: '中心',


        allowedValues: function () {


            return Centers.find().map((center) => {


                return center._id;


            });


        },


        autoform: {


            options: function () {


                Meteor.subscribe('centers');


                return Centers.find().map((center) => {


                    return {


                        label: center.name + ' (' + center.address + ')',


                        value: center._id


                    };


                });


            }


        }


    },


    roomType: {


        type: String,


        label: '房間類型',


        allowedValues: function () {


            return RoomTypes.find().map((roomType) => {


                return roomType._id;


            });


        },


        autoform: {


            options: function () {


                Meteor.subscribe('roomTypes');


                return RoomTypes.find().map((roomType) => {


                    return {


                        label: roomType.description,


                        value: roomType._id


                    };


                });


            }


        }


    },


    description: {


        type: String,


        label: '房間資訊',


    },


    gears: {


        type: [String],


        label: '設備',


        optional: true


    },


    price: {


        type: Number,


        label: '每小時價錢',


        min: 0


    },


    images: {


        type: [String],


        optional: true,


        label: '相片',


    },


    "images.$": {


        autoform: {


            afFieldInput: {


                type: 'fileUpload',


                collection: 'Attachments',


                accept: 'image/*',


                label: 'Choose Image'


            }


        }


    },


    size: {


        type: Number,


        label: 'Size(尺)',


        optional: true,


        min: 0


    },


    canTeach: {


        type: Boolean,


        label: '可作教學用途',


    },


    hasKeyboard: {


        type: Boolean,


        label: '具備電子琴/鋼琴',


    },


    nonAvailablePeriod: {


        type: [Object],


        label: "暫停預約時間",


        optional: true


    },


    "nonAvailablePeriod.$.roomStatus": {


        type: String,


        label: '房間狀態',


        allowedValues: function () {


            return RoomStatus.find().map((roomStatu) => {


                return roomStatu._id;


            });


        },

        autoform: {

            options: function () {

                Meteor.subscribe('roomStatus');


                return RoomStatus.find().map((roomStatu) => {

                    return {


                        label: roomStatu.description,

                        value: roomStatu._id


                    };


                });

            }

        }

    },


    "nonAvailablePeriod.$.startDate": {


        type: Date,

        label: "開始時間"


    },


    "nonAvailablePeriod.$.endDate": {

        type: Date,

        label: "完結時間"


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


Rooms.attachSchema(Schemas.Rooms);


Rooms.helpers({


    centerName: function () {


        Meteor.subscribe('centers');


        var targetedCenter = Centers.findOne(this.center);


        return targetedCenter.name + ' (' + targetedCenter.address + ')';


    },


    roomTypeDesc: function () {


        Meteor.subscribe('roomTypes');


        var targetedRoomType = RoomTypes.findOne(this.roomType);


        return targetedRoomType.description;


    },


    roomStatusDesc: function () {


        Meteor.subscribe('roomStatus');


        var targetedRoomStatus = RoomStatus.findOne(this.roomStatus);


        return targetedRoomStatus.description;


    },


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

if(Meteor.isServer){
    var Api = new Restivus({
        prettyJson: true,
        defaultHeaders: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
    }); 

    Api.addRoute('rooms', {
        post: function() {
            var bodyParams = this.bodyParams;
            console.log(bodyParams);

            var district = Districts.findOne({
                code: bodyParams.districtCode
            })

            console.log(district);

            var centers = Centers.find({
                district: district._id
            }).fetch();

            var centerIds = [];

            centers.map((center) => {
                centerIds.push(center._id);
            })

            console.log(centerIds);

            var rooms = Rooms.find({
                center: { $in: centerIds }
            })

            console.log(rooms);

            return {
                status: 'success',
                data: rooms
            }
        }
    });
}