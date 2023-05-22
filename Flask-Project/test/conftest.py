import pytest
from app import create_app

@pytest.fixture(scope='module')
def app():
    # Create a test Flask app
    app = create_app()
    yield app

@pytest.fixture(scope='module')
def client(app):
    with app.test_client() as client:
        yield client