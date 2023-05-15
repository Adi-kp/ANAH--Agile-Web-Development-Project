#creating blueprint for navigation routes 
from flask import Blueprint, render_template
from . import db
from flask_login import login_required, current_user

views = Blueprint('views', __name__)

@views.route('/')
def index():
    return render_template("main.html")
@views.route('/profile')
def profile():
    return 'Profile'

@views.route("/chat")
@login_required
def chat():
    return render_template("chat.html")  
