Template.calender.onCreated(function () {
    var isRefresh = false;
    var previousReservationsCount = 0;

    var self = this;
    self.autorun(function () {
        self.subscribe("rooms");
        self.subscribe("centers");
        self.subscribe("reservations", function () {
            Tracker.autorun(function () {

                //check whether a new reservation is added, a reactive display (real-time)
                if (previousReservationsCount != 0 && previousReservationsCount !== Reservations.find().count()) {

                    let newReservation = Reservations.findOne({}, {
                        sort: {
                            DateTime: -1,
                            limit: 1
                        }
                    });

                    let newReservationRoom = Rooms.findOne(newReservation.room);
                    let newReservationCenter = Centers.findOne(newReservationRoom.center);

                    playNotifySound();

                    setTimeout(function () {
                        alert('有一個新預約' + '\n' +
                            "房間: " + newReservationCenter.name + " - " + newReservationRoom.description + '\n' +
                            '預約時間: ' + formatDate(newReservation.startDateTime) + ' - ' + formatDate(newReservation.endDateTime));
                    }, 1000);
                    //Timeout makes asynchronous

                }

                showReservations();

                previousReservationsCount = Reservations.find().count();

            })
        });
    });
});

Template.calender.helpers({});

Template.calender.events({
    "click .goToTargetdDate": function () {
        let targetedDate = document.getElementById('gotodate-datepicker');

        if (targetedDate.value === '') {
            alert('請選擇日期');
            return;
        }

        $('#myCalendar').fullCalendar('gotoDate', new Date(targetedDate.value));
    }
});

Template.calender.onRendered(() => {
    $('#gotodate-datepicker').datepicker();
});


function showReservations() {

    console.log('showReservations');
    let reservations = [];
    let targetedReservations = Reservations.find();
    targetedReservations.fetch().map((reservation) => {

        let targetedRoom = Rooms.findOne(reservation.room);
        let statusColor = '';

        if (reservation.status === 'Closed') {
            statusColor = 'green'
        } else if (reservation.status === 'Cancelled') {
            statusColor = 'red'
        } else if (reservation.status === 'To Be Started') {
            statusColor = 'blue'
        }

        reservations.push({
            id: reservation._id,
            resourceId: targetedRoom._id,
            title: reservation.status,
            start: reservation.startDateTime,
            end: reservation.endDateTime,
            editable: false,
            color: statusColor
        })
    })

    $('#myCalendar').fullCalendar('destroy');
    $('#myCalendar').fullCalendar({
        schedulerLicenseKey: 'CC-Attribution-NonCommercial-NoDerivatives',
        defaultView: 'timelineDay',
        aspectRatio: 6,
        header: {
            left: 'prev,next today goToDateButton',
            center: 'title',
            right: '',
        },
        events: reservations,
        eventClick: function (calEvent, jsEvent, view) {
            window.open('admin/Reservations/' + calEvent.id + '/edit');
        },
        resourceColumns: [{
                labelText: '中心',
                field: 'center',
                width: '20%',
            },
            {
                labelText: '房間',
                field: 'room',
                width: '20%'
            }
        ],
        resources: function (callback) {
            let roomOptions = [];
            let targetedRooms = Rooms.find();

            targetedRooms.fetch().map((room) => {

                let targetedCenter = Centers.findOne(room.center);

                roomOptions.push({
                    id: room._id,
                    center: targetedCenter.name,
                    room: room.description
                })
            })

            if (roomOptions) {
                callback(roomOptions);
            }
        }
        // other options go here...
    });
}

function playNotifySound() {
    var notificationSound = new buzz.sound('/audio/notify.ogg', {
        autoplay: true
    });
}

function formatDate(date) {
    let inputDate = new Date(date);
    var hours = inputDate.getHours();
    var minutes = inputDate.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return inputDate.getMonth() + "/" + inputDate.getDate() + "  " + strTime;
}