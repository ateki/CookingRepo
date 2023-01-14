// Global tracking variables
var userData = {};
var currentResults = [];

// constant to show only 4 favourites
const MAX_FAVOURITES = 4;

// Function to switch modal from sign up to settings
function switchSignUpModalToSettingsModal() {
  // let's change the id to reflect the change we're making here
  var modal = $('#signUpModal');
  modal.attr('id', 'settingsModal');

  // resets
  $('#name').val('');
  $('#settingsModal .form-check-input').each(function () {
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

  // visual changes
  $('#modal-form-submit-button').text('Update');
  $('#signUpLabel').text('Update Preferences');

  // add a delete account button
  $('#modal-button-container')
    .addClass('row justify-content-between align-items-end')
    .append(
      `<a
         href="#"
         id="delete-account"
         class="mb-3"
         data-dismiss="modal"
         data-toggle="modal"
         data-target="#deleteModal"
       >Delete account</button>`
    );
}

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
    .text('')
    .append(
      `<span id="settings-nav-link">Settings</span> <i class="fas fa-cog"></i>`
    )
    .attr({
      href: '#',
      'data-toggle': 'modal',
      'data-target': '#settingsModal',
    });
  // .removeAttr('data-toggle data-target');

  // change slogan to reflect search is 'boosted'
  $('#slogandetail').text(
    "Select your ingredients to find the perfect recipe tailored to your needs! Don't forget to star your favourites!"
  );

  // change button area in jumbotron
  $('.jumbo-buttons').html('');
  $('.jumbo-buttons').append(`
  <a
    class="btn btn-primary"
    href="#section-recipe-search"
    style="margin-left:0"
  >
    Get Searching!
  </a>
  `);

  // show user's name in jumbotron
  $('#name-header-text').text(`Welcome, ${userData.name}!`);

  // alter sign-up modal to become settings modal
  switchSignUpModalToSettingsModal();
}

// Function to build a search object to use for API request
function getSearchOptions(ingredientsArray) {
  // initialise an empty object
  var searchObj = {};

  // if user exists, add their prefs to search
  if (Object.keys(userData).length > 0) {
    // copy user object to search object
    Object.assign(searchObj, userData);
    // take out the two props we don't need
    delete searchObj.name;
    delete searchObj.favourites;
  }

  // include params necessary to grab data
  searchObj.apiKey = API_KEY;
  searchObj.fillIngredients = true;
  searchObj.addRecipeInformation = true;
  searchObj.number = NUM_RECIPES_TO_DISPLAY;

  // include ingredients
  searchObj.includeIngredients = ingredientsArray.join(',');

  return searchObj;
}

// Function to add recipe to favourites
function addRecipeToFavourites(id) {
  // find the recipe from tracking variable
  var rawRecipeObj = currentResults.find((recipe) => recipe.id === id);

  // make sure a result was found
  if (!rawRecipeObj) {
    console.log(`no recipe with id:${id} found in currentResults array`);
    return;
  }

  // grab only the info from obj I want
  var refinedRecipeObj = {
    id: rawRecipeObj.id,
    imgURL: rawRecipeObj.image,
    sourceURL: rawRecipeObj.spoonacularSourceUrl,
    title: rawRecipeObj.title,
  };

  // add recipe as most recent fave
  userData.favourites.unshift(refinedRecipeObj);

  // if total number of favourites exceeds max, take out oldest
  if (userData.favourites.length > MAX_FAVOURITES) {
    userData.favourites.pop();
  }
}

// Function to delete recipe from favourites
function deleteRecipeFromFavourites(id) {
  userData.favourites = userData.favourites.filter(
    (favourite) => favourite.id !== id
  );
}

// Function to add event listeners for the favorite icons on recipe results
function addIconEventListeners() {
  // event listener for hovering over fave icon
  $('.recipe-link-section i.not-starred').hover(
    function () {
      $(this).removeClass('far');
      $(this).addClass('fas');
    },
    function () {
      $(this).removeClass('fas');
      $(this).addClass('far');
    }
  );

  // event listener for clicking fave icon
  $('.recipe-link-section i').click(function () {
    var id = Number($(this).closest('.card-recipe').attr('id'));

    if ($(this).hasClass('not-starred')) {
      // handle style
      $(this)
        .unbind('mouseenter mouseleave')
        .removeClass('far not-starred')
        .addClass('fas starred');

      // add the recipe to favourites
      addRecipeToFavourites(id);

      renderFavourites();

      updateLocalStorage();
    } else {
      $(this)
        .removeClass('fas starred')
        .addClass('far not-starred')
        .bind('mouseenter', function () {
          $(this).removeClass('far');
          $(this).addClass('fas');
        })
        .bind('mouseleave', function () {
          $(this).removeClass('fas');
          $(this).addClass('far');
        });

      // delete from favourites
      deleteRecipeFromFavourites(id);

      renderFavourites();

      updateLocalStorage();
    }
  });
}

// Function to render favourites
function renderFavourites() {
  var favouritesEl = $('#favourites-section');
  favouritesEl.html('');

  if (userData.favourites.length === 0) {
    $('#navbar-fave-link').remove();
    console.log('no favourites stored');
    return;
  }

  if (userData.favourites.length > 0) {
    $('#navbar-fave-link').remove();
    // finally add a navbar link
    var navbar = $('#navbar');
    var faveLink = $('<a>', {
      href: '#favourites-section',
      text: 'Faves',
    });
    faveLink.attr('id', 'navbar-fave-link');
    faveLink.addClass('c nav-item nav-link');
    faveLink.insertBefore(navbar.find('a:last'));
  }

  favouritesEl.append(
    `<h3 class="display-4 text-center">Recent Favourites</h3>
    <div class="row fave-row"></div>`
  );

  userData.favourites.forEach(function (favourite) {
    favouritesEl.children('.fave-row').append(`
    <div class="card col-sm-12 col-md-6 col-lg-3 favourite-card" data-fave-id="${favourite.id}">
      <img src="${favourite.imgURL}" class="card-img-top" alt="...">
      <div class="card-body">
        <h5 class="card-title">${favourite.title}</h5>
        <a href="${favourite.sourceURL}" target="_blank">View recipe</a>
        <span class="delete-fave d-flex align-items-center justify-content-center">&times;</span>
      </div>
    </div>
    `);
  });
}

// Function that handles scenario where a result is also a current favourite.
// If it is, then need to change initial behaviour of star icon
function handleResultsThatAreAlsoFavourites() {
  if (!userData.favourites) {
    console.log('no stored favourites');
    return;
  }

  var arrayOfStoredFavouriteIds = userData.favourites.map(
    (favourite) => favourite.id
  );
  console.log('------');
  console.log(arrayOfStoredFavouriteIds);
  console.log(currentResults);
  var arrayOfCurrentResultsIds = currentResults.map((result) => result.id);
  console.log(arrayOfCurrentResultsIds);
  var commonIds = arrayOfStoredFavouriteIds.filter((storedId) =>
    arrayOfCurrentResultsIds.includes(storedId)
  );
  console.log(`commond ids: ${commonIds}`);
  if (commonIds.length === 0) {
    return;
  }
  for (commonID of commonIds) {
    $(`#${commonID} i`).removeClass().addClass('fas fa-star starred');
  }
}

// Function to handle save/update user data
function saveOrUpdateUserData() {
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

  // grab the favourites, if there are any, and put it in temp variable
  // before resetting tracking variable (in case of updating)
  var tempFavourites = [];
  if (Object.keys(userData).length > 0) {
    tempFavourites = userData.favourites;
  }
  userData = {};

  // use grabbed inputs to update tracking variable
  userData = {
    name: name,
    favourites: tempFavourites,
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
}

/**-------------------------------------------------------------
 *
 * Filename: script.js
 * Desc:
 * Author:
 * --------------------------------------------------------------
 */

/**
 * Module imports
 */

/* import {spoonAPIInstance} from './api_wrapper.js';  */ /*- MODULE modification -*/

console.log('loading script.js');

/**
 * Global constants
 */

/**
 *  Query Selectors
 */
const findRecipesBtn = $('#search-button');
const recipeResultsSection = $('.recipe-results');

/**
 * Spoonacular API info
 */

/* SPOON API INFO */
const API_KEY = 'aac3e4c1bc0b41578a0fc33aaa9b481a';
const ENDPOINT_COMPLEX_SEARCH = '/recipes/complexSearch';
// const ENDPOINT_FIND_BY_INGREDIENTS = '/recipes/findByIngredients';
const ENDPOINT_GET_RECIPE_CARD_URL = '/card';

const URL_ROOT = 'https://api.spoonacular.com';
const URL_COMPLEX_SEARCH = `${URL_ROOT}${ENDPOINT_COMPLEX_SEARCH}/?apiKey=${API_KEY}`;
/* const URL_FINDBY_INGREDIENTS = `${URL_ROOT}${ENDPOINT_FIND_BY_INGREDIENTS}/?apiKey=${API_KEY}`; */

const URL_GET_RECIPE_CARD = `${URL_ROOT}/`;

const NUM_RECIPES_TO_DISPLAY = 6;

/* QUOTE API INFO */
// Quotes API
const QUOTE_API_KEY = 'G7WSJKvp0JWC+uwIDsPbcw==JgAbmTJn20cHUWLX';
const URL_GET_QUOTE = 'https://api.api-ninjas.com/v1/quotes?category=food';

/* Note of other poss APIs:
1) recipe card
const ENDPOINT_GET_RECIPE_CARD =`/recipes/${id}/card`; 
https://api.spoonacular.com/recipes/729366/card?apiKey=aac3e4c1bc0b41578a0fc33aaa9b481a&color=#fec252

2) Info bulk
https://api.spoonacular.com/recipes/informationBulk?apiKey=aac3e4c1bc0b41578a0fc33aaa9b481a&ids=648247,729366
/https://api.spoonacular.com/recipes/729366/information 

*/

/** ----------------------------------------
 * Functions to  dynamically generate and/or 
 * update HTML and customise css.
 -------------------------------------------*/

/**
 * Utility Functions
 */

/**
 * Sets up the element not to be shown:
 * - using bootstrap and so adds 'invisible' to the element's classlist not hide.
 * Note function will not impact any other classes that are currently on the element
 * and so multi classes should be allowed along with the 'hide'.
 * No dupes are possible as classlist represents set of tokens it will only hold unique items.
 * @param {*} element
 */
function hide(element) {
  element.addClass('invisible');
}

/**
 * Ensures class of element no longer includes 'visible'.
 * - using bootstrap and so adds 'visible' to the element's classlist not show.
 * Note function will only remove 'hide' class and have no impact on any other classes
 * that are currently on the element before function call.
 * @param {*} element
 */
function show(element) {
  element.removeClass('invisible');
}

/**
 * Reads user's chosen ingredients and places name of each ingredient into an array.
 * TODO: Validate here or in calling function?
 * @param {} eventObj
 */
function getUsersChosenIngredients(eventObj) {
  // Grab array of ingredients
  /*     var ingredients = [];
    $('input:checkbox[id^="ingredient"]:checked').each(function() {
        ingredients.push($(this).val());
    });

    console.log(`Chosen ingredients are: ` + ingredients.join(", "));
    console.log(ingredients);

    var testIngredients = []; */
  var ingredients = getCheckedCheckboxesById(eventObj, 'ingredient');

  return ingredients;
}

/**
 * Reads user's chosen ingredients and places name of each ingredient into an array.
 * @param {*} eventObj
 * @returns
 */
function getIngredientsNotSelected(eventObj) {
  var ingredients = [];
  $('input:checkbox[id^="ingredient"]:not(:checked)').each(function () {
    ingredients.push($(this).val());
  });
  console.log(`Ingredients not selected are: ` + ingredients.join(', '));
  console.log(ingredients);

  return ingredients;
}

/**
 * Reads user's checked checkbox options from page (where id of checkbox equals param passed in)
 * and inserts them into array
 * @param {*} eventObj
 * @returns array of  options selected by user via the 'id' checkboxes.
 */
function getCheckedCheckboxesById(eventObj, id) {
  var checkedItems = [];
  $(`input:checkbox[id^="${id}"]:checked`).each(function () {
    checkedItems.push($(this).val());
  });
  console.log(`Items selected are: ` + checkedItems.join(', '));
  console.log(checkedItems);

  return checkedItems;
}

/**
 * Reads user's checked Intolerance options from page and inserts them into array
 * @param {*} eventObj
 * @returns array of diet options selected by user via the 'intolerance' checkboxes.
 */
function getUsersIntolerances(eventObj) {
  var intolerances = getCheckedCheckboxesById(eventObj, 'intolerance');
  return intolerances;
}

/**
 * Reads user's checked Cuisine options from page and inserts them into array
 * @param {*} eventObj
 * @returns array of diet options selected by user via the 'cuisine' checkboxes.
 */
function getUsersCuisinePrefs(eventObj) {
  var cuisines = getCheckedCheckboxesById(eventObj, 'cuisine');
  return cuisines;
}

/**
 * Reads user's checked Diet options from page and inserts them into array
 * @param {*} eventObj
 * @returns array of diet options selected by user via the 'diet' checkboxes.
 */
function getUsersDietPrefs(eventObj) {
  var diets = getCheckedCheckboxesById(eventObj, 'diet');
  return diets;
}

/**
 * Add to DOM recipe results
 * Call a presentation layer?
 */
/**
 * Dynamically generates html for recipe results
 * @param {Dy} matchedRecipes
 */
function displayRecipeResults(matchedRecipes) {
  recipeResultsSection.html('');

  if (!matchedRecipes) {
    recipeResultsSection.html('<p class="no-search" >No results found</p>');
    recipeResultsSection.html(
      '<p class="no-search" >Please select at least one option</p>'
    );

    return;
  }

  console.log(matchedRecipes);

  for (var matchObj of matchedRecipes) {
    console.log(`${matchObj.title}`);
    console.log(`title: ${matchObj.title}
                image: ${matchObj.image}
                id: ${matchObj.id}
                Includes: ${matchObj.usedIngredients
                  .map((ingredient) => ingredient.name)
                  .join(',')}
                Diets: ${matchObj.diets}
                Serves:${matchObj.servings}
                Cooking time: ${matchObj.readyInMinutes} minutes
                recipe card : https://api.spoonacular.com/recipes/${
                  matchObj.id
                }/card?apiKey=${API_KEY} 
                View recipe: ${matchObj.spoonacularSourceUrl}
            `);

    /**
     * TODO:Retrieve link to recipe card
     * URL: https://api.spoonacular.com/recipes/729366/card?apiKey=aac3e4c1bc0b41578a0fc33aaa9b481a
     * data.url will provide image urfor card
     * Dynamically put this in receip link
     *
     * create function getRecipeCardUrl(id) {
     *
     * // returns url which needs to be embedded below
     * }
     */
    /*
        <h5 class="card-title">Includes: ${matchObj.usedIngredients.map(ingredient => ingredient.name).join(',')}</h5>
    */
    // GRAB get card url and then take the

    /*     recipeResultsSection.append(`
                 <div class="card card-recipe" style="width: 18rem;">
                    <img src="${matchObj.image}", class="card-img-top" alt="image of food">
                    <div class="card-body">
                    <h5 class="card-title">${matchObj.title}</h5>
                    <h5 class="card-title">Includes: ${matchObj.usedIngredients
                      .map((ingredient) => ingredient.name)
                      .join(',')} </h5>
                    <h5 class="card-title">Diets: ${matchObj.diets}</h5>
                    <h5 class="card-title">Serves: ${matchObj.servings}</h5>
                    <h5 class="card-title">Cooking time: ${
                      matchObj.readyInMinutes
                    } minutes</h5>
                    <a class="card-link recipe-card-link" href="https://api.spoonacular.com/recipes/${
                      matchObj.id
                    }/card?apiKey=${API_KEY}" target="_blank">Summary Recipe Card </a>
                    <a class="card-link" href="${
                      matchObj.spoonacularSourceUrl
                    }" target="_blank">Recipe</a>
                    </div>
                </div>
            `); */

    /*          recipeResultsSection.append(`
            <div class="card card-recipe" style="width: 18rem;">
                <img src="${matchObj.image}", class="card-img-top" alt="...">
                <div class="card-body">
                <h5 class="card-title">${matchObj.title}</h5>
                <h5 class="card-title"><strong>Includes:<strong> ${matchObj.usedIngredients.map(ingredient => ingredient.name).join(',')} </h5>
                <h5 class="card-title"><strong>Diets:<strong> ${matchObj.diets}</h5>
                <h5 class="card-title"><strong>Serves:<strong> ${matchObj.servings}</h5>
                <h5 class="card-title"><strong>Cooking time:<strong> ${matchObj.readyInMinutes} minutes</h5>
                <a class="card-link recipe-card-link" href="https://api.spoonacular.com/recipes/${matchObj.id}/card?apiKey=${API_KEY}" target="_blank">Summary Recipe Card </a>
                <a class="card-link" href="${matchObj.spoonacularSourceUrl}" target="_blank">Recipe</a>
                <i class="far fa-star not-starred" alt="fave icon"></i>
                </div>
            </div>
        `); */

    recipeResultsSection.append(`
        <div class="card card-recipe" style="width: 18rem;" id="${matchObj.id}">
            <img src="${matchObj.image}", class="card-img-top" alt="...">
            <div class="card-body">
              <h4 class="card-title result-recipe-title">${matchObj.title}</h4>

              <ul class="list-group list-group-flush">
                <li class="list-group-item card-recipe-list-item result-used-ingredients"><strong>Includes:</strong> ${matchObj.usedIngredients
                  .map((ingredient) => ingredient.name)
                  .join(',')} </li>
                <li class="list-group-item card-recipe-list-item result-diets"><strong>Diets:</strong> ${matchObj.diets.join(
                  ', '
                )}</li>
                <li class="list-group-item card-recipe-list-item result-servings"><strong>Serves:</strong> ${
                  matchObj.servings
                }</li>
                <li class="list-group-item card-recipe-list-item result-cooking-time"><strong>Cooking time:</strong> ${
                  matchObj.readyInMinutes
                } minutes</li>
              </ul>
              <div class="card-body row align-items-center justify-content-between recipe-link-section">
                <a class="card-link card-recipe-link result-spoonacular-link" href="${
                  matchObj.spoonacularSourceUrl
                }" target="_blank">View recipe</a>
                <i class="far fa-star not-starred" alt="fave icon"></i>
              </div>
            </div>
        </div>
    `);

    // Update url of Recipe card
    // can we put placeholder in the above and then populate it in jquery
  }

  // if user is not logged in, remove the star icons and leave function
  if (Object.keys(userData).length === 0) {
    $('.recipe-link-section i').remove();
    return;
  }

  // check to see if result recipes are already favourited, if so star them
  handleResultsThatAreAlsoFavourites();

  // add event listeners to the favourite icons for each recipe result
  addIconEventListeners();
}

/*
             /<p class="card-text"> ${matchObj.summary}</p>
                    <a class="card-link" href="${matchObj.summary}" target="">Summary</a> 
       
                    <a class="card-link" href='javascript:displayRecipeSummary('${matchObj.summary}');' >Summary</a>
*/

/* function displayRecipeSummary(summary) {

    alert(summary);

}
 */

/**
 * Retrieves URL for recipe card
 * NOTE: This will therefore take a further call to api and cost!
 *  @param {} id - of recipe as returned in search results
 */
/* function getRecipeCardUrl(id) {
    console.log(`getFilteredRecipes entered...`);

    var URL = `${URL_GET_RECIPE_CARD}&id=${`id`}/ENDPOINT_CARD}&id=${id}/${ENDPOINT_CARD}&apiKey=${API_KEY}`;

    


    $.get(`${URL}`).then(function (data) {
        console.log(data.url);

        // update image part of link
        displayRecipeResults(data.results);
      });
      show(recipeResultsSection);


} */

/**
 * Retrieves recipes from API and displays
 * @param {} eventObj
 */
function getFilteredRecipes(eventObj) {
  console.log(`getFilteredRecipes entered...`);

  recipeResultsSection.html('');
  eventObj.preventDefault();
  //e.stopPropagation();

  // Read user input - search criteria
  var ingredients = getUsersChosenIngredients();
  /* var missedIngredients=getIngredientsNotSelected(); */
  var intolerances = getUsersIntolerances();
  var cuisines = getUsersCuisinePrefs();
  var diets = getUsersDietPrefs();

  // TODO: validate user input and provide feedback if necessary
  if (ingredients.length === 0) {
    recipeResultsSection.html(
      '<p class="no-search" >Please select at least one option</p>'
    );
    return;
  }

  var searchOptions = getSearchOptions(ingredients);
  console.log(searchOptions);
  console.log(`findby ingredients url = ${URL_COMPLEX_SEARCH}
  searchOptions = ${searchOptions}`);

  // API call and display
  // var URL = `${URL_COMPLEX_SEARCH}&includeIngredients=${ingredients.join(
  //   ', '
  // )}`;
  // console.log(URL);
  // $.get(`${URL}`).then(function (data) {
  $.get(`${URL_COMPLEX_SEARCH}`, searchOptions).then(function (data) {
    currentResults = data.results;
    displayRecipeResults(data.results);
    // update tracking array
  });
  show(recipeResultsSection);

  /*
    Attempted to wrap spoon api info and calls into a wrapper
    however, using ajax and return data to calling method didnt work.
    */
  /*   var searchResults = spoonAPIInstance.getFilteredRecipes(ingredients, intolerances, cuisines, diets); */
  /*    console.log(`API call returned = ${searchResults}`); */
}

function setupEventListeners() {
  findRecipesBtn.click(getFilteredRecipes);

  // event listener for sign-up modal form
  $('#signUpModal form').submit(function (event) {
    event.preventDefault();
    saveOrUpdateUserData();
  });

  // event listener for settings modal form
  $('#settingsModal form').submit(function (event) {
    event.preventDefault();
    saveOrUpdateUserData();
  });

  // event listener for deleting account
  $('#delete-account-button').click(function () {
    userData = {};
    localStorage.removeItem('user_data');
    location.reload(true);
  });

  // add event listener for deleting stored fave
  $('#favourites-section').on('click', '.delete-fave', function () {
    var id = Number($(this).closest('.favourite-card').attr('data-fave-id'));
    deleteRecipeFromFavourites(id);
    updateLocalStorage();
    renderFavourites();

    // gotta deal with scenario of one of the results being starred
    var potentialExistingStarredResult = $(`#${id}`);
    if (potentialExistingStarredResult.length) {
      potentialExistingStarredResult
        .find('i')
        .removeClass()
        .addClass('far fa-star not-starred')
        .bind('mouseenter', function () {
          $(this).removeClass('far');
          $(this).addClass('fas');
        })
        .bind('mouseleave', function () {
          $(this).removeClass('fas');
          $(this).addClass('far');
        });
    }
  });
}

/** ----------------------------------------
 * QUOTE Functionality
 * -----------------------------------------*/

function displayQuote(quote, author) {
  var quoteOut = document.querySelector('#quote');
  quoteOut.textContent = quote + '  ' + '-' + '  ' + author;
}

function getCookingQuote() {
  $.ajax({
    headers: {
      'X-Api-Key': QUOTE_API_KEY,
    },
    url: URL_GET_QUOTE,
  }).then(function (data) {
    var quote = data[0].quote;
    var author = data[0].author;

    console.log(quote, author);

    displayQuote(quote, author);
  });
}

/** ----------------------------------------
 * Init onload functionality - to be triggered on page load.
 * -----------------------------------------*/

function init() {
  setupEventListeners();
  hide(recipeResultsSection); // ensure no results currently shown

  pullUserData();
  renderFavourites();

  getCookingQuote();
}

init();
