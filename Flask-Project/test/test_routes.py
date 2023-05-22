from flask import url_for
from conftest import app, client

def test_index_route(app, client):

    response = client.get("/")
    assert response.status_code == 200



def test_chat_route_post(client):
    message = 'Hello, world!'
    response = client.post('/send_chat', json={'message': message})
    data = response.get_json()

    assert response.status_code == 200
    assert data['status'] == 'success'
    assert data['message'] == message

def test_chat_route_invalid_method(client):
    response = client.get('/chat')
    assert response.status_code == 405
    assert b'Method Not Allowed' in response.data


# Add more tests for other routes and their expected behaviors
