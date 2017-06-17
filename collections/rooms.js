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

if (Meteor.isServer) {
    var Api = new Restivus({
        prettyJson: true,
        defaultHeaders: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
    });

    Api.addRoute('rooms', {
        post: function () {

            var allRooms = Rooms.find().fetch();

            var bodyParams = this.bodyParams;
            console.log(bodyParams);

            var searchResultRooms = [];

            allRooms.forEach(currentRoom => {
                var currentRoomRoomType = RoomTypes.findOne(currentRoom.roomType);
                var currentRoomCenter = Centers.findOne(currentRoom.center);
                var currentRoomDistrict = Districts.findOne(currentRoomCenter.district);

                // { districtCode: string,                                                                                                                                                                                    
                //   roomTypeCode: string,                                                                                                                                                                                      
                //   people: number,                                                                                                                                                                                            
                //   searchDate: string ,                                                                                                                                                                                        
                //   priceRange: { lower: integer, upper: integer },                                                                                                                                                                  
                //   canUseAsTeaching: boolean
                //   keyboardRequired: boolean }  

                console.log('current Room');
                console.log(currentRoom);

                if (!isNullOrEmpty(bodyParams.districtCode)) {
                    var searchDistrict = Districts.findOne({
                        code: bodyParams.districtCode
                    })

                    if (currentRoomDistrict._id !== searchDistrict._id) {
                        console.log('return in district')
                        return;
                    }
                }

                if (!isNullOrEmpty(bodyParams.roomTypeCode)) {
                    var searchRoomType = RoomTypes.findOne({
                        code: bodyParams.roomTypeCode
                    })

                    if (currentRoomRoomType._id !== searchRoomType._id) {
                        console.log('return in roomTypeCode')
                        return;
                    }
                }

                if (!isNullOrEmpty(bodyParams.people)) {
                    if (Number(bodyParams.people) > currentRoom.people) {
                        console.log('return in people')
                        return;
                    }
                }

                if (currentRoom.price < Number(bodyParams.priceRange.lower)) {
                    console.log('return in priceRange lower')
                    return;
                }// 100 < 50 = false (OK), 30 < 50 = true (Not OK)

                if (currentRoom.price > Number(bodyParams.priceRange.upper)) {
                    console.log('return in priceRange upper')
                    return;
                }

                if (bodyParams.canUseAsTeaching) {
                    if (!currentRoom.canTeach) {
                        console.log('return in canUseAsTeaching')
                        return;
                    }
                }

                if (bodyParams.keyboardRequired) {
                    if (!currentRoom.hasKeyboard) {
                        console.log('return in keyboardRequired')
                        return;
                    }
                }


                var images = [];

                if (!isNullOrEmpty(currentRoom.images)) {
                    console.log(currentRoom.images);

                    currentRoom.images.forEach(image => {
                        images.push(image.toString('base64'));
                    })
                }

                var searchResultRoom = {
                    id: currentRoom._id,
                    districtDescription: currentRoomDistrict.description,
                    roomTypeDescription: currentRoomRoomType.description,
                    price: currentRoom.price,
                    images: images
                }

                console.log('pushed');
                searchResultRooms.push(searchResultRoom);
            })

            console.log('after forEach');
            console.log(searchResultRooms);


            // if (false) {

            //     /////////////////////////////////////////////

            //     if (bodyParams.districtCode) {
            //         //search by district
            //         var district = Districts.findOne({
            //             code: bodyParams.districtCode
            //         })

            //         var centers = Centers.find({
            //             district: district._id
            //         }).fetch();

            //         // if there is any centers found in this district
            //         if (centers.length > 0) {

            //             var centerIds = [];

            //             for (var i = 0; i < centers.length; i++) {
            //                 centerIds.push(centers[i]._id);
            //             }

            //             console.log(centerIds);

            //             roomCursor = roomCursor.find({
            //                 center: { $in: centerIds }
            //             })

            //             // console.log('rooms');
            //             // console.log(rooms);

            //             // rooms.forEach((room) => {
            //             //     resultRooms.push(room);
            //             // });
            //         }
            //     }

            //     var searchResultRooms = [];

            //     // all filtered rooms are here, loop into an arrary, then return 
            //     roomCursor.fetch().forEach(room => {
            //         searchResultRooms.push(room);
            //     });
            // }

            return {
                status: 'success',
                data: JSON.stringify(searchResultRooms)
            }
        }
    })

    Api.addRoute('rooms/:id', {
        get: function () {
            var roomId = this.urlParams.id;

            var room = Rooms.findOne(roomId);
            var center = Centers.findOne(room.center);
            var district = Districts.findOne(center.district);
            var roomType = RoomTypes.findOne(room.roomType);

            var today = new Date();
            today.setHours(0, 0, 0, 0);

            var todayISOString = toLocaleISOString(today);
            //find all reservations for this room
            var bookedReservations = Reservations.find({
                room: room._id,
                status: { $in: ["To Be Started", "Closed"] },
                startDateTime: { $gte: todayISOString }
            }).fetch()

            console.log(bookedReservations);

            var bookedPeriods = [];

            bookedReservations.map(bookedReservation =>{
                var period = {
                    startDateTime: bookedReservation.startDateTime,
                    endDateTime: bookedReservation.endDateTime
                }

                bookedPeriods.push(period);
            });

            console.log(bookedPeriods);

            var resultRoom = {
                _id: roomId,
                center: {
                    name: center.name,
                    address: center.address,
                    contactNumber: center.contactNumber,
                    district: {
                        code: district.code,
                        description: district.description
                    },
                    lat: center.location.lat,
                    lngi: center.location.lng,
                    nonAvailablePeriod: room.nonAvailablePeriod
                },
                description: room.description,
                price: room.price,
                images: room.images,
                gears: room.gears,
                roomType: {
                    code: roomType.code,
                    description: roomType.description
                },
                canTeach: room.canTeach,
                hasKeyboard: room.hasKeyboard,
                roomNonAvailablePeriod: room.nonAvailablePeriod,
                bookedPeriods: bookedPeriods,
                businessHours: room.businessHours
            }

            return {
                status: 'success',
                data: JSON.stringify(resultRoom)
            }

        }
    })

    Api.addRoute('favoriteRooms', {
        post: function () {

            console.log('POST /api/favoriteRooms');
            console.log(this.bodyParams);

            var favoriteRoomIds = this.bodyParams.favoriteRoomIds;

            var resultRooms = [];

            if (Array.isArray(favoriteRoomIds)) {

                var rooms = Rooms.find(
                    {
                        _id: {
                            $in: favoriteRoomIds
                        }
                    }
                )

                rooms.fetch().forEach(room => {



                    var resultRoom = [];

                    var center = Centers.findOne(room.center);

                    resultRoom = {
                        _id: room._id,
                        centerName: center.name,
                        images: room.images,
                        description: room.description,
                    }
                    resultRooms.push(resultRoom);
                })

            }

            return {
                status: 'success',
                data: JSON.stringify(resultRooms)
            }

        }
    })
}

function isNullOrEmpty(str) {
    if (str == null || str == undefined) {
        return true;
    }

    if (str == "") {
        return true;
    }

    return false;
}

function toLocaleISOString(date) {
    var tzoffset = date.getTimezoneOffset() * 60000; //offset in milliseconds
    var localISOString = new Date(date - tzoffset).toISOString().slice(0, -1);
    return localISOString;
}