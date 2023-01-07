// Global tracking variable
var userData = {};

// Function to update local storage user data
function updateLocalStorage() {
  localStorage.setItem('user_data', JSON.stringify(userData));
}

// Function to handle pulling user data
function pullUserData() {
  userData = JSON.parse(localStorage.getItem('user_data'));

  // if there is no user data do nothing
  if (userData === null) {
    userData = {};
    return;
  }

  // change the a link in navbar
  $('#user-link')
    .text('Favourites')
    .attr('href', 'favourites.html')
    .removeAttr('data-toggle data-target');

  // hide the cta panel
  $('#cta-panel').addClass('hide');

  // show user's name in jumbotron
  $('#name-header-text').text(`, ${userData.name}`);

  // clear modal html
  $('#signUpModal').html('');
}

// Function to run on page load
function init() {
  pullUserData();

  // event listener for modal form
  $('#signUpModal form').submit(function (event) {
    event.preventDefault();

    // grab inputs
    var name = $('#name').val();
    var checkedIntolerances = [];
    $('#intolerances-group input:checkbox:checked').each(function () {
      checkedIntolerances.push($(this).val());
    });
    var checkedDiets = [];
    $('#diet-group input:checkbox:checked').each(function () {
      checkedDiets.push($(this).val());
    });
    var checkedCuisines = [];
    $('#cuisine-group input:checkbox:checked').each(function () {
      checkedCuisines.push($(this).val());
    });

    // use grabbed inputs to update tracking variable
    userData = {
      name: name,
    };
    if (checkedIntolerances.length > 0) {
      userData['intolerances'] = checkedIntolerances.join(',');
    }
    if (checkedDiets.length > 0) {
      userData['diet'] = checkedDiets.join('|');
    }
    if (checkedCuisines.length > 0) {
      userData['cuisine'] = checkedCuisines.join(',');
    }

    // update local storage
    updateLocalStorage();

    // refresh the page
    location.reload(true);
  });
}

init();
