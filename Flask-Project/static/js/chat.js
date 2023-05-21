$(document).ready(function () {
  const apiKey = "7098be7aa9224f7f8bf8de15ea4bda47";
  let state = "start";
  let mode = "recipeName";

  // function to parse the recipes
  function bot_message_parser() {
    return "";
  }

  // stores all provided recipes
  let recipes = [];

  // function to send post request to store message to database
  function send_chat_req(data, isUser) {
    message = JSON.stringify({ content: data, isUser: isUser });

    $.post("/send_chat", message)
      .done(function (response) {
        console.log("POST request sent successfully");
      })
      .fail(function (xhr, textStatus, error) {
        console.log("Failed to send POST request:", error);
      });
  }

  // function to add messages to the chatbot
  function addMessage(content, user) {
    const messageClass = user ? "user-message" : "bot-message";
    send_chat_req(content, user);
    const messageElement = $(
      `<div class="message ${messageClass}">${content}</div>`
    );

    // Check if chat box is already scrolled to the bottom
    $("#chat-box").append(messageElement);
    messageElement.addClass("message-animation");
    scrollToBottom();
  }

  // Add this function to smoothly scroll to the bottom of the chatbox
  function scrollToBottom() {
    $("#chat-box").animate(
      {
        scrollTop: $("#chat-box")[0].scrollHeight,
      },
      1000
    );
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

    if (state === "start") {
      if (mode === "recipeName") {
        searchForRecipes(userInput);
      } else if (mode === "ingredients") {
        searchForRecipesByIngredients(userInput);
      }
    } else if (state === "options") {
      const selectedIndex = parseInt(userInput) - 1;
      if (!isNaN(selectedIndex) && recipes[selectedIndex]) {
        const selectedRecipe = recipes[selectedIndex];
        getRecipeDetails(selectedRecipe.id);
      } else {
        if (mode === "recipeName") {
          searchForRecipes(userInput);
        } else if (mode === "ingredients") {
          searchForRecipesByIngredients(userInput);
        }
      }
    }
  }

  // switches to different modes
  function switchMode() {
    if (mode === "recipeName") {
      mode = "ingredients";
      sendBotMessage(
        "You have switched to ingredients mode. Please enter the ingredients you have."
      );
    } else if (mode === "ingredients") {
      mode = "recipeName";
      sendBotMessage(
        "You have switched to recipe name mode. Please enter the name of a recipe."
      );
    }
    state = "start";
  }

  // queries to api

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
          const maxResults = 5;
          for (let i = 0; i < Math.min(maxResults, data.results.length); i++) {
            const recipe = data.results[i];
            options += `${i + 1}. ${recipe.title}<br><img src="${
              recipe.image
            }" alt="${recipe.title}" width="50" height="50"><br><br>`;
          }
          sendBotMessage(
            `Here are some options:<br>${options}Select a number or search again.`
          );
          state = "options";
        } else {
          sendBotMessage("No results found. Please try again.");
        }
      },
      error: function (textStatus, errorThrown) {
        console.log(`Error: ${textStatus}, ${errorThrown}`);
      },
    });
  }

  function searchForRecipesByIngredients(ingredients) {
    const url = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredients}&apiKey=${apiKey}`;
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
            options += `${i + 1}. ${recipe.title}<br><img src="${
              recipe.image
            }" alt="${recipe.title}" width="50" height="50"><br><br>`;
          }
          sendBotMessage(
            `Here are some options:<br>${options}Select a number or search again.`
          );
          state = "options";
        } else {
          sendBotMessage("No results found. Please try again.");
        }
      },
      error: function (textStatus, errorThrown) {
        console.log(`Error: ${textStatus}, ${errorThrown}`);
      },
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
        data.extendedIngredients.forEach((ingredient) => {
          message += `- ${ingredient.original}<br>`;
        });

        message +=
          "<br>The procedure for this recipe is:<br>" +
          data.instructions.replace(/\n/g, "<br>");
        sendBotMessage(message);
        state = "start";
      },
      error: function (textStatus, errorThrown) {
        console.log(`Error: ${textStatus}, ${errorThrown}`);
      },
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

  // changes the mode that we are currently in (i.e. recipe, ingredients, etc.)
  $("#mode-select").change(function () {
    switchMode($(this).val());
  });

  $("#user-input").keypress(function (event) {
    // press enter to submit written text
    if (event.which === 13) {
      event.preventDefault();
      $("#send-btn").click();
    }
  });
  // startup welcome message
});
