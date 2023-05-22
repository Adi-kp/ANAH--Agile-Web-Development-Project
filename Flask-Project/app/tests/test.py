import unittest
from flask import url_for
from flask_testing import TestCase
from .. import create_app, db
from ..models import User

class TestAuth(TestCase):

    def create_app(self):
        app = create_app()
        app.config['TESTING'] = True
        app.config['WTF_CSRF_ENABLED'] = False
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        return app

    def setUp(self):
        db.create_all()
        # The password needs to be hashed before being stored in the database.
        # You'll need to use the correct password hashing method here.
        hashed_password = "testpassword"
        user = User(username='testuser', email='test@example.com', password=hashed_password)
        db.session.add(user)
        db.session.commit()

    def tearDown(self):
        db.session.remove()
        db.drop_all()

    def test_valid_user_signup(self):
        response = self.client.post(url_for('auth.signup'), data=dict(
            username='newuser', email='newuser@example.com', password='password', confirm_password='password'))
        self.assertRedirects(response, url_for('auth.login'))

    def test_invalid_user_signup(self):
        response = self.client.post(url_for('auth.signup'), data=dict(
            username='testuser', email='test@example.com', password='password', confirm_password='password'))
        self.assertIn(b'Email is already taken.', response.data)

    def test_valid_user_login(self):
        response = self.client.post(url_for('auth.login'), data=dict(
            username='testuser', password='testpassword'))
        self.assertRedirects(response, url_for('views.chat'))

    def test_invalid_user_login(self):
        response = self.client.post(url_for('auth.login'), data=dict(
            username='wronguser', password='wrongpassword'))
        self.assertIn(b'Invalid login details', response.data)

if __name__ == "__main__":
    unittest.main()