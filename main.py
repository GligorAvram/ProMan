import flask
from flask import make_response, send_from_directory
from dotenv import load_dotenv
import requests
from flask import Flask, render_template, redirect, request, url_for
from flask_login import (
    LoginManager,
    current_user,
    login_required,
    login_user,
    logout_user,
)

from helpers import is_access_token_valid, is_id_token_valid, config
from user import User
from util import json_response
import mimetypes
import queries

mimetypes.add_type('application/javascript', '.js')
app = Flask(__name__)
load_dotenv()
app.config.update({'SECRET_KEY': 'SomethingNotEntirelySecret'})
login_manager = LoginManager()
login_manager.init_app(app)


APP_STATE = 'ApplicationState'
NONCE = 'SampleNonce'


def main():
    app.run(debug=True, port=4200)

    # Serving the favicon
    with app.app_context():
        app.add_url_rule('/favicon.ico', redirect_to=url_for('favicon'))


@app.route("/")
def index():
    all_cards = queries.get_cards()
    return render_template('index.html', cards=all_cards)


@app.route("/api/boards")
@json_response
def get_boards():
    return queries.get_boards()


@app.route("/api/status/<status_id>")
@json_response
def get_status(status_id):
    return queries.get_status(status_id)


@app.route("/api/status/add", methods=["POST"])
@json_response
def add_status():
    parameters = flask.request.json
    board_id = parameters["board_id"].lower()
    new_id=queries.insert_new_status(board_id)
    return queries.link_status_to_board(board_id,new_id)


@app.route("/api/boards/<board_id>")
@json_response
def get_board(board_id):
    return queries.get_board(board_id)


@app.route("/api/board/rename", methods=["POST"])
@json_response
def rename_board():
    parameters = flask.request.json
    board_id = parameters["id"]
    new_name = parameters["name"]
    return queries.rename_board(board_id, new_name)


@app.route("/api/card/rename", methods=["POST"])
@json_response
def rename_card():
    parameters = flask.request.json
    card_id = parameters["id"]
    new_name = parameters["name"]
    return queries.rename_card(card_id, new_name)


@app.route("/api/status/rename", methods=["POST"])
@json_response
def rename_status():
    parameters = flask.request.json
    board_id = parameters["board_id"]
    status_id = parameters["status_id"]
    new_name = parameters["name"]
    if queries.check_if_status_exists(new_name) == 0:
        new_id = queries.insert_new_status(new_name)
        return queries.changeCardTitles(board_id, status_id, new_id)

    new_id = queries.get_status_id(new_name)
    if queries.check_if_status_changable(board_id, new_id) == 0:
        return queries.changeCardTitles(board_id, status_id, new_id)
    else:
        return 200

@app.route("/api/cards/<card_id>")
@json_response
def get_card(card_id):
    return queries.get_card(card_id)


@app.route("/api/card/add", methods=["POST"])
@json_response
def add_card():
    parameters = flask.request.json
    board_id = parameters["board_id"]
    status_id = parameters["status_id"]
    title = parameters["title"]
    new_card = queries.add_card(title, board_id, status_id)
    return new_card

@app.route("/boards/add", methods=["POST"])
@json_response
def add_board():
    parameters = flask.request.json
    title = parameters["title"]
    print("adding board "+title)
    id = queries.add_board(title)
    print("assigned id: "+id)
    return queries.insert_default_statuses(id)
    # print("board should be added")
    # return 200


@app.route("/api/boards/delete/<board_id>", methods=["DELETE"])
@json_response
def delete_board(board_id):
    queries.unlink_statuses_from_board(board_id)
    return queries.delete_board(board_id)


@app.route("/api/<board_id>/statuses")
@json_response
def get_statuses(board_id):
    board_statuses=queries.get_statuses_for_board(board_id)
    print("board statuses for "+board_id)
    print(board_statuses)
    # found=False
    # for i in range(5):
    #     status=queries.get_status(i)
    #     for j in range(len(board_statuses)):
    #         found=False
    #         if status['title']==board_statuses[j]['title']:
    #             found=True
    #             break
    #     if not found: board_statuses.append(status)
    required_statuses=queries.get_required_statuses(board_id)
    print(required_statuses)
    for status in required_statuses:
        if status in board_statuses: continue
        else: board_statuses.append(status)
    return board_statuses


# @app.route("/api/statuses/<status_id>")
# @json_response
# def get_status(status_id):
#     return queries.get_status(status_id)


@app.route("/api/boards/<int:board_id>/cards/")
@json_response
def get_cards_for_board(board_id: int):
    return queries.get_cards_for_board(board_id)


@app.route("/api/cards/delete/<card_id>", methods=["DELETE"])
@json_response
def delete_card(card_id: int):
    return queries.delete_card(card_id)


@app.route("/api/section/delete", methods=["DELETE"])
@json_response
def delete_section():
    boardId = request.args.get("boardId")
    statusId = request.args.get("statusId")
    queries.unlink_statuses_from_board(boardId,statusId)
    return queries.deleteSectionCards(boardId,statusId)


@app.route("/api/card/reorder", methods=["POST"])
@json_response
def reorder_card():
    parameters = flask.request.json
    card_id = parameters["cardId"]
    status_id = parameters["statusId"]
    print(card_id +" " + status_id)
    new_card = queries.reorder_card(card_id, status_id)
    return new_card

# okta
@login_manager.user_loader
def load_user(user_id):
    return User.get(user_id)


@app.route("/login")
def login():
    # get request params
    query_params = {'client_id': config["client_id"],
                    'redirect_uri': config["redirect_uri"],
                    'scope': "openid email profile",
                    'state': APP_STATE,
                    'nonce': NONCE,
                    'response_type': 'code',
                    'response_mode': 'query'}

    # build request_uri
    request_uri = "{base_url}?{query_params}".format(
        base_url=config["auth_uri"],
        query_params=requests.compat.urlencode(query_params)
    )

    return redirect(request_uri)


@app.route("/profile")
@login_required
def profile():
    return render_template("profile.html", user=current_user)


@app.route("/authorization-code/callback")
def callback():
    headers = {'Content-Type': 'application/x-www-form-urlencoded'}
    code = request.args.get("code")
    if not code:
        return "The code was not returned or is not accessible", 403
    query_params = {'grant_type': 'authorization_code',
                    'code': code,
                    'redirect_uri': request.base_url
                    }
    query_params = requests.compat.urlencode(query_params)
    exchange = requests.post(
        config["token_uri"],
        headers=headers,
        data=query_params,
        auth=(config["client_id"], config["client_secret"]),
    ).json()

    # Get tokens and validate
    if not exchange.get("token_type"):
        return "Unsupported token type. Should be 'Bearer'.", 403
    access_token = exchange["access_token"]
    id_token = exchange["id_token"]

    if not is_access_token_valid(access_token, config["issuer"]):
        return "Access token is invalid", 403

    if not is_id_token_valid(id_token, config["issuer"], config["client_id"], NONCE):
        return "ID token is invalid", 403

    # Authorization flow successful, get userinfo and login user
    userinfo_response = requests.get(config["userinfo_uri"],
                                     headers={'Authorization': f'Bearer {access_token}'}).json()

    unique_id = userinfo_response["sub"]
    user_email = userinfo_response["email"]
    user_name = userinfo_response["given_name"]

    user = User(
        id_=unique_id, name=user_name, email=user_email
    )

    if not User.get(unique_id):
        User.create(unique_id, user_name, user_email)

    login_user(user)

    return redirect(url_for("index"))


@app.route("/logout", methods=["GET", "POST"])
@login_required
def logout():
    logout_user()
    return redirect(url_for("index"))


# pwa
@app.route('/manifest.json')
def manifest():
    return send_from_directory('static', 'manifest.json')


@app.route('/favicon16.ico')
def favicon1():
    return send_from_directory('static', 'favicon/favicon-16x16.png')

@app.route('/favicon32.ico')
def favicon2():
    return send_from_directory('static', 'favicon/favicon-32x32.png')

@app.route('/favicon96.ico')
def favicon3():
    return send_from_directory('static', 'favicon/logo.png')


@app.route('/sw.js')
def service_worker():
    response = make_response(send_from_directory('static', 'sw.js'))
    response.headers['Cache-Control'] = 'no-cache'
    return response


if __name__ == '__main__':
    main()