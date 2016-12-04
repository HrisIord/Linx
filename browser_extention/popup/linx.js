$(document).on('click', '#get-links', function() {
  console.log('sending get message');
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, 
      {
        method: 'GET',
        path: '/',
        content: null
      }
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
      }
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
      }
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
      }
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
      }
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
      }
    );
  });
});