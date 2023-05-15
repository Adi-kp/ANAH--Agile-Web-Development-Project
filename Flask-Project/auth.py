
from flask_wtf import FlaskForm
from flask import request

from wtforms.validators import InputRequired, Length, ValidationError
from flask import Blueprint, render_template, redirect, url_for
from flask_login import UserMixin,LoginManager,login_user,login_required,logout_user
from flask_login import current_user 
from wtforms import StringField, PasswordField,SubmitField
from wtforms.validators import InputRequired, Length, ValidationError

 

from . import db
from .models import User
from . import bcrypt

auth = Blueprint('auth', __name__)
"""
login_manager = LoginManager()
login_manager.init_app()
login_manager.login_view = 'login' 

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))
c

"""

@auth.route("/login",methods=['GET','POST']) 
def login():

    #using FlaskForm to create a login form for the page 
    class LoginForm(FlaskForm):
        username = StringField(validators=[
                           InputRequired(), Length(min=4, max=20)], render_kw={"placeholder": "Username"})

        password = PasswordField(validators=[
                             InputRequired(), Length(min=8, max=20)], render_kw={"placeholder": "Password"})

        submit = SubmitField('Login')

    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()
        if user:
            if bcrypt.check_password_hash(user.password, form.password.data):
                login_user(user, remember=True)
                return redirect(url_for('views.chat'))
    return render_template("login.html",form=form )




#sign up route
@auth.route('/signup',methods=['GET','POST'])
def signup():
    #flask form to make sign up form: 4-20 char string username and 8-20 char pwd 
    class SignupForm(FlaskForm):

        #username
        username = StringField(validators=[
                           InputRequired(), Length(min=4, max=20)], render_kw={"placeholder": "Username"})
        #password 
        password = PasswordField(validators=[
                             InputRequired(), Length(min=8, max=20)], render_kw={"placeholder": "Password"})
        
        submit = SubmitField('Register')

    form = SignupForm()

    if(request.method == "POST"):
        print("posting")
        print(form.username)
        if form.validate_on_submit():
            hashed_password = bcrypt.generate_password_hash(form.password.data) # generating hash password
            new_user = User(username=form.username.data, password=hashed_password)
            db.session.add(new_user)
            db.session.commit()
            return redirect(url_for('auth.login'))


    #validation function for signup username; validation mainly checks whether user already exists
    def validate_username(self, username):
        existing_user_username = User.query.filter_by(
            username=username.data).first()
        if existing_user_username:
            raise ValidationError(
                'That username already exists. Please choose a different one.')
    

   

    #if valid input by user adding user to the database 
    

    return render_template("signup.html",form = form)




#logout route 
@auth.route('/logout', methods=['GET', 'POST'])
@login_required
def logout():
    logout_user()
    return redirect(url_for('auth.login'))