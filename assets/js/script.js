

// Quotes API
var apiKey = 'G7WSJKvp0JWC+uwIDsPbcw==JgAbmTJn20cHUWLX';
var apiURL = 'https://api.api-ninjas.com/v1/quotes?category=food';


$.ajax({
  headers: {
    'X-Api-Key': apiKey
  },
  url: apiURL
}).then(function(data) {
  var quote = data[0].quote;
  var author = data[0].author;
  
  console.log(quote, author);

var quoteOut = document.querySelector('#quote');
quoteOut.textContent = quote;
});

