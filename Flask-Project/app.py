from flask import Flask, render_template,url_for,request
from flask_sqlalchemy import SQLAlchemy 
from flask_login import UserMixin

app = Flask(__name__); 
db = SQLAlchemy(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), nullable=False, unique=True)
    password = db.Column(db.String(80), nullable=False)

@app.route("/")
def index():
    return render_template("main.html") 

@app.route("/signup")
def signup():
    return render_template("signup.html")

@app.route("/login")
def login():
    return render_template("login.html")

@app.route("/features")
def features():
    return render_template("features.html")

if __name__== "__main__":   
    app.run(debug=True);
