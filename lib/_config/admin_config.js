this.AdminConfig = {
	name: Config.name,
	collections: {
		Reservations: {
			label: '預約',
			color: 'red',
			icon: 'bookmark',
			extraFields: ['room', 'startDateTime', 'endDateTime', 'totalAmount', 'owner'],
			tableColumns: [{
				label: '中心',
				name: 'centerName()',
				width: '20%'
			}, {
				label: '房間類型',
				name: 'roomTypeDesc()'
			}, {
				label: '房間資料',
				name: 'roomDesc()'
			}, {
				label: '開始時間',
				name: 'startDateTime',
			}, {
				label: '結束時間',
				name: 'endDateTime'
			}, {
				label: '預約狀態',
				name: 'status'
			}, {
				label: '聯絡人電話號碼',
				name: 'phoneNo'
			}, {
				label: '聯絡人名稱',
				name: 'contactName'
			}, {
				label: '房租',
				name: 'totalAmount'
			}]
		},
		Centers: {
			label: '中心',
			color: 'green',
			icon: 'building',
			extraFields: ['owner'],
			tableColumns: [{
				label: '名稱',
				name: 'name'
			}, {
				label: '地址',
				name: 'address'
			}, {
				label: '聯絡電話',
				name: 'contactNumber'
			}, {
				label: '聯絡電郵',
				name: 'contactEmail'
			}]
		},
		Rooms: {
			label: '房間',
			color: 'yellow',
			icon: 'home',
			extraFields: ['center', 'roomType', 'roomStatus', 'owner'],
			tableColumns: [{
				label: '中心',
				name: 'centerName()'
			}, {
				label: '房間類型',
				name: 'roomTypeDesc()'
			}, {
				label: '房間資訊',
				name: 'description'
			}]
		},
		Districts: {
			label: '地區',
			color: 'blue',
			icon: 'area-chart',
			extraFields: ['owner'],
			tableColumns: [{
				label: 'Code',
				name: 'code'
			}, {
				label: 'Description',
				name: 'description'
			}]
		},
		RoomTypes: {
			label: '房間類型',
			color: 'blue',
			icon: 'bed',
			extraFields: ['owner'],
			tableColumns: [{
				label: 'Code',
				name: 'code'
			}, {
				label: 'Description',
				name: 'description'
			}]
		},
		RoomStatus: {
			label: '房間狀態',
			color: 'blue',
			icon: 'circle-o-notch',
			extraFields: ['owner'],
			tableColumns: [{
				label: 'Code',
				name: 'code'
			}, {
				label: 'Description',
				name: 'description'
			}]
		}
	},
	skin: 'red-light',
	// skin: 'red',
	// skin: 'black',
	dashboard: {
		homeUrl: '/admin',
		widgets: [{
			template: 'calender',
			data: {
				class: 'col-lg-3 col-xs-6'
			}
		}]
	},
	autoForm: {
		omitFields: ['createdAt', 'updatedAt', 'owner']
	}
};

// ---
// generated by coffee-script 1.9.2