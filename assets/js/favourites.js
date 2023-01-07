var userData = {};

function pullUserData() {
  userData = JSON.parse(localStorage.getItem('user_data'));

  if (userData === null) {
    userData = {};
    window.location.replace('index.html');
  }

  // add their favourites if they have any

  // check the appropriate checkboxes in the edit preferences form
}

function init() {
  pullUserData();

  // add event listener for updating preferences

  // add event listener for deleting account
}

init();
