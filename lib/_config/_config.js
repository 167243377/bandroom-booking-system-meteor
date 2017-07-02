this.Config = {
	name: 'Band Room Booking System',
	title: function () {
		return TAPi18n.__('configTitle');
	},
	subtitle: function () {
		return TAPi18n.__('configSubtitle');
	},
	logo: function () {
		return '<b>' + this.name + '</b>';
	},
	footer: function () {
		return this.name + ' - Copyright ' + new Date().getFullYear();
	},
	emails: {
		from: 'no-reply@' + Meteor.absoluteUrl(),
		contact: 'hello' + Meteor.absoluteUrl()
	},
	username: false,
	defaultLanguage: 'en',
	dateFormat: 'D/M/YYYY',
	privacyUrl: 'https://github.com/167243377/bandroom-booking-system-meteor',
	termsUrl: 'https://github.com/167243377/bandroom-booking-system-meteor',
	legal: {
		address: 'Hong Kong',
		name: 'Bandroom Booking System',
		url: 'https://github.com/167243377/bandroom-booking-system-meteor'
	},
	about: 'https://github.com/167243377/bandroom-booking-system-meteor',
	blog: 'https://github.com/167243377/bandroom-booking-system-meteor',
	socialMedia: {
		facebook: {
			url: 'https://github.com/167243377/bandroom-booking-system-meteor',
			icon: 'facebook'
		},
		twitter: {
			url: 'https://github.com/167243377/bandroom-booking-system-meteor',
			icon: 'twitter'
		},
		github: {
			url: 'https://github.com/167243377/bandroom-booking-system-meteor',
			icon: 'github'
		},
		info: {
			url: 'https://github.com/167243377/bandroom-booking-system-meteor',
			icon: 'link'
		}
	},
	homeRoute: '/',
	publicRoutes: ['home'],
	dashboardRoute: '/dashboard'
};