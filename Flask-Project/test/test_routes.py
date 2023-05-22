from flask import url_for
from conftest import app, client

def test_index_route(app, client):

    response = client.get("/")
    assert response.status_code == 200






# Add more tests for other routes and their expected behaviors
