function handleMsg(request, sender, callback) {
  console.log('in connent script');
  
  // set up ajax call
  var xhr = new XMLHttpRequest();
  xhr.open(request.method, 'https://localhost:8443' + request.path, true);
  console.log(request.method + ' ' + request.path);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      console.log('done');
      console.log('status: ' + xhr.status);
      if (xhr.status == 200) {
        console.log(xhr.responseText);
      }
    }
  }

  // send ajax call
  if (request.method === 'GET') {
    xhr.send();
  } else {
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    var params = 'ext=true';
    $.each(request.content, function(label, value) {
      params += '&' + label + '=' + encodeURIComponent(value);
    });
    console.log(params);

    xhr.send(params);
  }

  // return response to the popup js
  return callback("Hi from content script");
}


chrome.runtime.onMessage.addListener(handleMsg);