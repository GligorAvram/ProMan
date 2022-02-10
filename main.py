from flask import Flask, make_response, send_from_directory, session, flash
from dotenv import load_dotenv
import requests
from flask import Flask, render_template, redirect, request, url_for
# from flask_login import (
#     LoginManager,
#     current_user,
#     login_required,
#     login_user,
#     logout_user,
# )
from werkzeug.security import check_password_hash, generate_password_hash

from helpers import is_access_token_valid, is_id_token_valid, config
from user import User
from util import json_response
import mimetypes
import queries

mimetypes.add_type("application/javascript", ".js")
app = Flask(__name__)
load_dotenv()
app.secret_key = b'_5#y2L"F4Q8z\n\xec]/'


def main():
    app.run(debug=True, port=4200)

    # Serving the favicon
    with app.app_context():
        app.add_url_rule("/favicon.ico", redirect_to=url_for("favicon"))


@app.route("/")
def index():
    all_cards = queries.get_cards()
    return render_template("index.html", cards=all_cards)


@app.route("/api/boards")
@json_response
def get_boards():
        return queries.get_boards(session.get('user_id', None))


@app.route("/api/status/<status_id>")
@json_response
def get_status(status_id):
    return queries.get_status(status_id)


@app.route("/api/status/add", methods=["POST"])
@json_response
def add_status():
    parameters = request.json
    board_id = parameters["board_id"]
    title = parameters['title']
    if queries.check_if_status_exists(title)==0:
        new_id = queries.insert_new_status(title)
    else: new_id=queries.get_status_id(title)
    return queries.link_status_to_board(board_id, new_id)


@app.route("/api/boards/<board_id>")
@json_response
def get_board(board_id):
    return queries.get_board(board_id)


@app.route("/api/board/rename", methods=["POST"])
@json_response
def rename_board():
    parameters = request.json
    board_id = parameters["id"]
    new_name = parameters["name"]
    return queries.rename_board(board_id, new_name)


@app.route("/api/card/rename", methods=["POST"])
@json_response
def rename_card():
    parameters = request.json
    card_id = parameters["id"]
    new_name = parameters["name"]
    return queries.rename_card(card_id, new_name)


@app.route("/api/status/rename", methods=["POST"])
@json_response
def rename_status():
    parameters = request.json
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
    parameters = request.json
    board_id = parameters["board_id"]
    status_id = parameters["status_id"]
    title = parameters["title"]
    new_card = queries.add_card(title, board_id, status_id)
    return new_card


@app.route("/api/boards/add", methods=["POST"])
@json_response
def add_board():
    parameters = request.json
    title = parameters["title"]
    id = queries.add_board(title)
    new_board=queries.insert_default_statuses(id)
    return new_board


@app.route("/api/boards/delete/<board_id>", methods=["DELETE"])
@json_response
def delete_board(board_id):
    queries.unlink_statuses_from_board(board_id)
    return queries.delete_board(board_id)


@app.route("/api/<board_id>/statuses")
@json_response
def get_statuses(board_id):
    board_statuses = queries.get_statuses_for_board(board_id)
    required_statuses = queries.get_required_statuses(board_id)
    all_statuses = board_statuses + required_statuses
    all_statuses = [s for i, s in enumerate(all_statuses) if s not in all_statuses[:i]]
    return all_statuses


@app.route("/api/board/<board_id>/<status_id>")
@json_response
def get_cards_for_status_on_board(board_id, status_id):
    return queries.get_cards_for_status_on_board(board_id, status_id)


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
    boardId = request.values.get("boardId")
    statusId = request.values.get("statusId")
    queries.unlink_status_from_board(boardId, statusId)
    return queries.deleteSectionCards(boardId, statusId)


@app.route("/api/card/reorder", methods=["POST"])
@json_response
def reorder_card():
    parameters = request.json
    card_id = parameters["cardId"]
    status_id = parameters["statusId"]
    new_card = queries.reorder_card(card_id, status_id)
    return new_card



@app.route('/login', methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")
        user = queries.get_user(username)
        if user is not None and check_password_hash(user["password"], password):
            session["username"] = username
            session["user_id"] = user["id"]
            return redirect(url_for("index"))
        else:
            session.pop('_flashes', None)
            flash('The username or password did not match our records')
            return redirect(url_for('login'))
    return render_template("login.html")


@app.route('/register', methods=["GET", "POST"])
def register():
    if request.method == "POST":
        email = request.form.get("email")
        password = request.form.get("password")
        confirm = request.form.get("confirm_password")

        if password != confirm:
            session.pop('_flashes', None)
            flash('The passwords did not match')
            return redirect(url_for('register'))

        user = queries.get_user(email)
        print(user)

        if user is None:
            user_id = queries.create_new_user(email.lower(), generate_password_hash(password))
            session["username"] = email
            session["user_id"] = user_id
            return redirect(url_for('index'))
    return render_template("register.html")


@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("index"))



# pwa
@app.route("/manifest.json")
def manifest():
    return send_from_directory("static", "manifest.json")


@app.route("/favicon16.ico")
def favicon1():
    return send_from_directory("static", "favicon/favicon-16x16.png")


@app.route("/favicon32.ico")
def favicon2():
    return send_from_directory("static", "favicon/favicon-32x32.png")


@app.route("/favicon96.ico")
def favicon3():
    return send_from_directory("static", "favicon/logo.png")


@app.route("/sw.js")
def service_worker():
    response = make_response(send_from_directory("static", "sw.js"))
    response.headers["Cache-Control"] = "no-cache"
    return response


if __name__ == "__main__":
    main()
