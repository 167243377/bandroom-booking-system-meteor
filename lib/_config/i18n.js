Meteor.startup(function () {

  AdminDashboard.addSidebarItem('數據統計', AdminDashboard.path('/analytics'), {
    icon: 'line-chart'
  })

  if (Meteor.isClient) {

    if (Config.defaultLanguage) {
      return TAPi18n.setLanguage(Config.defaultLanguage);
    } else {
      return TAPi18n.setLanguage('en');
    }
  }
});