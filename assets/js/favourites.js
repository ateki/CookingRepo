var userData = {};

// Function to update local storage user data
function updateLocalStorage() {
  localStorage.setItem('user_data', JSON.stringify(userData));
}

function injectUserDataIntoForm() {
  // resets
  $('#name').val('');
  $('.form-check-input').each(function () {
    $(this).prop('checked', false);
  });

  // for each stored data item, use it to update form
  $('#name').val(userData.name);
  if (userData.hasOwnProperty('diet')) {
    var storedDiets = userData.diet.split('|');
    storedDiets.forEach(function (diet) {
      $(`#${diet}`).prop('checked', true);
    });
  }
  if (userData.hasOwnProperty('intolerances')) {
    var storedIntolerances = userData.intolerances.split(',');
    storedIntolerances.forEach(function (intolerance) {
      $(`#${intolerance}`).prop('checked', true);
    });
  }
  if (userData.hasOwnProperty('cuisine')) {
    var storedCuisines = userData.cuisine.split(',');
    storedCuisines.forEach(function (cuisine) {
      $(`#${cuisine}`).prop('checked', true);
    });
  }
}

function pullUserData() {
  userData = JSON.parse(localStorage.getItem('user_data'));

  if (userData === null) {
    userData = {};
    window.location.replace('index.html');
  }

  // add their favourites if they have any

  // inject the stored data about user into form
  injectUserDataIntoForm();

  // event listener for updating preferences
  $('#settings form').submit(function (event) {
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

    //reset user data
    userData = {};

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

function init() {
  pullUserData();

  // add event listener for updating preferences

  // add event listener for deleting account
}

init();
