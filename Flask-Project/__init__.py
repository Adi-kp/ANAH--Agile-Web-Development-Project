from flask import Flask, render_template,url_for
from flask import redirect
from os import path
from flask_login import LoginManager;
from flask_migrate import Migrate

#importing dependencies for the auth
from flask_sqlalchemy import SQLAlchemy 


from flask_bcrypt import Bcrypt

from flask import Flask

db = SQLAlchemy()
DB_NAME = "database.db"
bcrypt = Bcrypt()
def create_app():

    app = Flask(__name__); 

    migrate = Migrate(app, db)

    
    # change placement of secret key perhaps an environmental file
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{DB_NAME}' 
    app.config['SECRET_KEY'] = 'thisisasecretkey'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['DEBUG'] = True  # Enable debug mode
    db.init_app(app)

    app.debug = True

    #login manager
    login_manager = LoginManager()
    login_manager.login_view = 'auth.login'
    login_manager.init_app(app)

    @login_manager.user_loader
    def load_user(id):
        return User.query.get(int(id))

    from .auth import auth as auth
    app.register_blueprint(auth)

    from .views import views 
    app.register_blueprint(views, url_prefix="/")

    from .models import User

    create_database(app)

    return app

    

#creating database 
def create_database(app):
    if not path.exists('Flask-Project/' + DB_NAME):
        db.create_all(app=app)
        print('Created Database!')
  



