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

$(document).on('click', '#login-sub-btn', function() {
  $('#login-sub-btn').hide();
  $('#login-sub-prog').show();

  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, 
      {
        method: 'POST',
        path: '/login', 
        content: {
          username: $("#login-username").val(),
          password: $("#login-password").val()
        }
      },

      function(res) {
        if (res == null) {
          console.log("network error");
        }

        if (res.error == null) {
          $('body').css({ 'background-color': '#FFFFFF', transition: 'background-color 0.25s' }, 500);
          slideTransition($('#home'), $('#general'), 500);

        } else {
          var emptyErrors = isEmptyString($("#login-errors .card-panel").html());
          var errorMsgs = "";
          for (var i in res.error) {
            errorMsgs += "<div>" + res.error[i] + "</div>";
          }

          $("#login-errors .card-panel").html(errorMsgs);
          if (emptyErrors) {
            $("#login-errors").css({ opacity: 100, transition: 'opacity 0.25s' }).slideDown(250);
          }
          $('#login-sub-prog').hide();
          $('#login-sub-btn').show();
        }
        
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
          username: $("#reg-username").val(),
          password: $("#reg-password").val(),
          passwordConfirmation: $("#reg-password-conf").val(),
          email: $("#reg-email").val()
        }
      },
      
      function(res) {
        if (res == null) {
          console.log("network error");
        }
        if (res.error == null) {
          $('body').css({ 'background-color': '#FFFFFF', transition: 'background-color 0.25s' }, 500);
          slideTransition($('#home'), $('#general'), 500);

        } else {
          var emptyErrors = isEmptyString($("#reg-errors .card-panel").html());
          var errorMsgs = "";
          for (var i in res.error) {
            errorMsgs += "<div>" + res.error[i] + "</div>";
          }

          $("#reg-errors .card-panel").html(errorMsgs);
          if (emptyErrors) {
            $("#reg-errors").css({ opacity: 100, transition: 'opacity 0.25s' }).slideDown(250);
          }
          $('#register-sub-prog').hide();
          $('#register-sub-btn').show();
        }
        
        return false;
      }
    );
  });
  return false;
});

$(document).on('click', '#repo-list li', function() {
  slideTransition($('#repo-list'), $('#repo-details'), 250);
});

$(document).on('click', '#repo-details-back', function() {
  slideTransition($('#repo-details'), $('#repo-list'), 250);
});