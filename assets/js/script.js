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

function getSearchOptions(ingredientsArray) {
  // initialise an empty object
  var searchObj = {};

  // if user exists, add their prefs to search
  if (Object.keys(userData).length > 0) {
    Object.assign(searchObj, userData);
    delete searchObj.name;
    delete searchObj.favourites;
  }

  searchObj.includeIngredients = ingredientsArray.join(',');

  searchObj.apiKey = API_KEY;

  searchObj.addRecipeInformation = true;

  return searchObj;
}

/***************************** delete below **************************************/
// // Function to run on page load
// function init() {
//   pullUserData();

//   // event listener for modal form
//   $('#signUpModal form').submit(function (event) {
//     event.preventDefault();

//     // grab inputs
//     var name = $('#name').val();
//     var checkedIntolerances = [];
//     $('#intolerances-group input:checkbox:checked').each(function () {
//       checkedIntolerances.push($(this).val());
//     });
//     var checkedDiets = [];
//     $('#diet-group input:checkbox:checked').each(function () {
//       checkedDiets.push($(this).val());
//     });
//     var checkedCuisines = [];
//     $('#cuisine-group input:checkbox:checked').each(function () {
//       checkedCuisines.push($(this).val());
//     });

//     // use grabbed inputs to update tracking variable
//     userData = {
//       name: name,
//     };
//     if (checkedIntolerances.length > 0) {
//       userData['intolerances'] = checkedIntolerances.join(',');
//     }
//     if (checkedDiets.length > 0) {
//       userData['diet'] = checkedDiets.join('|');
//     }
//     if (checkedCuisines.length > 0) {
//       userData['cuisine'] = checkedCuisines.join(',');
//     }

//     // update local storage
//     updateLocalStorage();

//     // refresh the page
//     location.reload(true);
//   });
// }

// init();
/***************************** delete above **************************************/

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
const ENDPOINT = '/recipes/complexSearch';

const URL_ROOT = 'https://api.spoonacular.com';
const URL_COMPLEX_SEARCH = `${URL_ROOT}${ENDPOINT}/?apiKey=${API_KEY}`;

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
  }

  console.log(matchedRecipes);

  for (var matchObj of matchedRecipes) {
    console.log(`${matchObj.title}`);
    console.log(`title: ${matchObj.title}
                image: ${matchObj.image}
                id: ${matchObj.id}
            `);

    /**
     * TODO:Retrieve link to recipe card
     * URL: https://api.spoonacular.com/recipes/729366/card?apiKey=aac3e4c1bc0b41578a0fc33aaa9b481a
     * data.url will provide image urfor card
     * Dynamically put this in receip link
     */

    recipeResultsSection.append(`
                <div class="card card-recipe" style="width: 18rem;">
                    <img src="${matchObj.image}", class="card-img-top" alt="...">
                    <div class="card-body">
                    <h5 class="card-title">${matchObj.title}</h5>
                    <h5 class="card-title">${matchObj.id}</h5>
                    <p class="card-text">Can we get some brief recipe description</p>
                    <a href="https://api.spoonacular.com/recipes/${matchObj.id}/card?apiKey=${API_KEY}" class="card-link">RecipeCard link</a>
                    <a href="${matchObj.spoonacularSourceUrl}" target="_blank">Recipe link</a>
                    </div>
                </div>
            `);
  }
}

/**
 * Retrieves recipes from API and displays
 * @param {} eventObj
 */
function getFilteredRecipes(eventObj) {
  console.log(`getFilteredRecipes entered...`);

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
    alert('please select at least one option');
    return;
  }

  var searchOptions = getSearchOptions(ingredients);
  console.log(searchOptions);

  // API call and display
  // var URL = `${URL_COMPLEX_SEARCH}&includeIngredients=${ingredients.join(
  //   ', '
  // )}`;
  // console.log(URL);
  // $.get(`${URL}`).then(function (data) {
  $.get(`${URL_ROOT}${ENDPOINT}`, searchOptions).then(function (data) {
    console.log(data);
    displayRecipeResults(data.results);
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

  $('.favourite-icon-hollow').hover(
    function () {
      $(this).removeClass('far');
      $(this).addClass('fas');
    },
    function () {
      $(this).removeClass('fas');
      $(this).addClass('far');
    }
  );
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
  getCookingQuote();
}

init();
