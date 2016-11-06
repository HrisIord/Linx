console.log('hi');

$(document).on('click', '#get-links', function() {
  $.get('http://138.197.134.223:3000/')
    .done(function(data) {
      console.log('success');
      console.log(data);
    })
    .fail(function(xhr, errorType, exception) {
      console.log(xhr);
      console.log(errorType);
      console.log(exception);
      console.log('fail');
    });
});