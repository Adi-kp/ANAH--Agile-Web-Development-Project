$(document).ready(function () {
    const apiKey = "a535003512bd4fd18e5daa6d6598b816";
    let state = "start";
    let recipes = [];

    function addMessage(content, user) {
        const messageClass = user ? "user-message" : "bot-message";
    const messageElement = $(`<div class="message ${messageClass}">${content}</div>`);
    $("#chat-box").append(messageElement);
    messageElement.addClass('message-animation');
    setTimeout(() => {
        $("#chat-box").scrollTop($("#chat-box")[0].scrollHeight);
    }, 100);
    }

    function sendBotMessage(content) {
        const delay = 2000;
        const typingIndicator = $('<div class="message bot-message">...</div>');
        $("#chat-box").append(typingIndicator);
        $("#chat-box").scrollTop($("#chat-box")[0].scrollHeight);
        setTimeout(() => {
            typingIndicator.remove();
            addMessage(content.replace(/\n/g, "<br>"), false);
        }, delay);
    }

    function handleUserInput(userInput) {
        addMessage(userInput, true);

    if (state === "start") {
        searchForRecipes(userInput);
    } else if (state === "options") {
        if (!isNaN(userInput) && recipes[parseInt(userInput) - 1]) {
            const selectedIndex = parseInt(userInput) - 1;
            const selectedRecipe = recipes[selectedIndex];
            getRecipeDetails(selectedRecipe.id);
        } else {
            searchForRecipes(userInput);
        }
    }
    }

    function searchForRecipes(query) {
        const url = `https://api.spoonacular.com/recipes/complexSearch?query=${query}&apiKey=${apiKey}`;
        $.ajax({
            url: url,
            type: "GET",
            dataType: "json",
            success: function (data) {
                if (data.results.length > 0) {
                    recipes = data.results;
                    let options = "";
                    const maxResults = 4;
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
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(`Error: ${textStatus}, ${errorThrown}`);
            }
        });
    }

    $("#send-btn").click(function () {
        const userInput = $("#user-input").val().trim();
        if (userInput.length > 0) {
            $("#user-input").val("");
            handleUserInput(userInput);
        }
    });


$("#user-input").keypress(function (event) {
    if (event.which === 13) {
        event.preventDefault();
        $("#send-btn").click();
    }
});

sendBotMessage("Welcome to the Recipe Chatbot! Enter a recipe name or ingredients you have:");
});