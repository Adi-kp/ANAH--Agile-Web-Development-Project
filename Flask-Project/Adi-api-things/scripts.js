$(document).ready(function () {
    const apiKey = "eef1c2e1f8b747679eee6612d8906406";
    let state = "start";
    let mode = "recipeName";
    // stores all provided recipes
    let recipes = [];
    // Changed to 0 so the first search starts at the first page.
    let currentPage = 0;
    const resultsPerPage = 5; 
    let lastQuery = "";
    const validRecipeTypes = ['main course', 'side dish', 'dessert', 'appetizer', 'salad', 'breakfast', 'soup', 'beverage', 'sauce', 'snack', 'drink'];

// function to add messages to the chatbot
function addMessage(content, user) {
    const messageClass = user ? "user-message" : "bot-message";
    const messageElement = $(`<div class="message ${messageClass}">${content}</div>`);
    // Check if chat box is already scrolled to the bottom   
    $("#chat-box").append(messageElement);
    messageElement.addClass('message-animation');
    scrollToBottom();
}
// Function to send a message from the bot with a typing indicator.
function sendBotMessage(content) {
    // added delay so its a bit smoother with the transition
    const delay = 500;
    const typingIndicator = $('<div class="message bot-message">...</div>');
    $("#chat-box").append(typingIndicator);
    setTimeout(() => {
        typingIndicator.remove();
        addMessage(content.replace(/\n/g, "<br>"), false);
    }, delay);
    scrollToBottom();
}

// Comment: Function to handle user input and perform actions accordingly
function handleUserInput(userInput) {
    addMessage(userInput, true);
    
    if (state === "start") {
        showShowMoreButton();
        currentPage = 1;
        if (mode === "recipeName") {
            searchForRecipes(userInput);
        } else if (mode === "ingredients") {
            searchForRecipesByIngredients(userInput.split(',').map(s => s.trim()));
        } else if (mode === "type") {
            const userInputSplit = userInput.split(':').map(s => s.trim());
            const type = userInputSplit[0];
            const ingredients = userInputSplit[1] ? userInputSplit[1].split(',').map(s => s.trim()) : [];
            
            if (!validRecipeTypes.includes(type.toLowerCase())) {
                sendBotMessage("Invalid input, please choose a type from the list: main course, side dish, dessert, appetizer, salad, breakfast, soup, beverage, sauce, snack, drink. Alternatively, check your input again for any errors!");
            } else {
                searchForRecipesByType(type, ingredients);
            }
        }
    } else if (state === "options") {
        const selectedIndex = parseInt(userInput) - 1;
        if (!isNaN(selectedIndex) && recipes[selectedIndex]) {
            const selectedRecipe = recipes[selectedIndex];
            getRecipeDetails(selectedRecipe.id);
        } 
        else {
            // checks which mode we are in
            if (mode === "type") {
                // splits type from the ingredients (if any)
                const userInputSplit = userInput.split(':').map(s => s.trim());
                const type = userInputSplit[0];
                const ingredients = userInputSplit[1] ? userInputSplit[1].split(',').map(s => s.trim()) : [];
                searchForRecipesByType(type, ingredients);
                } 
            else if (mode === "recipeName") {
                searchForRecipes(userInput);
                } 
            else if (mode === "ingredients") {
                searchForRecipesByIngredients(userInput.split(',').map(s => s.trim()));
            }
        }
    }
}


//Function to search for recipes based on a query
function searchForRecipes(query) {
    const url = `https://api.spoonacular.com/recipes/complexSearch?query=${query}&apiKey=${apiKey}&number=${resultsPerPage}&offset=${resultsPerPage * (currentPage - 1)}`;
    lastQuery = query;
    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (data) {
            if (data.results.length > 0) {
                recipes = data.results;
                lastQuery = query;
                let options = "";
                const maxResults = 5;
                for (let i = 0; i < Math.min(maxResults, data.results.length); i++) {
                    const recipe = data.results[i];
                    options += `${i + 1}. ${recipe.title}<br><img src="${recipe.image}" alt="${recipe.title}" width="50" height="50"><br><br>`;
                }
                sendBotMessage(`Here are some options:<br>${options}Select a number or search again.`);
                state = "options";
            } else {
                sendBotMessage("No results were found :( Either the recipe does not exist in the database, or the input was invalid. Please try again!");
            }
        },
        error: function (textStatus, errorThrown) {
            console.log(`Error: ${textStatus}, ${errorThrown}`);
        }
    });
}
// function for searching recipes based on input of ingredients
function searchForRecipesByIngredients(ingredients) {
    // Log ingredients input here
    const url = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredients}&number=${resultsPerPage}&ranking=1&apiKey=${apiKey}&offset=${resultsPerPage * (currentPage - 1)}`;
    lastQuery = ingredients.join(',');
    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (data) {
            // Log data from API here
            if (data.length > 0) {
                recipes = data;
                let options = "";
                const maxResults = 4;
                for (let i = 0; i < Math.min(maxResults, data.length); i++) {
                    const recipe = data[i];
                    options += `${i + 1}. ${recipe.title}<br><img src="${recipe.image}" alt="${recipe.title}" width="50" height="50"><br><br>`;
                }
                sendBotMessage(`Here are some options:<br>${options} Please select a number, or search again!`);
                state = "options";
            } else {
                sendBotMessage("No results were found :( Either the recipe does not exist in the database, or the input was invalid. Please try again!");
            } 
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(`Error: ${textStatus}, ${errorThrown}`);
        }
    });
}

//Function to search for recipes based on type and optional ingredients
function searchForRecipesByType(type, ingredients = []) {
    mode = "type";
    lastType = type;
    lastIngredients = ingredients;
    let ingredientsStr = ingredients.join(",");
    lastQuery = type; // Change this line
    let url = `https://api.spoonacular.com/recipes/complexSearch?type=${type}&apiKey=${apiKey}&number=${resultsPerPage}&offset=${resultsPerPage * (currentPage - 1)}`;
    if (ingredients.length > 0) {
        url += `&includeIngredients=${ingredients.join(',')}`;
    }
    lastType = type;
    lastIngredients = ingredients.join(',');
    lastQuery = `${type}:${ingredients.join(',')}`;
    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (data) {
            if (data.results.length > 0) {
                recipes = data.results;
                lastType = type;
                lastIngredients = ingredients.join(',');
                lastQuery = `${type}:${ingredients.join(',')}`; 
                let options = "";
                for (let i = 0; i < Math.min(resultsPerPage, data.results.length); i++) {
                    const recipe = data.results[i];
                    options += `${i + 1}. ${recipe.title}<br><img src="${recipe.image}" alt="${recipe.title}" width="50" height="50"><br><br>`;
                }
                sendBotMessage(`Here are some options:<br>${options} Please select a number or search again!`);
                state = "options";
            } else {
                sendBotMessage("No results were found :( Either the recipe does not exist in the database, or the input was invalid. Please try again!");
            }
        },
        error: function (textStatus, errorThrown) {
            console.log(`Error: ${textStatus}, ${errorThrown}`);
        }
    });
}

//Function to get recipe details based on recipe ID
function getRecipeDetails(recipeId) {
    const url = `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${apiKey}`;
    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        success: function (data) {
            let message = "";
            // push the ingredients to the message var
            message += "The ingredients for this recipe are:<br>";
            data.extendedIngredients.forEach(ingredient => {
                message += `- ${ingredient.original}<br>`;
            });
            // now push the procedure to the message var
            message += "<br>The procedure for this recipe is:<br>" + data.instructions.replace(/\n/g, "<br>");
            sendBotMessage(message);
            state = "start";
        },
        error: function (textStatus, errorThrown) {
            console.log(`Error: ${textStatus}, ${errorThrown}`);
        }
    });
}
// function to smoothly scroll to the bottom of the chatbox
function scrollToBottom() {
    $('#chat-box').animate({
        scrollTop: $('#chat-box')[0].scrollHeight
    }, 1000);
}

//Event listener for send button click
$("#send-btn").click(function () {
    const userInput = $("#user-input").val().trim();
    if (userInput.length > 0) {
        $("#user-input").val("");
        handleUserInput(userInput);
    }
});

//event listener for mode select dropdown change
$("#mode-select").change(function () {
    switchMode($(this).val());
});

//Event listener for pressing Enter key in the user input field
$("#user-input").keypress(function (event) {
    // Press enter to submit written text
    if (event.which === 13) {
        event.preventDefault();
        $("#send-btn").click();
    }
});

// event listener for switch mode button click to generate again
$("#regenerate-btn").click(function () {
    currentPage++;
    switch (mode) {
        case "recipeName":
            searchForRecipes(lastQuery);
            break;
        case "ingredients":
            searchForRecipesByIngredients(lastQuery.split(',').map(s => s.trim()));
            break;
        case "type":
            //lastquery is a string that looks like "type:ingredient1,ingredient2," etc"
            // therefore first split it by ':' to get [type, "ingredient1,ingredient2"]
            const [type, ingredientsString] = lastQuery.split(':');
            // Now we need to convert "ingredient1,ingredient2" into an array of ingredients
            const ingredients = ingredientsString ? ingredientsString.split(',').map(s => s.trim()) : [];
            searchForRecipesByType(type, ingredients);
            break;
        default:
            break;
    }
});

//function to switch to different modes
function switchMode(newMode) {
    mode = newMode;
    hideShowMoreButton();
    if (mode === "recipeName") {
        sendBotMessage("You have switched to recipe name mode. Please enter the name of a recipe to continue.");
    } else if (mode === "ingredients") {
        sendBotMessage("You have switched to ingredients mode. Please enter the ingredients you have, seperated by a comma. For Example: 'flour, eggs, sugar'");
    } else if (mode === "type") {
        sendBotMessage("You have switched to type mode. Please enter the type of recipe you want ('main course', 'side dish', 'dessert', 'appetizer', 'salad', 'breakfast', 'soup', 'beverage', 'sauce', 'snack' or 'drink'), and optionally any ingredient(s) separated by a comma. For example: 'dessert: strawberry, chocolate'");
    }
    state = "start";
}
function hideShowMoreButton() {
    $("#regenerate-btn").hide();
  }

    // Function to show the "Show More" button
    function showShowMoreButton() {
        $("#regenerate-btn").show();
      }
// hide button at the start since there is no prompt lol
hideShowMoreButton();

//Startup welcome message.
sendBotMessage("Welcome to the Cookstir chatbot! Enter a recipe name that you are looking for, or switch to a different mode from the drop-down menu below! You can also press the 'switch mode' button to view more recipes of your desired input.");
});
