import os
from json import dumps

from flask import  Flask, render_template, request, session
from flask.views import MethodView
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate


app = Flask(__name__)

app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY') or '3asFq0MNjA1gkaS2a'
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL') or 'sqlite:///' + os.path.join(os.getcwd(), 'app.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
migrate = Migrate(app, db)

from rpc import jsonrpc

jsonrpc.init_app(app)


@app.route('/')
def html():
    return render_template('index.html')


if __name__ == '__main__':
    app.run(debug=True)