#creating blueprint for navigation routes 
from flask import Blueprint, render_template
from . import db

views = Blueprint('views', __name__)

@views.route('/')
def index():
    return render_template("main.html")
@views.route('/profile')
def profile():
    return 'Profile'

@views.route("/chat")
def chat():
    return render_template("chat.html")  
