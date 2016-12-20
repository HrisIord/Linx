$(document).ready(function() {
  $(".dropdown-button").dropdown();
  $('.collapsible').collapsible();
  $('ul.tabs').tabs();
});

function slideTransition(oldElem, newElem, speed) {
  oldElem.css({ opacity: 0, transition: 'opacity 0.25s' }).slideUp(speed, function() {
    newElem.css({ opacity: 100, transition: 'opacity 0.25s' }).slideDown(speed);
  });
}

$(document).on('click', '#login-nav-btn', function() {
  $('#title').animate({ 'margin-top': '-=80px'}, 500);
  $('#nav-buttons').css({ opacity: 0, transition: 'opacity 0.2s' }).slideUp(500, function() {
    $('#login').css({ opacity: 100, transition: 'opacity 0.25s' }).slideDown(250);
  });
});

$(document).on('click', '#register-nav-btn', function() {
  $('#title').animate({ 'margin-top': '-=80px'}, 500);
  $('#nav-buttons').css({ opacity: 0, transition: 'opacity 0.2s' }).slideUp(500, function() {
    $('#register').css({ opacity: 100, transition: 'opacity 0.25s' }).slideDown(250);
  });
});

$(document).on('click', '#login-sub-btn', function() {
  //TODO: make rest call and actually login
  $('body').css({ 'background-color': '#FFFFFF', transition: 'background-color 0.25s' }, 500);
  slideTransition($('#home'), $('#general'), 500);
});

$(document).on('click', '#register-sub-btn', function() {
  // make rest call to create user
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(
      tabs[0].id, 

      {
        method: 'POST', 
        path: '/register',
        content: {
          username: $("#reg-username").val(),
          password: $("#reg-password").val(),
          passwordConfirmation: $("#reg-password-conf").val(),
          email: $("#reg-email").val()
        }
      },
      
      // deal with response from rest call
      function(res) {
        console.log(res);
        $('body').css({ 'background-color': '#FFFFFF', transition: 'background-color 0.25s' }, 500);
        slideTransition($('#home'), $('#general'), 500);
      }
    );
  });
});

$(document).on('click', '#repo-list li', function() {
  slideTransition($('#repo-list'), $('#repo-details'), 250);
});

$(document).on('click', '#repo-details-back', function() {
  slideTransition($('#repo-details'), $('#repo-list'), 250);
});