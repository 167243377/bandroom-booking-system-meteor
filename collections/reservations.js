this.Reservations = new Mongo.Collection('reservations');

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

            if (Meteor.isClient) {
                Meteor.subscribe('reservations');
            }

            var startDateTime = new Date(this.value);
            var selectedRoom = Rooms.findOne(this.field('room').value);

            //Rules #1: not in a 15 mintues period
            if (new Date(this.value).getMinutes() % 15 != 0) {
                return "dateTimeMustbeIn15MintuesTimeSlot";
            }

            //Rules #2.1 check whether the booking day is the buiness day of selected center

            if (Meteor.isClient) {
                var selectedRoomCenter = Centers.findOne(selectedRoom.center);

                var weekDayLetter = convertWeekDayNumberToLetter(startDateTime.getDay());

                var selectedWeekDay;

                selectedRoomCenter.businessHours.filter((businessDays) => {
                    selectedWeekDay = businessDays[weekDayLetter];
                });

                if (selectedWeekDay.isOpen === false) {
                    return "isNotBusinessDay";
                }

                if (selectedWeekDay.startTime !== undefined && selectedWeekDay.endTime !== undefined) {

                    var bookedStartTime = new Date();
                    bookedStartTime.setHours(startDateTime.getHours(), startDateTime.getMinutes(), 0, 0);

                    var businessHoursStartTime = new Date();
                    businessHoursStartTime.setHours(selectedWeekDay.startTime.split(':')[0], selectedWeekDay.startTime.split(':')[1], 0, 0);
                    // var businessHoursEndTime = new Date();
                    // businessHoursEndTime.setHours(selectedWeekDay.endTime.split(':')[0],selectedWeekDay.endTime.split(':')[1],0,0);

                    //Rules #2.2 check whether the booking day is the buiness hour of selected center
                    if (bookedStartTime < businessHoursStartTime) { //|| bookedStartTime > businessHoursEndTime){
                        console.log('bookedStartTime < buinessHoursStartTime');
                        return "isNotBusinessHours";
                    }
                }

                if (selectedRoomCenter.nonAvailablePeriod !== undefined) {
                    if (selectedRoomCenter.nonAvailablePeriod.length > 0) {
                        startDateTime = new Date(this.value);

                        for (var i = 0; i < selectedRoomCenter.nonAvailablePeriod.length; i++) {

                            var currentNonAvailablePeriod = selectedRoomCenter.nonAvailablePeriod[i];

                            var currentNonAvailablePeriodStartDate = new Date(currentNonAvailablePeriod.startDate);
                            var currentNonAvailablePeriodEndDate = new Date(currentNonAvailablePeriod.endDate);

                            //setHours to 0, we just compare the date only
                            currentNonAvailablePeriodStartDate.setHours(0, 0, 0, 0);
                            currentNonAvailablePeriodEndDate.setHours(0, 0, 0, 0);
                            startDateTime.setHours(0, 0, 0, 0);

                            if (startDateTime >= currentNonAvailablePeriodStartDate && startDateTime <= currentNonAvailablePeriodEndDate) {
                                console.log('this period cannot be booked');
                                return "nonAvailableBookingDay";
                            }
                        }
                    }
                }
            }
            //Rules #3: check whether the room has non available booking period
            if (selectedRoom.nonAvailablePeriod !== undefined) {
                startDateTime = new Date(this.value);
                if (selectedRoom.nonAvailablePeriod.length > 0) {

                    for (var i = 0; i < selectedRoom.nonAvailablePeriod.length; i++) {

                        var currentNonAvailablePeriod = selectedRoom.nonAvailablePeriod[i];

                        var currentNonAvailablePeriodStartDate = new Date(currentNonAvailablePeriod.startDate);
                        var currentNonAvailablePeriodEndDate = new Date(currentNonAvailablePeriod.endDate);

                        //setHours to 0, we just compare the date only
                        currentNonAvailablePeriodStartDate.setHours(0, 0, 0, 0);
                        currentNonAvailablePeriodEndDate.setHours(0, 0, 0, 0);
                        startDateTime.setHours(0, 0, 0, 0);

                        if (startDateTime >= currentNonAvailablePeriodStartDate && startDateTime <= currentNonAvailablePeriodEndDate) {
                            console.log('this period cannot be booked');
                            return "nonAvailableBookingPeriod";
                        }

                    }
                }
            }


            //Rules #4: check whether the room have already been booked.
            startDateTime = new Date(this.value);
            var localISOString = toLocaleISOString(startDateTime);

            var overlapReservation = Reservations.find({
                room: selectedRoom._id,
                status: { $in: ["To Be Started", "Closed"] },
                startDateTime: { $lte: localISOString },
                endDateTime: { $gt: localISOString },
                _id: { $ne: this.docId }
            }).fetch()

            if (overlapReservation.length > 0) {
                return "overlapReservationPeriod";
            }
        }
    },
    endDateTime: {
        type: String,
        label: '完結時間',
        autoform: {
            type: 'datetime-local'
        },
        custom: function () {

            if (Meteor.isClient) {
                Meteor.subscribe('reservations');
            }

            var startDateTime = new Date(this.field('startDateTime').value);
            var endDateTime = new Date(this.value);
            var selectedRoom = Rooms.findOne(this.field('room').value);

            //Rules #1: not in a 15 mintues period
            if (endDateTime.getMinutes() % 15 != 0) {
                return "dateTimeMustbeIn15MintuesTimeSlot";
            }

            //Rules #2: endDateTime cannot less than and eqaul to startDateTime
            if (endDateTime < startDateTime) {
                return "EndTimeMustBeGreaterThanStartTime";
            }

            //Rules #3: at least book 30 mins
            var diffDate = new Date(endDateTime - startDateTime);
            var diffHours = Math.floor((diffDate % 86400000) / 3600000);
            var diffMintues = (diffHours * 60) + Math.round(((diffDate % 86400000) % 3600000) / 60000); // minutes

            if (diffMintues < 30) {
                return "atleastBook30Mins";
            }


            //Rules #4.1 check whether the booking day is the buiness day of selected center
            if (Meteor.isClient) {
                var selectedRoomCenter = Centers.findOne(selectedRoom.center);

                if (startDateTime.getDate() === endDateTime.getDate()) {

                    var weekDayLetter = convertWeekDayNumberToLetter(startDateTime.getDay());

                    var selectedWeekDay;

                    selectedRoomCenter.businessHours.filter((businessDays) => {
                        selectedWeekDay = businessDays[weekDayLetter];
                    });

                    if (selectedWeekDay.isOpen === false) {
                        return "isNotBusinessDay";
                    }

                    var bookedEndTime = new Date();
                    bookedEndTime.setHours(endDateTime.getHours(), endDateTime.getMinutes(), 0, 0);

                    // var businessHoursStartTime = new Date();
                    // businessHoursStartTime.setHours(selectedWeekDay.startTime.split(':')[0],selectedWeekDay.startTime.split(':')[1],0,0);
                    var businessHoursEndTime = new Date();
                    businessHoursEndTime.setHours(selectedWeekDay.endTime.split(':')[0], selectedWeekDay.endTime.split(':')[1], 0, 0);

                    //Rules #4.2 check whether the booking day is the buiness hour of selected center
                    if (bookedEndTime > businessHoursEndTime && businessHoursEndTime.getHours() !== 0) {
                        return "isNotBusinessHours";
                    }
                } else {
                    var weekDayLetter = convertWeekDayNumberToLetter(endDateTime.getDay());

                    var selectedWeekDay;

                    selectedRoomCenter.businessHours.filter((businessDays) => {
                        selectedWeekDay = businessDays[weekDayLetter];
                    });
                    if (selectedWeekDay.isOpen === false) {
                        return "isNotBusinessDay";
                    }

                    var bookedEndTime = new Date();
                    bookedEndTime.setHours(endDateTime.getHours(), endDateTime.getMinutes(), 0, 0);

                    var businessHoursStartTime = new Date();
                    businessHoursStartTime.setHours(selectedWeekDay.startTime.split(':')[0], selectedWeekDay.startTime.split(':')[1], 0, 0);

                    //Rules #4.2 check whether the booking day is the buiness hour of selected center
                    if (bookedEndTime < businessHoursStartTime) {

                        //02:00 < 01:00 ==> false, cannot be booked.
                        return "isNotBusinessHours";
                    }
                }

                if (selectedRoomCenter.nonAvailablePeriod !== undefined) {
                    if (selectedRoomCenter.nonAvailablePeriod.length > 0) {

                        endDateTime = new Date(this.value);

                        for (var i = 0; i < selectedRoomCenter.nonAvailablePeriod.length; i++) {

                            var currentNonAvailablePeriod = selectedRoomCenter.nonAvailablePeriod[i];

                            var currentNonAvailablePeriodStartDate = new Date(currentNonAvailablePeriod.startDate);
                            var currentNonAvailablePeriodEndDate = new Date(currentNonAvailablePeriod.endDate);

                            //setHours to 0, we just compare the date only
                            currentNonAvailablePeriodStartDate.setHours(0, 0, 0, 0);
                            currentNonAvailablePeriodEndDate.setHours(0, 0, 0, 0);
                            endDateTime.setHours(0, 0, 0, 0);

                            if (endDateTime >= currentNonAvailablePeriodStartDate && endDateTime <= currentNonAvailablePeriodEndDate) {
                                console.log('this period cannot be booked');
                                return "nonAvailableBookingDay";
                            }
                        }
                    }
                }

            }

            //Rules #4.3: check whether the room has non available booking period
            if (selectedRoom.nonAvailablePeriod !== undefined) {
                if (selectedRoom.nonAvailablePeriod.length > 0) {

                    endDateTime = new Date(this.value);

                    for (var i = 0; i < selectedRoom.nonAvailablePeriod.length; i++) {

                        var currentNonAvailablePeriod = selectedRoom.nonAvailablePeriod[i];

                        var currentNonAvailablePeriodStartDate = new Date(currentNonAvailablePeriod.startDate);
                        var currentNonAvailablePeriodEndDate = new Date(currentNonAvailablePeriod.endDate);

                        //setHours to 0, we just compare the date only
                        currentNonAvailablePeriodStartDate.setHours(0, 0, 0, 0);
                        currentNonAvailablePeriodEndDate.setHours(0, 0, 0, 0);
                        endDateTime.setHours(0, 0, 0, 0);

                        if (endDateTime >= currentNonAvailablePeriodStartDate && endDateTime <= currentNonAvailablePeriodEndDate) {
                            console.log('this period cannot be booked');
                            return "nonAvailableBookingPeriod";
                        }
                    }
                }
            }

            //Rules #5: check whether the room have already been booked.
            endDateTime = new Date(this.value);
            var localISOString = toLocaleISOString(endDateTime);

            var overlapReservation = Reservations.find({
                room: selectedRoom._id,
                status: { $in: ["To Be Started", "Closed"] },
                startDateTime: { $lt: localISOString },
                endDateTime: { $gte: localISOString },
                _id: { $ne: this.docId }
            }).fetch()

            if (overlapReservation.length > 0) {
                return "overlapReservationPeriod";
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
        autoValue: function () {
            if (!this.value) {
                var diffDate = (new Date(this.field('endDateTime').value) - new Date(this.field('startDateTime').value));
                var diffHours = Math.floor((diffDate % 86400000) / 3600000);
                var diffMintues = (diffHours * 60) + Math.round(((diffDate % 86400000) % 3600000) / 60000); // minutes

                var totalAmount;
                //total mintues / 60 = hours

                totalAmount = Rooms.findOne(this.field('room').value).price * (diffMintues / 60);

                return totalAmount;
            } else {
                return this.value
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

            console.log('autoValue in');    

            if (Meteor.isServer) {
                console.log('Is server');
                if (this.isInsert) {
                    console.log('Is server');
                    return Meteor.userId();
                }
            }

            if (Meteor.isClient) {
                console.log('Is Client');
                console.log(this.userId);
                if (this.userId) {
                    console.log(this.userId);
                    console.log(this.userId);
                    return this.userId;
                } else {
                    console.log('this.value');
                    return this.value;
                }
            }
        }
    }
});

SimpleSchema.messages({
    "startTimeMustBeGreaterThanNow": "開始時間不能早於現在",
    "EndTimeMustBeGreaterThanStartTime": "完結時間不能早於開始時間",
    "dateTimeMustbeIn15MintuesTimeSlot": "時間必需以15分鐘為單位",
    "dateTimeOverlap": "預約時間重疊",
    "phoneNoLengthIsNot8": "聯絡電話號碼長度必需為8位數字",
    "nonAvailableBookingPeriod": "已選擇的日子為暫停預約日",
    "atleastBook30Mins": "最少預約時間為30分鐘",
    "overlapReservationPeriod": "已選擇的時間與其他預約時間重疊",
    "nonAvailableBookingDay": "已選擇的日子為暫停預約",
    "isNotBusinessDay": "已選擇的日子不是營業日",
    "isNotBusinessHours": "已選擇的時間不是營業時間"
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

function toLocaleISOString(date) {
    var tzoffset = date.getTimezoneOffset() * 60000; //offset in milliseconds
    var localISOString = new Date(date - tzoffset).toISOString().slice(0, -1);
    return localISOString;
}
function convertWeekDayNumberToLetter(weekdayNumber) {
    var weekday = [];
    weekday[0] = "sunday";
    weekday[1] = "monday";
    weekday[2] = "tuesday";
    weekday[3] = "wednesday";
    weekday[4] = "thursday";
    weekday[5] = "friday";
    weekday[6] = "saturday";

    return weekday[weekdayNumber];

}

//REST API generated by Restivus

if (Meteor.isServer) {
    var Api = new Restivus({
        prettyJson: true,
        defaultHeaders: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
    });

    Api.addRoute('reservations', {
        post: function () {
            var bodyParams = this.bodyParams;
            console.log(bodyParams);

            var diffDate = (new Date(bodyParams.startDateTime) - new Date(bodyParams.endDateTime));
            var diffHours = Math.floor((diffDate % 86400000) / 3600000);
            var diffMintues = (diffHours * 60) + Math.round(((diffDate % 86400000) % 3600000) / 60000); // minutes

            var totalAmount;
            //total mintues / 60 = hours
            var selectedRoom = Rooms.findOne(bodyParams.room);
            totalAmount = selectedRoom.price * (diffMintues / 60);

            var createdRecordId = Reservations.insert({
                "room": bodyParams.room,
                "startDateTime": bodyParams.startDateTime,
                "endDateTime": bodyParams.endDateTime,
                "phoneNo": bodyParams.phoneNo,
                "contactName": bodyParams.contactName,
                "status": "To Be Started",
                "people": bodyParams.people,
                "totalAmount": totalAmount,
                "createdAt": toLocaleISOString(new Date()),
                "owner": selectedRoom.owner
            })

            return {
                status: 'success',
                data: createdRecordId
            };
        }
    });

    Api.addRoute('reservations/:id', {
        get: function () {
            var reservationId = this.urlParams.id;

            var reservation = Reservations.findOne(reservationId);
            var room = Rooms.findOne(reservation.room);
            var center = Centers.findOne(room.center);

            //inputted value already used the local timezone. Thus, we have to get the UTC hours
            var startDateTime = new Date(reservation.startDateTime).toUTCTime();
            var endDateTime = new Date(reservation.endDateTime).toUTCTime();

            var reservationData = {
                room: {
                    center: {
                        name: center.name
                    },
                    description: room.description,
                },
                bookingData: {
                    bookDate: new Date(reservation.startDateTime).toUTCDate(),
                    startDateTime: startDateTime,
                    endDateTime: endDateTime,
                    contactName: reservation.contactName, // optional field
                    phoneNo: reservation.phoneNo,
                    people: reservation.people == "" ? 0 : reservation.people  // optional field
                }
            }

            return {
                status: 'success',
                data: reservationData
            }

        }
    })
}

Date.prototype.toUTCDate = function () {
    var year = this.getFullYear();

    var mm = this.getMonth() + 1;// getMonth() base is 0, so we need to add 1
    var month = (mm > 9 ? '' : '0') + mm;
    // append leading zero

    var dd = this.getDate();
    var day = (dd > 9 ? '' : '0') + dd
    // append leading zero

    return year + '-' + month + '-' + day;
};

Date.prototype.toUTCTime = function () {
    var mm = this.getUTCHours();
    var dd = this.getUTCMinutes();

    return [(mm > 9 ? '' : '0') + mm +
        ':' +
        (dd > 9 ? '' : '0') + dd
    ].join('');
};