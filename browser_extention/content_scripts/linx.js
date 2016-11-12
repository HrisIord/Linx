function handleMsg(request, sender, sendResponse) {
  console.log('in connent script');
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'http://138.197.134.223:3000/', true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      console.log('done');
      console.log('status: ' + xhr.status);
      if (xhr.status == 200) {
        console.log(xhr.responseText);
      }
    }
  }
  xhr.send();
};


chrome.runtime.onMessage.addListener(handleMsg);