$(document).ready(function() {
  $(".dropdown-button").dropdown();
  $('.collapsible').collapsible();
  $('ul.tabs').tabs();
});

$(document).on('click', '#login-nav-btn', function() {
  $('#title').animate({ 'margin-top': '-=80px'}, 500);
  $('#nav-buttons').fadeOut(250, function() {
    $('#login').fadeIn(250);
  });
});

$(document).on('click', '#register-nav-btn', function() {
  $('#title').animate({ 'margin-top': '-=80px'}, 500);
  $('#nav-buttons').fadeOut(250, function() {
    $('#register').fadeIn(250);
  });
});

$(document).on('click', '#repo-list li', function() {
  $('#repo-list').fadeOut(250, function() {
    $('#repo-details').fadeIn(250);
  });
});