window.onload = function() {
  console.log("onload " + Date());
  chrome.storage.sync.get(['loggedIn'], function(items) {
    console.log(items);
    if (items['loggedIn'] === 'true') {
      $('body').css({ 'background-color': '#FFFFFF'});
      $('#home').hide();
      $('#general').show();
    }
  });
}

$(document).ready(function(){
  $('ul.tabs').tabs();
});



// helper functions

function isEmpty(obj) {
  return obj == null || obj == undefined || Object.keys(obj).length == 0;
}

function isEmptyString(str) {
  return isEmpty(str) || !str.replace(/\s/g, '').length
}

function slideTransition(oldElem, newElem, speed) {
  oldElem.hide();
  newElem.show();
  // oldElem.css({ opacity: 0, transition: 'opacity 0.25s' }).slideUp(speed, function() {
  //   newElem.css({ opacity: 100, transition: 'opacity 0.25s' }).slideDown(speed);
  // });
}


// on click listeners

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

function loginRegCallback(res, caller) {
  if (res == null || res == undefined) {
    console.log("network error");
  }

  if (res.error == null) {
    chrome.storage.sync.set({'loggedIn': 'true'}, function() {
      console.log('Settings saved');
    });
    $('body').css({ 'background-color': '#FFFFFF', transition: 'background-color 0.25s' }, 500);
    slideTransition($('#home'), $('#general'), 500);

  } else {
    var emptyErrors = isEmptyString($('#' + caller + '-errors .card-panel').html());
    var errorMsgs = "";
    for (var i in res.error) {
      errorMsgs += '<div>' + res.error[i] + '</div>';
    }

    $('#' + caller + '-errors .card-panel').html(errorMsgs);
    if (emptyErrors) {
      $('#' + caller + '-errors').css({ opacity: 100, transition: 'opacity 0.25s' }).slideDown(250);
    }
    $('#' + caller + '-sub-prog').hide();
    $('#' + caller + '-sub-btn').show();
  }
}

$(document).on('click', '#login-sub-btn', function() {
  $('#login-sub-btn').hide();
  $('#login-sub-prog').show();

  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, 
      {
        method: 'POST',
        path: '/login', 
        content: {
          username: $('#login-username').val(),
          password: $('#login-password').val()
        }
      },
      function(res) {
        loginRegCallback(res, 'login');
        return false;
      }
    );
  });
  return false;
});

$(document).on('click', '#register-sub-btn', function() {
  $('#register-sub-btn').hide();
  $('#register-sub-prog').show();

  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, 
      {
        method: 'POST', 
        path: '/register',
        content: {
          username: $('#reg-username').val(),
          password: $('#reg-password').val(),
          passwordConfirmation: $('#reg-password-conf').val(),
          email: $('#reg-email').val()
        }
      },
      function(res) {
        loginRegCallback(res, 'register');
        return false;
      }
    );
  });
  return false;
});

$(document).on('click', '#repo-index li', function() {
  slideTransition($('#repo-index'), $('#repo-view'), 250);
});

$(document).on('click', '#repo-new-nav-btn', function() {
  slideTransition($('#repo-index'), $('#repo-new'), 250);
});

$(document).on('click', '#repo-details-back', function() {
  slideTransition($('#repo-details'), $('#repo-index'), 250);
});