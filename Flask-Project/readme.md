#Recipe Chatbot

Recipe Chatbot is a web-based application that helps users to search for recipes. It uses Flask, a lightweight Python web framework, and a simple, intuitive chat interface to interact with users.

## Appendix

Design and Development
Installation
Running the Application
Running Tests
Validation
Contributing
License

## Documentation

The application is designed using the MVC (Model-View-Controller) architectural pattern. It uses Python and Flask for the backend and jQuery, HTML, CSS, and Bootstrap for the frontend.

Model: This includes the data-related logic. For Recipe Chatbot, the models interact with a database to store and retrieve chat messages.
View: This is the user interface. In Recipe Chatbot, this is the HTML/CSS with Jinja2 templates for dynamic content.
Controller: This includes the application logic. The controllers handle requests, interact with the models, and display the appropriate view to the user.
The chat functionality is implemented using jQuery and AJAX to send and receive messages asynchronously without needing to refresh the page.

## Installation

1. First clone the repository (if you do not have all the files stored already)

    git clone https://github.com/Adi-kp/ANAH--Agile-Web-Development-Project.git


2. Navigate to the project director in terminal

3. (optional but recommended) Create a Python virtual environment and activate it:
```bash
python3 -m venv venv
source venv/bin/activate
```

4. Install the required dependencies using the requirements.txt file:

```bash
pip install -r requirements.txt
```

Now your project should be ready to run
    
## Running the Applications

To run this project:

1. Set the Flask application environment variable:

```bash
  export FLASK_APP=__init__.py
```

2. Run the application:
```bash
flask run```

3. Follow the link that is printed in the terminal.


## Running Tests

To run tests, use the following command in the terminal while the flask app is running:

```bash
python -m pytest
```

