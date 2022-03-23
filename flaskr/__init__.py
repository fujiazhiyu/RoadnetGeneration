from flask import (Flask, url_for)
import os

def create_app(test_config=None):
    basedir = os.path.abspath(os.path.dirname(__file__))
    # create and configure the app
    app = Flask(__name__, instance_relative_config=True, static_url_path=basedir + '/static')
    app.config.from_mapping(
        SECRET_KEY='dev',
        # DATABASE=os.path.join(app.instance_path, 'flaskr.sqlite'),
    )

    if test_config is None:
        # load the instance config, if it exists, when not testing
        app.config.from_pyfile('config.py', silent=True)
    else:
        # load the test config if passed in
        app.config.from_mapping(test_config)

    # ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    app.config['UPLOAD_FOLDER'] = os.path.join(app.static_url_path, "uploads")
    app.config['MAX_CONTENT_LENGTH'] = 0.3 * 1024 * 1024

    from . import gantrans
    app.register_blueprint(gantrans.bp)

    return app
