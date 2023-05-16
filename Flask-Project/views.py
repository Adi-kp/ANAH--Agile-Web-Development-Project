#creating blueprint for navigation routes 
from flask import Blueprint, render_template, redirect
from . import db
from flask_login import login_required, current_user

views = Blueprint('views', __name__)

@views.route('/')
def index():
    if current_user.is_authenticated: 
        return redirect("/chat")
    else:
        return render_template("main.html", user=current_user)


@views.route("/chat")
@login_required
def chat():
    # rendering chat page with current user login details

    return render_template("chat.html", user=current_user)

@views.route("/features")
def features():

    return render_template("features.html",user=current_user)