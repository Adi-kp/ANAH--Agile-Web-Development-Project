
from flask_wtf import FlaskForm
from flask import request,flash

from wtforms.validators import InputRequired, Length, ValidationError
from flask import Blueprint, render_template, redirect, url_for
from flask_login import UserMixin, LoginManager, login_user, login_required, logout_user
from flask_login import current_user
from wtforms import StringField, PasswordField, SubmitField
from wtforms.validators import InputRequired, Length, ValidationError
from wtforms.validators import InputRequired, Length, Email, EqualTo
from flask_migrate import Migrate



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


@auth.route("/login", methods=['GET', 'POST'])
def login():

    # using FlaskForm to create a login form for the page
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

    if (current_user.is_authenticated):
        return redirect('/chat')
    else:
        return render_template("login.html", form=form, user=current_user)


# sign up route
@auth.route('/signup', methods=['GET','POST'])
def signup():
    # flask form to create the signup form
    class SignupForm(FlaskForm):
        # fields for first name, last name, email, and confirm password
        first_name = StringField(validators=[
                           InputRequired(), Length(max=50)], render_kw={"placeholder": "First Name"})
        last_name = StringField(validators=[
                           InputRequired(), Length(max=50)], render_kw={"placeholder": "Last Name"})
        email = StringField(validators=[
                           InputRequired(), Email(), Length(max=120)], render_kw={"placeholder": "Email"})
        username = StringField(validators=[
                           InputRequired(), Length(min=4, max=20)], render_kw={"placeholder": "Username"})
        password = PasswordField(validators=[
                             InputRequired(), Length(min=8, max=20)], render_kw={"placeholder": "Password"})
        confirm_password = PasswordField(validators=[
                             InputRequired(), EqualTo('password', message='Passwords must match')], render_kw={"placeholder": "Confirm Password"})
        
        submit = SubmitField('Register')

    form = SignupForm()

    if request.method == "POST":
        if form.validate_on_submit():
            email = form.email.data
            username = form.username.data

            # Check if email or username is already taken
            existing_user_email = User.query.filter_by(email=email).first()
            existing_user_username = User.query.filter_by(username=username).first()

            if existing_user_email:
                flash('Email is already taken.', 'error')
            elif existing_user_username:
                flash('Username is already taken.', 'error')
            else:
                # Both email and username are available, proceed with user creation
                hashed_password = bcrypt.generate_password_hash(form.password.data)
                new_user = User(
                    first_name=form.first_name.data,
                    last_name=form.last_name.data,
                    email=email,
                    username=username,
                    password=hashed_password
                )
                db.session.add(new_user)
                db.session.commit()
                return redirect(url_for('auth.login'))

    if current_user.is_authenticated:
        return redirect('/chat')
    else:
        return render_template("signup.html", form=form, user=current_user)

   # validation function for signup username; validation mainly checks whether user already exists


def validate_username(self, username):
    existing_user_username = User.query.filter_by(
        username=username.data).first()
    if existing_user_username:
        raise ValidationError(
            'That username already exists. Please choose a different one.')

   

# logout route
@auth.route('/logout', methods=['GET', 'POST'])
@login_required
def logout():
    logout_user()
    return redirect(url_for('auth.login', user=current_user))

from flask import jsonify

@auth.route('/check_availability', methods=['POST'])
def check_availability():
    email = request.form['email']
    username = request.form['username']
    
    # Perform the necessary logic to check if the email and username are available
    # This could involve querying the database or any other checks
    
    # Example logic to check if the email is already taken
    email_taken = User.query.filter_by(email=email).first() is not None
    
    # Example logic to check if the username is already taken
    username_taken = User.query.filter_by(username=username).first() is not None
    
    response = {
        'email_taken': email_taken,
        'username_taken': username_taken
    }
    
    return jsonify(response)
