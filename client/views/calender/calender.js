Template.calender.onCreated(function () {
    var self = this;
    self.autorun(function () {
        self.subscribe("rooms");
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
});