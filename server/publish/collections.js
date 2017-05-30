if (Meteor.isServer) {
	Meteor.publish('reservations', function () {
		return Reservations.find();
	});

	Meteor.publish('centers', function () {
		return Centers.find();
	});

	Meteor.publish('rooms', function () {
		return Rooms.find();
	});

	Meteor.publish('districts', function () {
		return Districts.find();
	});

	Meteor.publish('roomTypes', function () {
		return RoomTypes.find();
	});

	Meteor.publish('roomStatus', function () {
		return RoomStatus.find();
	});

	Meteor.publish('attachments', function () {
		return Attachments.find();
	});
}