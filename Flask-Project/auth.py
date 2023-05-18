from sqlite3 import IntegrityError
from flask_wtf import FlaskForm
from flask import request

from wtforms.validators import InputRequired, Length, ValidationError
from flask import Blueprint, render_template, redirect, url_for
from flask_login import UserMixin, LoginManager, login_user, login_required, logout_user
from flask_login import current_user
from wtforms import StringField, PasswordField, SubmitField
from wtforms.validators import InputRequired, Length, ValidationError
from wtforms.validators import InputRequired, Length, Email, EqualTo
from flask_migrate import Migrate
from flask import jsonify

from . import db
from .models import User
from . import bcrypt

auth = Blueprint('auth', __name__)

class LoginForm(FlaskForm):
    username = StringField(validators=[
        InputRequired(), Length(min=4, max=20)], render_kw={"placeholder": "Username"})

    password = PasswordField(validators=[
        InputRequired(), Length(min=8, max=20)], render_kw={"placeholder": "Password"})

    submit = SubmitField('Login')


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

    def validate_username(self, username):
        existing_user_username = User.query.filter_by(username=username.data).first()
        if existing_user_username:
            raise ValidationError('That username already exists. Please choose a different one.')

    def validate_email(self, email):
        existing_user_email = User.query.filter_by(email=email.data).first()
        if existing_user_email:
            raise ValidationError('That email is already in use.')



@auth.route("/login", methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()
        if user:
            if bcrypt.check_password_hash(user.password, form.password.data):
                login_user(user, remember=True)
                return redirect(url_for('views.chat'))

    if current_user.is_authenticated:
        return redirect('/chat')
    else:
        return render_template("login.html", form=form, user=current_user)


@auth.route('/signup', methods=['GET','POST'])
def signup():
    form = SignupForm()

    if request.method == "POST":
        if form.validate_on_submit():
            hashed_password = bcrypt.generate_password_hash(form.password.data)
            new_user = User(
                first_name=form.first_name.data,
                last_name=form.last_name.data,
                email=form.email.data,
                username=form.username.data,
                password=hashed_password
            )
            try:
                db.session.add(new_user)
                db.session.commit()
                return jsonify({'success': True})
            except IntegrityError:
                db.session.rollback()
               
                return jsonify({'success': False, 'error': 'Username or email already exists.'})

    if current_user.is_authenticated:
        return redirect('/chat')
    else:
        return render_template("signup.html", form=form, user=current_user)


@auth.route('/logout', methods=['GET', 'POST'])
@login_required
def logout():
    logout_user()
    return redirect(url_for('auth.login', user=current_user))
