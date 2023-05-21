$(document).ready(function () {
    const apiKey = "3d9017eec1cb44fdb9783a93e7a9d0ec";
    let state = "start";
    let mode = "recipeName";
    // stores all provided recipes
    let recipes = [];
    let currentPage = 0; // Changed to 0 so the first search starts at the first page.
    let lastType = "";
    let lastIngredients = "";
    const resultsPerPage = 5; 
    let lastQuery = "";

    // function to add messages to the chatbot
    function addMessage(content, user) {   
        const messageClass = user ? "user-message" : "bot-message";
        const messageElement = $(`<div class="message ${messageClass}">${content}</div>`);

        // Check if chat box is already scrolled to the bottom    
        $("#chat-box").append(messageElement);
        messageElement.addClass('message-animation');
        scrollToBottom();
    }
    
    // Add this function to smoothly scroll to the bottom of the chatbox
    function scrollToBottom() {
        $('#chat-box').animate({
            scrollTop: $('#chat-box')[0].scrollHeight
        }, 1000);
    }

    function sendBotMessage(content) {
        const delay = 2000;
        const typingIndicator = $('<div class="message bot-message">...</div>');
        $("#chat-box").append(typingIndicator);
        setTimeout(() => {
            typingIndicator.remove();
            addMessage(content.replace(/\n/g, "<br>"), false);
        }, delay);
        scrollToBottom();
    }

    function handleUserInput(userInput) {
        addMessage(userInput, true);
        currentPage = 1;
        if (state === "start") {
            if (mode === "recipeName") {
                searchForRecipes(userInput);
            } else if (mode === "ingredients") {
                searchForRecipesByIngredients(userInput);
            } else if (mode === "type") {
                const userInputSplit = userInput.split(':').map(s => s.trim());
                const type = userInputSplit[0];
                const ingredients = userInputSplit[1] ? userInputSplit[1].split(',').map(s => s.trim()) : [];
                searchForRecipesByType(type, ingredients);
            }
        } else if (state === "options") {
            const selectedIndex = parseInt(userInput) - 1;
            if (!isNaN(selectedIndex) && recipes[selectedIndex]) {
                const selectedRecipe = recipes[selectedIndex];
                getRecipeDetails(selectedRecipe.id);
            } else {
                if (userInput.includes(',')) { // Check if this is a new search by type
                    const userInputSplit = userInput.split(':').map(s => s.trim());
                    const type = userInputSplit[0];
                    const ingredients = userInputSplit[1] ? userInputSplit[1] : '';
                    lastType = type; // Update lastType
                    lastIngredients = ingredients; // Update lastIngredients
                    searchForRecipesByType(type, ingredients.split(',').map(s => s.trim()));
                } 
                else if (mode === "recipeName") {
                    searchForRecipes(userInput);
                } else if (mode === "ingredients") {
                    searchForRecipesByIngredients(userInput);
                } 
            }
        }
    }

    // switches to different modes
    function switchMode(newMode) {
        mode = newMode;
        if (mode === "recipeName") {
            sendBotMessage("You have switched to recipe name mode. Please enter the name of a recipe.");
        } else if (mode === "ingredients") {
            sendBotMessage("You have switched to ingredients mode. Please enter the ingredients you have.");
        } else if (mode === "type") {
            sendBotMessage("You have switched to type mode. Please enter the type of recipe you want ('main course', 'side dish', 'dessert', 'appetizer', 'salad', 'breakfast', 'soup', 'beverage', 'sauce', 'snack' or 'drink'), and optional ingredient separated by a comma.");
        }
        state = "start";
    }
    
    $("#mode-select").change(function () {
        switchMode($(this).val());
    });
    
    
    

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
                    let options = "";
                    const maxResults = 5;
                    for (let i = 0; i < Math.min(maxResults, data.results.length); i++) {
                        const recipe = data.results[i];
                        options += `${i + 1}. ${recipe.title}<br><img src="${recipe.image}" alt="${recipe.title}" width="50" height="50"><br><br>`;
                    }
                    sendBotMessage(`Here are some options:<br>${options}Select a number or search again.`);
                    state = "options";
                } else {
                    sendBotMessage("No results found. Please try again.");
                }
            },
            error: function (textStatus, errorThrown) {
                console.log(`Error: ${textStatus}, ${errorThrown}`);
            }
        });
    }

    function searchForRecipesByType(type, ingredients = []) {
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
                    let options = "";
                    for (let i = 0; i < Math.min(resultsPerPage, data.results.length); i++) {
                        const recipe = data.results[i];
                        options += `${i + 1}. ${recipe.title}<br><img src="${recipe.image}" alt="${recipe.title}" width="50" height="50"><br><br>`;
                    }
                    sendBotMessage(`Here are some options:<br>${options}Select a number or search again.`);
                    console.log(url);
                    state = "options";
                } else {
                    sendBotMessage("No results found. Please try again.");
                }
            },
            error: function (textStatus, errorThrown) {
                console.log(`Error: ${textStatus}, ${errorThrown}`);
            }
        });
    }
    

    function searchForRecipesByIngredients(ingredients) {
        const url = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredients}&number=${resultsPerPage}&ranking=1&apiKey=${apiKey}&offset=${resultsPerPage * (currentPage - 1)}`;
        lastQuery = ingredients;
        $.ajax({
            url: url,
            type: "GET",
            dataType: "json",
            success: function (data) {
                if (data.length > 0) {
                    recipes = data;
                    let options = "";
                    const maxResults = 4;
                    for (let i = 0; i < Math.min(maxResults, data.length); i++) {
                        const recipe = data[i];
                        options += `${i + 1}. ${recipe.title}<br><img src="${recipe.image}" alt="${recipe.title}" width="50" height="50"><br><br>`;
                    }
                    sendBotMessage(`Here are some options:<br>${options}Select a number or search again.`);
                    state = "options";
                    console.log(url);
                } else {
                    sendBotMessage("No results found. Please try again.");
                } 
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(`Error: ${textStatus}, ${errorThrown}`);
            }
        });
    }

    function getRecipeDetails(recipeId) {
        const url = `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${apiKey}`;
        $.ajax({
            url: url,
            type: "GET",
            dataType: "json",
            success: function (data) {
                let message = "";

                message += "The ingredients for this recipe are:<br>";
                data.extendedIngredients.forEach(ingredient => {
                message += `- ${ingredient.original}<br>`;
                });

                message += "<br>The procedure for this recipe is:<br>" + data.instructions.replace(/\n/g, "<br>");
                sendBotMessage(message);
                state = "start";
            },
            error: function (textStatus, errorThrown) {
                console.log(`Error: ${textStatus}, ${errorThrown}`);
            }
        });
    }
    //parses user input.
    $("#send-btn").click(function () {
        const userInput = $("#user-input").val().trim();
        if (userInput.length > 0) {
            $("#user-input").val("");
            handleUserInput(userInput);
        }
    });


$("#user-input").keypress(function (event) {
    // press enter to submit written text
    if (event.which === 13) {
        event.preventDefault();
        $("#send-btn").click();
    }
});

$("#regenerate-btn").click(function () {
    currentPage++;
    switch (mode) {
        case "recipeName":
            searchForRecipes(lastQuery);
            break;
        case "ingredients":
            searchForRecipesByIngredients(lastQuery);
            break;
        case "type":
            searchForRecipesByType(lastType, lastIngredients);
            break;
        default:
            break;
    }
});

// startup welcome message.
sendBotMessage("Welcome to the Cookstir chatbot! Enter a recipe name that you are looking for, or switch to a different mode from the drop down menu below!");
});