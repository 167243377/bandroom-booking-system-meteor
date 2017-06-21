Template.analytics.onCreated(function () {
    if (Meteor.isClient) {
        var self = this;
        self.autorun(function () {
            self.subscribe("rooms");
            self.subscribe("centers");
            self.subscribe("reservations");
        });
    }
});

Template.analytics.onRendered(() => {
});

// myTemplate.js
Template.analytics.helpers({

    myChartData: function () {

        var dataSources = [];
        var allRooms = Rooms.find().fetch();

        for (var i = 0; i < allRooms.length; i++) {
            var data = [];

            var currentRoom = allRooms[i];
            var currentRoomCenter = Centers.findOne(currentRoom.center);

            data.push(currentRoomCenter.name + ' - ' + currentRoom.description);

            var currentRoomRservations = Reservations.find({
                room: currentRoom._id,
            }).fetch();

            var allHoursDistribution = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

            for (var y = 0; y < currentRoomRservations.length; y++) {
                var currentRoomRservation = currentRoomRservations[y];

                var startHour = new Date(currentRoomRservation.startDateTime).getHours();
                var endHour = new Date(currentRoomRservation.endDateTime).getHours();

                for (var i = startHour; i < endHour; i++) {
                    allHoursDistribution[i]++;
                }

            }

            data = data.concat(allHoursDistribution);
            dataSources.push(data);
        }

        return {
            data: {
                columns: dataSources,
                type: 'area-step',
            },
            title: {
                text: '於不同時間的預約次數分佈'
            },
            axis: {
                x: {
                    tick: {
                        culling: false,
                        count: 24,
                        fit: true,
                    },
                    label: {
                        text: 'Hour',
                        position: 'outer-left'
                    },
                },
                y: {
                    label: {
                        text: '次數',
                        position: 'outer-bottom',
                    },
                    center: 10
                }
            },
            line: {
                step: {
                    type: 'step-after'
                }
            }
        };
    },

    line_RservationTimeSlotDistribution: function () {
        var dataSources = [];
        var allRooms = Rooms.find().fetch();

        for (var i = 0; i < allRooms.length; i++) {
            var currentRoom = allRooms[i];
            var currentRoomCenter = Centers.findOne(currentRoom.center);

            var currentRoomRservations = Reservations.find({
                room: currentRoom._id,
            }).fetch();

            var allHoursDistribution = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,];

            for (var y = 0; y < currentRoomRservations.length; y++) {
                var currentRoomRservation = currentRoomRservations[y];

                var startHour = new Date(currentRoomRservation.startDateTime).getHours();
                var endHour = new Date(currentRoomRservation.endDateTime).getHours();

                allHoursDistribution[startHour - 1]++;
                allHoursDistribution[endHour - 1]++;
            }

            dataSources.push({
                name: currentRoomCenter.name + ' - ' + currentRoom.description,
                data: allHoursDistribution
            });
        }

        return {
            chart: {
                type: 'spline'
            },
            title: {
                text: '於不同時間的預約次數分佈'
            },
            xAxis: {
                type: 'datetime',
                labels: {
                    overflow: 'justify'
                },
                startOnTick: false,
                crosshair: true
            },
            yAxis: {
                title: {
                    text: '次數'
                },
                startOnTick: false,
                crosshair: true
            },
            tooltip: {
                valueSuffix: ' 次數'
            },
            plotOptions: {
                spline: {
                    lineWidth: 2,
                    states: {
                        hover: {
                            lineWidth: 6
                        }
                    },
                    marker: {
                        enabled: false
                    },
                    pointInterval: 3600000, // one hour
                }
            },
            series: dataSources,
            navigation: {
                menuItemStyle: {
                    fontSize: '10px'
                }
            }
        }

    },
    bar_bookedRoomsDistribution: function () {

        var dataSources = [];
        var allRooms = Rooms.find().fetch();

        for (var i = 0; i < allRooms.length; i++) {
            var currentRoom = allRooms[i];
            var currentRoomCenter = Centers.findOne(currentRoom.center);

            var currentRoomBookedCount = Reservations.find({
                room: currentRoom._id
            }).fetch().length;

            dataSources.push({
                name: currentRoomCenter.name + ' - ' + currentRoom.description,
                y: currentRoomBookedCount
            });
        }
        return {
            chart: {
                type: 'column'
            },
            title: {
                text: '所有房間的預約次數'
            },
            xAxis: {
                type: 'category'
            },
            yAxis: {
                title: {
                    text: '預約次數'
                }

            },
            legend: {
                enabled: false
            },
            plotOptions: {
                series: {
                    borderWidth: 0,
                    dataLabels: {
                        enabled: false,
                        format: '{point.y:f}次 out of ' + Reservations.find().fetch().length + '次'
                    }
                }
            },

            tooltip: {
                headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
                pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:f}</b> out of ' + Reservations.find().fetch().length + '次 <br/>'
            },

            series: [{
                name: '房間',
                colorByPoint: true,
                data: dataSources
            }],
        };
    },
    pie_bookedRoomsDistribution: function () {

        var dataSources = [];
        var allRooms = Rooms.find().fetch();

        for (var i = 0; i < allRooms.length; i++) {
            var currentRoom = allRooms[i];
            var currentRoomCenter = Centers.findOne(currentRoom.center);

            var currentRoomBookedCount = Reservations.find({
                room: currentRoom._id
            }).fetch().length;

            dataSources.push({
                name: currentRoomCenter.name + ' - ' + currentRoom.description,
                y: currentRoomBookedCount
            });
        }

        return {
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: true,
                type: 'pie'
            },
            title: {
                text: '所有房間的預約次數分佈'
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                        style: {
                            color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                        },
                        connectorColor: 'silver'
                    }
                }
            },
            series: [{
                name: '房間',
                data: dataSources
            }]
        }
    },

    bar_incomeDistribution: function () {
        var dataSources = [];
        var allRooms = Rooms.find().fetch();
        var totalIncomeFromAllRoom = 0;

        for (var i = 0; i < allRooms.length; i++) {
            var currentRoom = allRooms[i];
            var currentRoomCenter = Centers.findOne(currentRoom.center);

            var currentRoomRservations = Reservations.find({
                room: currentRoom._id
            }).fetch();

            var totalIncomeFromCurrentRoom = 0;

            for (var y = 0; y < currentRoomRservations.length; y++) {
                var currentRoomRservation = currentRoomRservations[y];
                totalIncomeFromCurrentRoom = totalIncomeFromCurrentRoom + currentRoomRservation.totalAmount;
            }

            totalIncomeFromAllRoom = totalIncomeFromAllRoom + totalIncomeFromCurrentRoom;

            dataSources.push({
                name: currentRoomCenter.name + ' - ' + currentRoom.description,
                y: totalIncomeFromCurrentRoom
            });
        }

        return {
            chart: {
                type: 'column'
            },
            title: {
                text: '所有房間的總收入'
            },
            xAxis: {
                type: 'category'
            },
            yAxis: {
                title: {
                    text: '$金額'
                }

            },
            legend: {
                enabled: false
            },
            plotOptions: {
                series: {
                    borderWidth: 0,
                    dataLabels: {
                        enabled: false,
                        format: '{point.y:f} of $' + totalIncomeFromAllRoom
                    }
                }
            },

            tooltip: {
                headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
                pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>${point.y:f}</b> out of $' + totalIncomeFromAllRoom + '<br/>'
            },

            series: [{
                name: '房間',
                colorByPoint: true,
                data: dataSources
            }],
        };
    },
    pie_incomeDistribution: function () {

        var dataSources = [];
        var allRooms = Rooms.find().fetch();

        for (var i = 0; i < allRooms.length; i++) {
            var currentRoom = allRooms[i];
            var currentRoomCenter = Centers.findOne(currentRoom.center);

            var currentRoomRservations = Reservations.find({
                room: currentRoom._id
            }).fetch();

            var totalIncomeFromCurrentRoom = 0;

            for (var y = 0; y < currentRoomRservations.length; y++) {
                var currentRoomRservation = currentRoomRservations[y];

                totalIncomeFromCurrentRoom = totalIncomeFromCurrentRoom + currentRoomRservation.totalAmount;
            }

            dataSources.push({
                name: currentRoomCenter.name + ' - ' + currentRoom.description,
                y: totalIncomeFromCurrentRoom
            });
        }

        return {
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: true,
                type: 'pie'
            },
            title: {
                text: '所有房間的總收入分佈'
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                        style: {
                            color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                        },
                        connectorColor: 'silver'
                    }
                }
            },
            series: [{
                name: '房間',
                data: dataSources
            }]
        }
    }
});