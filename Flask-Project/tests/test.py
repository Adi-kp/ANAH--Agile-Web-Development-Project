import unittest
from flask import url_for
from flask_testing import TestCase
from __init__ import create_app, db

class FlaskAppTestCase(TestCase):

    def create_app(self):
        app = create_app()
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        return app

    def setUp(self):
        db.create_all()

    def tearDown(self):
        db.session.remove()
        db.drop_all()

    def test_home_page(self):
        response = self.client.get(url_for('views.home'))
        self.assert200(response)
        self.assertTemplateUsed('home.html')

    def test_login(self):
        response = self.client.post(url_for('auth.login'), data={'username': 'testuser', 'password': 'password'})
        self.assertRedirects(response, url_for('views.home'))

    # Add more test cases as needed
if __name__ == '__main__':
    unittest.main()


