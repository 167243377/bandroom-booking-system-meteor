var centerNamesMapping = [];
var isShowCancelledReservation = false;

Template.calender.onCreated(function () {
    var isRefresh = false;
    var previousReservationsCount = 0;

    var previousRservationId = "";

    var self = this;

    self.subscribe("rooms");
    self.subscribe("centers");

    self.subscribe("reservations", function () {
        self.autorun(function () {
            //check whether a new reservation is added, a reactive display (real-time)
            if (previousReservationsCount != 0 && previousReservationsCount < Reservations.find().count()) {

                let newReservation = Reservations.findOne({}, {
                    sort: {
                        createdAt: -1,
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
                    return false;
                }, 1000);
                //Timeout makes asynchronous
            }

            showReservations();

            previousReservationsCount = Reservations.find().count();
        });
    });
});

Template.calender.helpers({
    showCenterNameMapping: function () {
        setTimeout(function () {
            var centerNameMapping = document.getElementById("centerNameMapping");

            centerNamesMapping.forEach(val => {
                var entry = document.createElement('b');

                entry.appendChild(document.createTextNode((centerNamesMapping.indexOf(val) + 1) + " － " + val));

                centerNameMapping.appendChild(entry);
            })


        }, 500)
    }
});

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

    let reservations = [];
    let targetedReservations = Reservations.find().fetch();


    for (var i = 0; i < targetedReservations.length; i++) {
        let reservation = targetedReservations[i];
        let targetedRoom = Rooms.findOne(reservation.room);
        let statusColor = '';

        if (reservation.status === 'Closed') {
            statusColor = '#2E7D32'
        } else if (reservation.status === 'Cancelled') {
            statusColor = '#B71C1C'
        } else if (reservation.status === 'To Be Started') {
            statusColor = '#01579B'
        }

        let targetedCenter = Centers.findOne(targetedRoom.center);

        if (centerNamesMapping.indexOf(targetedCenter.name) == -1) {
            centerNamesMapping.push(targetedCenter.name);
        }

        reservations.push({
            id: reservation._id,
            // resourceId: targetedCenter.name + " - " + targetedRoom.description,
            resourceId: (centerNamesMapping.indexOf(targetedCenter.name) + 1) + " — " + targetedRoom.description,
            title: reservation.status,
            start: reservation.startDateTime,
            end: reservation.endDateTime,
            editable: false,
            color: statusColor
        })
    }

    //refresh use, create after destroy
    $('#myCalendar').fullCalendar('destroy');
    $('#myCalendar').fullCalendar({
        schedulerLicenseKey: 'CC-Attribution-NonCommercial-NoDerivatives',
        defaultView: 'agendaDay',
        height: window.innerHeight - (window.innerHeight * 0.15),

        header: {
            left: 'prev,next today customButton_NewReservation customButton_ShowCancel',
            center: 'title',
            right: 'agendaDay,timelineDay,basicWeek,month',
        },
        customButtons: {
            customButton_NewReservation: {
                text: '建立預約',
                click: function () {
                    window.open('http://localhost:3000/admin/Reservations/new');
                }
            },
            customButton_ShowCancel: {
                text: '顯示/隱藏已取消預約',
                click: function () {

                    if (isShowCancelledReservation) {
                        $('#myCalendar').fullCalendar('removeEvents');
                        $('#myCalendar').fullCalendar('addEventSource',
                            reservations
                        )

                        isShowCancelledReservation = false;
                    } else {
                        $('#myCalendar').fullCalendar('removeEvents');
                        $('#myCalendar').fullCalendar('addEventSource',
                            reservations.filter(reservation => {
                                return reservation.title !== "Cancelled";
                            })
                        )

                        isShowCancelledReservation = true;
                    }
                }
            }
        },

        events: reservations,
        eventClick: function (calEvent, jsEvent, view) {
            window.open('http://localhost:3000/admin/Reservations/' + calEvent.id + '/edit');
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
                    id: (centerNamesMapping.indexOf(targetedCenter.name) + 1) + " — " + room.description,
                    center: (centerNamesMapping.indexOf(targetedCenter.name) + 1),
                    room: room.description
                })
            })

            if (roomOptions) {
                callback(roomOptions);
            }
        }
        // other options go here...
    });

    //Change the text of buttons which are used to switch to different views

    var todayButtons = document.getElementsByClassName("fc-today-button");
    if (todayButtons.length > 0) {
        todayButtons[0].innerText = "顯示今天預約"
    }

    var agendaDayButtons = document.getElementsByClassName("fc-agendaDay-button");
    if (agendaDayButtons.length > 0) {
        agendaDayButtons[0].innerText = "Agenda View"
    }

    var timelineDayButtons = document.getElementsByClassName("fc-timelineDay-button");
    if (timelineDayButtons.length > 0) {
        timelineDayButtons[0].innerText = "Timeline View"
    }

    var weekButtons = document.getElementsByClassName("fc-basicWeek-button");
    if (weekButtons.length > 0) {
        weekButtons[0].innerText = "Week View"
    }

    var monthButtons = document.getElementsByClassName("fc-month-button");
    if (monthButtons.length > 0) {
        monthButtons[0].innerText = "Month View"
    }

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
    return inputDate.getMonth() + 1 + "/" + inputDate.getDate() + "  " + strTime;
}