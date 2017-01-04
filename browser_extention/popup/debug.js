var repoNum = 0;

function callback(res) {
  console.log('in callback');
  console.log(res);
}

$(document).on('click', '#get-links', function() {
  console.log('sending get message');
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, 
      {
        method: 'GET',
        path: '/',
        content: null
      },
      callback
    );
  });
});

$(document).on('click', '#post-links', function() {
  console.log('sending post message');
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, 
      {
        method: 'POST',
        path: '/',
        content: {
          url: 'https://www.youtube.com/watch?v=iIsbBV8nuRc'
        }
      },
      callback
    );
  });
});

$(document).on('click', '#register', function() {
  console.log('sending register message');
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, 
      {
        method: 'POST', 
        path: '/register',
        content: {
          username: 'jimin',
          password: 'chimchim95',
          passwordConfirmation: 'chimchim95',
          email: 'jimin@bts.kr'
        }
      },
      callback
    );
  });
});

$(document).on('click', '#login', function() {
  console.log('sending login message');
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, 
      {
        method: 'POST',
        path: '/login', 
        content: {
          username: 'jimin',
          password: 'chimchim95'
        }
      },
      callback
    );
  });
});

$(document).on('click', '#info', function() {
  console.log('sending info message');
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, 
      {
        method: 'GET',
        path: '/profile', 
        content: null
      },
      callback
    );
  });
});

$(document).on('click', '#logout', function() {
  console.log('sending logout message');
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, 
      {
        method: 'GET',
        path: '/logout', 
        content: null
      },
      callback
    );
  });
});

$(document).on('click', '#repo-index', function() {
  console.log('sending repo index message');
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, 
      {
        method: 'GET',
        path: '/repos', 
        content: null
      },
      callback
    );
  });
});

$(document).on('click', '#repo-new', function() {
  console.log('sending repo new message');
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, 
      {
        method: 'POST',
        path: '/repos/new', 
        content: {
          name: 'Repo ' + repoNum,
        }
      },
      callback
    );
  });
  repoNum++;
});