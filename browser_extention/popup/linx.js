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

function loadGeneralSection(callback) {
  // get html from files
  jQuery.get('repos.html', function(reposHtml) {
    jQuery.get('settings.html', function(settingsHtml) {
      // hide home sections
      $('body').css({ 'background-color': '#FFFFFF', transition: 'background-color 0.25s' }, 500);
      $('#home').css({ opacity: 0, transition: 'opacity 0.25s' }).slideUp(500, function() {
        // add html we got to the appropariate section
        $('#repos').html(reposHtml).promise().done(function() {
          $('#settings').html(settingsHtml).promise().done(function() {
            // fix the indicator on load gdi
            $('.indicator').css({ 'right': '209.563px' });
            // show general section
            showPreLoader($('#repos'));
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
  chrome.storage.sync.get(['loggedIn'], function(items) {
    if (items['loggedIn'] === 'true') {
      loadGeneralSection(function() {
        console.log("finished loading general section");
        renderReposIndex();
      });
    } else {
      jQuery.get('home.html', function(homeHtml) {
        $('#home').html(homeHtml);
        $('#home').show();
      });
    }
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
      renderReposIndex();
    });
  } else {
    showErrors(caller, res.error);
  }
}

/********************************** GENERAL **********************************/

$(document).on('click', '.breadcrumb-title', function() {
  var clickedSecid = $(this).parent().attr('secid');
  var lastSecid = $('.breadcrumb:last-child').attr('secid');

  if (lastSecid === clickedSecid) {
    // clicked on the last child ignore
    return;
  }

  // fix bread crumbs
  var ignore = false;
  $($("#nav-breadcrumbs").children().get().reverse()).each(function() {
      if (!ignore) {
        if ($(this).attr('secid') === clickedSecid) {
          ignore = true;
        } else {
          $(this).remove();
        }
      }
  });

  // show new screen
  slideTransition($('#' + lastSecid), $('#' + clickedSecid), 250);
});

$(document).on('click', '#settings-nav', function() {
  slideTransition($('#repos'), $('#settings'), 250);
});

$(document).on('click', '#repos-nav', function() {
  slideTransition($('#settings'), $('#repos'), 250);
});

/*********************************** REPOS ***********************************/

// --------------------------------- INDEX ------------------------------------

$(document).on('click', '#repo-index .view-repo-btn', function() {
  $('#repo-index').hide();
  showPreLoader($('#repos'));
  renderReposView($(this).attr('repoId'), true);
});

$(document).on('click', '#repo-new-nav-btn', function() {
  // reset form last add
  $('#repo-new-sub-prog').hide();
  $('#repo-new-sub-btn').show();
  $('#repo-new-name').val('');

  $('#nav-breadcrumbs').append('<a secid="repo-new" class="breadcrumb"><span class="breadcrumb-title">Add Repo</span></a>');

  slideTransition($('#repo-index'), $('#repo-new'), 250);
});

// ---------------------------------- NEW -------------------------------------

$(document).on('click', '#repo-new-back-btn', function() {
  slideTransition($('#repo-new'), $('#repo-index'), 250);
});

$(document).on('click', '#repo-new-sub-btn', function() {
  $('#repo-new-sub-btn').hide();
  $('#repo-new-sub-prog').show();

  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, 
      {
        method: 'POST', 
        path: '/repos/new',
        content: {
          name: $('#repo-new-name').val()
        }
      },
      function(res) { 
        if (res == null || res == undefined) {
          //TODO: handle better
          console.log("network error");
          return;
        }
        if (res.error != null) {
          // reset buttons/progress bar
          $('#repo-new-sub-prog').hide();
          $('#repo-new-sub-btn').show();
          showErrors("repo-new", res.error);
          return;
        }

        $('#repo-view-name').html(res.repo.name);
        $('#link-index').html(generateLinksIndex(res.repo.links));
        slideTransition($('#repo-new'), $('#repo-view'), 250);
      }
    );
  });
  return false;
});

// ---------------------------------- VIEW ------------------------------------

$(document).on('click', '#link-new-nav-btn', function() {
  // reset add buttons form last add
  $('#repo-new-sub-prog').hide();
  $('#repo-new-sub-btn').show();

  $('#link-new-repo-id').val($('#repo-view-id').html());

  $('#nav-breadcrumbs').append('<a secid="link-new" class="breadcrumb"><span class="breadcrumb-title">Add Link</span></a>');

  slideTransition($('#repo-view'), $('#link-new'), 250);
});

// -------------------------------- LINK NEW ----------------------------------

$(document).on('click', '#link-new-sub-btn', function() {
  $('#link-new-sub-btn').hide();
  $('#link-new-sub-prog').show();

  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, 
      {
        method: 'POST', 
        path: '/repos/' + $('#link-new-repo-id').val() + '/links/new',
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

        renderReposView($('#link-new-repo-id').val(), false);
      }
    );
  });
  return false;
});

// -------------------------------- HELPERS -----------------------------------

function renderReposIndex() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, 
      {
        method: 'GET',
        path: '/repos', 
        content: null
      },
      function(res) {
        console.log(res);
        if (res == null || res == undefined) {
          //TODO: handle better
          console.log("network error");
          return;
        }
        if (res.error != null) {
          //TODO: This is an illigal access probably. Figure out what to do.
          return;
        }

        $('#repo-index-list').html(generateReposIndex(res.repos));
        hidePreLoader();
        $('#repo-index').css({ opacity: 1 });
        $('#repo-index').show();
      }
    );
  });
  return false;
}

function renderReposView(repoId, hasPreLoader) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, 
      {
        method: 'GET',
        path: '/repos/' + repoId, 
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

        var ellipsis = res.repo.name.length > 12 ? ' ...' : '';
        $('#nav-breadcrumbs').append('<a secid="repo-view" class="breadcrumb"><span class="breadcrumb-title">'
          + res.repo.name.slice(0, 11) + ellipsis + '</span></a>');

        $('#repo-view-name').html(res.repo.name);
        $('#repo-view-id').html(res.repo._id);
        $('#link-index').html(generateLinksIndex(res.repo.links));
        if (hasPreLoader) {
          hidePreLoader();
        }
        $('#repo-view').css({ opacity: 1 });
        $('#repo-view').show();
      }
    );
  });
}

function generateReposIndex(repos) {
  console.log('generating repos index.');
  var LI_PART1 = '<li class="collection-item row valign-wrapper"><div class="col s10 repo-name valign">';
  // Name goes here
  var LI_PART2 = '</div><div class="col s2 repo-link"><a class="view-repo-btn btn-floating waves-effect waves-light teal lighten-2 right" repoId="';
  // ID goes ehre
  var LI_PART3 = '"><i class="material-icons">play_arrow</i></a></div></li>';

  var repoList = '';
  for (var i in repos) {
    var repo = repos[i];
    repoList += LI_PART1 + repo.name + LI_PART2 + repo._id + LI_PART3;
  }
  console.log(repoList);
  return repoList;
}

function generateLinksIndex(links) {
  var LI_PART1 = '<li class="collection-item row"><div class="link-details col s9"><div class="link-title">'
  // Link name goes here
  var LI_PART2 = '</div><div class="link-url grey-text">'
  // Link URL goes here
  var LI_PART3 = '</div></div><div class="link-action-btns col s3"><a class="btn-floating btn-flat waves-effect waves-teal">'
                  + '<i class="material-icons">tab</i></a><a class="btn-floating btn-flat waves-effect waves-light">'
                  + '<i class="material-icons">library_books</i></a></div></li>';

  var linkList = '';
  for (var i in links) {
    var link = links[i];
    linkList += LI_PART1 + link.name + LI_PART2 + link.url + LI_PART3;
  }
  return linkList;
}