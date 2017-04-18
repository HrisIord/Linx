/*****************************************************************************
 *                              HELPER FUNCTIONS                             *
 *****************************************************************************/

function isEmpty(obj) {
  return obj == null || obj == undefined || Object.keys(obj).length == 0;
}

function isEmptyString(str) {
  return isEmpty(str) || !str.replace(/\s/g, '').length
}

function slideTransition(oldElem, newElem, speed) {
  oldElem.css({ opacity: 0, transition: 'opacity 0.25s' }).slideUp(speed, function() {
    newElem.css({ opacity: 100, transition: 'opacity 0.25s' }).slideDown(speed);
  });
}

function showErrors(formName, errors) {
  var emptyErrors = isEmptyString($('#' + formName + '-errors .card-panel').html());
  var errorMsgs = "";
  for (var i in errors) {
    errorMsgs += '<div>' + errors[i] + '</div>';
  }

  $('#' + formName + '-errors .card-panel').html(errorMsgs);
  if (emptyErrors) {
    $('#' + formName + '-errors').css({ opacity: 100, transition: 'opacity 0.25s' }).slideDown(250);
  }
  $('#' + formName + '-sub-prog').hide();
  $('#' + formName + '-sub-btn').show();
}

// ---------------------------------- NAV -------------------------------------

function showPreLoader(container) {
  $('.tab').addClass('disabled');
  var PRELOADER = '<div id="preloader"><div class="preloader-wrapper big active">'
      + '<div class="spinner-layer spinner-yellow-only"><div class="circle-clipper left">'
      + '<div class="circle"></div></div><div class="gap-patch"><div class="circle"></div>'
      + '</div><div class="circle-clipper right"><div class="circle"></div></div></div></div></div>';
  container.append(PRELOADER);
}

function hidePreLoader() {
  $('#preloader').remove();
  $('.tab').removeClass('disabled');
}

function addBreadcrumb(label, id, repoId) {
  var repoIdAttr = '';
  if (repoId != undefined) {
    repoIdAttr = 'repoId="' + repoId + '"';
  }

  var ellipsis = label.length > 12 ? ' ...' : '';
  $('#nav-breadcrumbs').append(
    '<a secid="' + id + '" class="breadcrumb"><span class="breadcrumb-title" ' + repoIdAttr + '>'
    + label.slice(0, 11) + ellipsis + 
    '</span></a>');
}

function removeBreadcrumb(keep) {
  var ignore = false;
  $($("#nav-breadcrumbs").children().get().reverse()).each(function() {
      if (!ignore) {
        if ($(this).attr('secid') === keep) {
          ignore = true;
        } else {
          $(this).remove();
        }
      }
  });
}

function loadGeneralSection(callback) {
  // get html from files
  jQuery.get('links.html', function(linksHtml) {
    jQuery.get('settings.html', function(settingsHtml) {
      // hide home sections
      $('body').css({ 'background-color': '#FFFFFF', transition: 'background-color 0.25s' }, 500);
      $('#home').css({ opacity: 0, transition: 'opacity 0.25s' }).slideUp(500, function() {
        // add html we got to the appropariate section
        $('#links').html(linksHtml).promise().done(function() {
          $('#settings').html(settingsHtml).promise().done(function() {
            // show general section
            showPreLoader($('#links'));
            $('#general').css({ opacity: 100, transition: 'opacity 0.25s' }).slideDown(500);
            
            if (callback != undefined) {
              callback();
            }
          });
        });
      });
    });
  });
  return false;
}



/*****************************************************************************
 *                                ONLOAD STUFF                               *
 *****************************************************************************/

window.onload = function() {
  chrome.storage.sync.get(['bookmarksFolder', 'loggedIn'], function(items) {
    // load config section if bookmarksFolder has not been configured
    var loadedConfig = false;
    if (isEmpty(items['bookmarksFolder'])) {
      loadedConfig = true;
      // get html from files
      jQuery.get('config.html', function(configHtml) {
        // add html we got to the appropariate section
        $('#config').html(configHtml).promise().done(function() {
              
          // show config section
          $('#home-config').show();
          $('#config').css({ opacity: 100, transition: 'opacity 0.25s' }).slideDown(500);
        });
      });
    }

    // // determine which section to load
    // if (items['loggedIn'] === 'true') {
    //   loadGeneralSection(function() {
    //     renderLinkIndex(true);
    //   });
    // } else {
    //   jQuery.get('home.html', function(homeHtml) {
    //     $('#home').html(homeHtml);
    //     $('#home').show();
    //   });
    // }
  });
}

$(document).ready(function(){
  $('ul.tabs').tabs();
});

/*****************************************************************************
 *                             ON CLICK LISTENERS                            *
 *****************************************************************************/

/*********************************** HOME ************************************/

// ---------------------------------- NAV -------------------------------------

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

// ---------------------------------- BACK ------------------------------------

$(document).on('click', '#login-back-btn', function() {
  $('#login').css({ opacity: 0, transition: 'opacity 0.2s' }).slideUp(500, function() {
    $('#title').animate({ 'margin-top': '+=80px'}, 500);
    $('#nav-buttons').css({ opacity: 100, transition: 'opacity 0.25s' }).slideDown(250);
  });
  return false;
});

$(document).on('click', '#register-back-btn', function() {
  $('#register').css({ opacity: 0, transition: 'opacity 0.2s' }).slideUp(500, function() {
    $('#title').animate({ 'margin-top': '+=80px'}, 500);
    $('#nav-buttons').css({ opacity: 100, transition: 'opacity 0.25s' }).slideDown(250);
  });
  return false;
});

// -------------------------------- SUBMIT ------------------------------------

$(document).on('click', '#login-sub-btn', function() {
  $('#login-btns').hide();
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
  $('#register-btns').hide();
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

// -------------------------------- HELPERS -----------------------------------

function loginRegCallback(res, caller) {
  if (res == null || res == undefined) {
    //TODO: handle better
    console.log("network error");
    return;
  }

  if (res.error == null) {
    chrome.storage.sync.set({'loggedIn': 'true'}, function() {
      loadGeneralSection();
      renderLinkIndex();
    });
  } else {
    showErrors(caller, res.error);
  }
}

/********************************** GENERAL **********************************/

$(document).on('click', '.breadcrumb-title', function() {
  var clickedSecid = $(this).parent().attr('secid');
  var lastSecid = $('.breadcrumb:last-child').attr('secid');

  // reload screen
  if (clickedSecid === 'link-index') {
    renderLinkIndex();
  } 

  if (lastSecid === clickedSecid) {
    // clicked on the last child we're done
    return;
  }

  removeBreadcrumb(clickedSecid);

  // show new screen
  slideTransition($('#' + lastSecid), $('#' + clickedSecid), 250);
});

$(document).on('click', '#settings-nav', function() {
  slideTransition($('#links'), $('#settings'), 250);
});

$(document).on('click', '#repos-nav', function() {
  slideTransition($('#settings'), $('#links'), 250);
});

/*********************************** LINKS ***********************************/

// --------------------------------- INDEX ------------------------------------

$(document).on('click', '#link-new-nav-btn', function() {
  // reset add buttons form last add
  $('#link-new-sub-prog').hide();
  $('#link-new-sub-btn').show();

  $('#link-new-name').val('');
  $('#link-new-url').val('');

  addBreadcrumb('Add Link', 'link-new');
  slideTransition($('#link-index'), $('#link-new'), 250);
});

// -------------------------------- LINK NEW ----------------------------------

$(document).on('click', '#link-new-sub-btn', function() {
  $('#link-new-sub-btn').hide();
  $('#link-new-sub-prog').show();

  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, 
      {
        method: 'POST', 
        path: '/user/links/new',
        content: {
          name: $('#link-new-name').val(),
          url: $('#link-new-url').val()
        }
      },
      function(res) { //TODO: make sure this returns the repo
        if (res == null || res == undefined) {
          //TODO: handle better
          console.log("network error");
          return;
        }
        if (res.error != null) {
          // reset buttons/progress bar
          $('#link-new-sub-prog').hide();
          $('#link-new-sub-btn').show();
          showErrors("link-new", res.error);
          return;
        }

        removeBreadcrumb('link-index');
        $('#link-new').hide();
        renderLinkIndex(false);
      }
    );
  });
  return false;
});

// ------------------------------- BOOKMARK -----------------------------------

$(document).on('click', '#link-index-bookmark', function() {
  $('.list').hide();
  $('.bookmark').show();
});

$(document).on('click', '#link-index-list', function() {
  $('.bookmark').hide();
  $('.list').show();
});

$(document).on('click', '#link-index-bookmark-all', function() {
  //TODO
});

// -------------------------------- HELPERS -----------------------------------

function renderLinkIndex(hasPreLoader) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, 
      {
        method: 'GET',
        path: '/user/links', 
        content: null
      },
      function(res) {
        if (res == null || res == undefined) {
          //TODO: handle better
          console.log("network error");
          return;
        }
        if (res.error != null) {
          //TODO: This is an illigal access probably. Figure out what to do.
          return;
        }

        $('#link-list').html(generateLinkIndex(res.links));
        if (hasPreLoader) {
          hidePreLoader();
        }
        $('#link-index').css({ opacity: 1 });
        $('#link-index').show();
      }
    );
  });
}

function generateLinkIndex(links) {
  var LI_PART1 = '<li class="collection-item row"><div class="link-details col s9"><div class="link-title">'
  // Link name goes here
  var LI_PART2 = '</div><div class="link-url grey-text">'
  // Link URL goes here
  var LI_PART3 = '</div></div><div class="link-action-btns col s3">'
                  + '<a class="btn-floating btn-flat waves-effect waves-teal list"><i class="material-icons">tab</i></a>'
                  + '<a class="btn-floating btn-flat waves-effect waves-light list"><i class="material-icons">delete</i></a>'
                  + '<a class="btn-floating btn-flat waves-effect waves-light bookmark" style="display: none;"><i class="material-icons">library_books</i></a>'
                  + '</div></li>';

  var linkList = '';
  for (var i in links) {
    var link = links[i];
    linkList += LI_PART1 + link.name + LI_PART2 + link.url + LI_PART3;
  }
  return linkList;
}