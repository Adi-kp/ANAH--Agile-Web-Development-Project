from flask import Flask, render_template,url_for
from flask import redirect

#importing dependencies for the auth
from flask_sqlalchemy import SQLAlchemy 


from flask_bcrypt import Bcrypt
from flask_bootstrap import Bootstrap5
from flask import Flask

db = SQLAlchemy()
bcrypt = Bcrypt()
bootstrap = Bootstrap5()
def create_app():

    app = Flask(__name__); 
    # change placement of secret key perhaps an environmental file
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db' 
    app.config['SECRET_KEY'] = 'thisisasecretkey'

    # init SQLAlchemy db bcrypt for hashing and bootstrap
    

    from .auth import auth as auth
    app.register_blueprint(auth)

    from .views import views as views 
    app.register_blueprint(views)



    return app

    


  



