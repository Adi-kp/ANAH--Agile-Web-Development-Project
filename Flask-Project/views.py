#creating blueprint for navigation routes 
from flask import Blueprint, render_template, redirect
from . import db
from flask_login import login_required, current_user
from flask import request
from .models import Message
import json


views = Blueprint('views', __name__)

@views.route('/')
def index():
    if current_user.is_authenticated: 
        return redirect("/chat")
    else:
        return render_template("main.html", user=current_user)


@views.route("/chat", methods=['GET'])
@login_required
def chat():
    # rendering chat page with current user login details

    #loading old messages
    items = Message.query.filter_by(user_id=current_user.id).order_by(Message.created_at.desc()).limit(10).all()

    return render_template("chat.html", user=current_user, messages=items)  

@views.route("/send_chat", methods=['POST'])
def send_chat():

    data = request.get_data()
    data = data.decode('utf-8')

    data = json.loads(data)
    print(data["content"])
    new_message = Message(user_id=current_user.id, content=data["content"], isUser=data["isUser"])
    db.session.add(new_message)
    db.session.commit()

    return "message received"

@views.route("/features")
def features():

    return render_template("features.html",user=current_user)