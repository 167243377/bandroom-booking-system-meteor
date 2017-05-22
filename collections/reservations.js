this.Reservations = new Mongo.Collection('reservations');

SimpleSchema.debug = true

Schemas.Reservations = new SimpleSchema({
    room: {
        type: String,
        label: '房間',
        allowedValues: function () {
            return Rooms.find().map((room) => {
                return room._id;
            });
        },
        autoform: {
            options: function () {

                Meteor.subscribe('centers');
                Meteor.subscribe('rooms');

                return Rooms.find().map((room) => {

                    var targetedCenter = Centers.findOne(room.center);

                    return {
                        label: targetedCenter.name + ' - ' + room.description + '',
                        value: room._id
                    };
                    // })
                });
            }
        }
    },
    startDateTime: {
        type: String,
        label: '開始時間',
        autoform: {
            type: 'datetime-local',
        },
        custom: function () {

            if (new Date(this.value).getMinutes() % 15 != 0) {
                //not in a 15 mintues period
                return "dateTimeMustbeIn15MintuesTimeSlot";
            }

            // if (new Date(this.value) <= new Date()) {
            //     return "startTimeMustBeGreaterThanNow";
            // }

            // if (this._id !== reservation._id) {
            //     //same room
            //     //then check whether the time has already been booked.
            //     if (new Date(reservation.endDateTime) > new Date(this.field('startDateTime').value)) {
            //         console.log('come1');
            //         //endDateTime = 2017/05/18 20:00 > this startDateTime 21:00 = FALSE
            //         //endDateTime = 2017/05/18 20:00 > this startDateTime 20:30 = FALSE
            //         //endDateTime = 2017/05/18 20:00 > this startDateTime 19:00 = true
            //         var errorMsg = "重疊預約時間: " + formatDate(new Date(reservation.startDateTime)) + " - " + formatDate(new Date(reservation.endDateTime));
            //         console.log(errorMsg);

            //         return "dateTimeOverlap";
            //     } else if (new Date(reservation.startDateTime) < new Date(this.field('endDateTime').value)) {
            //         console.log('come2');
            //         //startDateTime = 2017/05/18 20:00 < this endDateTime 20:00 = FALSE
            //         //startDateTime = 2017/05/18 20:00 < this endDateTime 20:30 = TRUE
            //         //startDateTime = 2017/05/18 20:00 ><this endDateTime 19:00 = FALSE
            //         return "dateTimeOverlap" + ": 重疊預約時間 " + formatDate(new Date(reservation.startDateTime)) + " - " + formatDate(new Date(reservation.endDateTime));
            //     } else {
            //         console.log('come');
            //         console.log(new Date(reservation.endDateTime) > new Date(this.field('startDateTime').value));
            //     }
            // }

            // })

        }
    },
    endDateTime: {
        type: String,
        label: '完結時間',
        autoform: {
            type: 'datetime-local'
        },
        custom: function () {

            if (new Date(this.value).getMinutes() % 15 != 0) {
                //not in a 15 mintues period
                return "dateTimeMustbeIn15MintuesTimeSlot";
            }

            if (new Date(this.value) <= this.field('startDateTime').value) {
                return "EndTimeMustBeGreaterThanStartTime";
            }
        }
    },

    people: {
        type: Number,
        label: '人數',
        optional: true,
    },
    phoneNo: {
        type: String,
        label: '聯絡人電話號碼',
        custom: function () {
            if (this.field('phoneNo').value.length != 8) {
                return "phoneNoLengthIsNot8";
            }
        }
    },
    contactName: {
        type: String,
        label: '聯絡人名稱',
        optional: true
    },
    status: {
        type: String,
        label: '預約狀態',
        allowedValues: ['To Be Started', 'Closed', 'Cancelled'],
        autoform: {
            options: [{
                    label: "To Be Started",
                    value: "To Be Started"
                },
                {
                    label: "Closed",
                    value: "Closed"
                },
                {
                    label: "Cancelled",
                    value: "Cancelled"
                }
            ]

        }
    },
    totalAmount: {
        type: Number,
        label: '房租',
        blackbox: true,
        autoValue: function () {
            if (this.isInsert) {
                var diffDate = (new Date(this.field('endDateTime').value) - new Date(this.field('startDateTime').value));
                var diffHours = Math.floor((diffDate % 86400000) / 3600000);
                var diffMintues = (diffHours * 60) + Math.round(((diffDate % 86400000) % 3600000) / 60000); // minutes

                var totalAmount;
                //total mintues / 60 = hours

                totalAmount = Rooms.findOne(this.field('room').value).price * (diffMintues / 60);

                return totalAmount;
            }

        }

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
        }
    }
});

SimpleSchema.messages({
    "startTimeMustBeGreaterThanNow": "開始時間不能早於現在",
    "EndTimeMustBeGreaterThanStartTime": "完結時間不能早於開始時間",
    "dateTimeMustbeIn15MintuesTimeSlot": "時間必需以15分鐘為單位",
    "dateTimeOverlap": "預約時間重疊",
    "phoneNoLengthIsNot8": "聯絡電話號碼長度必需為8位數字"
});

Reservations.attachSchema(Schemas.Reservations);

Reservations.helpers({
    centerName: function () {
        Meteor.subscribe('rooms');
        Meteor.subscribe('centers');

        var targetedRoom = Rooms.findOne(this.room);
        var targetedCenter = Centers.findOne(targetedRoom.center);

        return targetedCenter.name + ' (' + targetedCenter.address + ')';
    },
    roomDesc: function () {
        Meteor.subscribe('rooms');

        var targetedRoom = Rooms.findOne(this.room);
        return targetedRoom.description;

    },
    roomTypeDesc: function () {
        Meteor.subscribe('rooms');
        Meteor.subscribe('roomTypes');

        var targetedRoom = Rooms.findOne(this.room);
        var targetedRoomType = RoomTypes.findOne(targetedRoom.roomType);

        return targetedRoomType.description;
    },
    roomStatusDesc: function () {
        Meteor.subscribe('rooms');
        Meteor.subscribe('roomStatus');

        var targetedRoom = Rooms.findOne(this.room);
        var targetedRoomStatus = RoomStatus.findOne(targetedRoom.roomStatus);

        return targetedRoomStatus.description;
    },
    showStartDateTime: function () {
        return formatDate(new Date(this.startDateTime));
    },
    showEndDateTime: function () {
        return formatDate(new Date(this.endDateTime));
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

function formatDate(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear() + "  " + strTime;
}