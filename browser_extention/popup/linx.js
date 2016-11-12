console.log('hi');

$(document).on('click', '#get-links', function() {
  console.log('sending message');
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    console.log(tabs);
    chrome.tabs.sendMessage(tabs[0].id, {hi: "hello"});
  });
});