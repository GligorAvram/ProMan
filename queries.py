import data_manager


def get_card_status(status_id):
    return data_manager.execute_select(
        "SELECT * FROM statuses WHERE id = %(status_id)s;",
        {"status_id": status_id},
    )


def get_boards(user_id=None):
    if user_id:
        return data_manager.execute_select(
            """SELECT * FROM boards WHERE user_id is null or user_id=%(user_id)s;""",
            {"user_id": user_id},
        )
    else:
        return data_manager.execute_select(
            """SELECT * FROM boards WHERE user_id is null;"""
        )

def get_cards_for_board(board_id):
    return data_manager.execute_select(
        "SELECT * FROM cards WHERE board_id = %(board_id)s;",
        {"board_id": board_id},
    )


def get_cards():
    return data_manager.execute_select("SELECT * FROM cards;")


def get_board(board_id):
    return data_manager.execute_select(
        "SELECT * FROM boards WHERE id = %(id)s;",
        {"id": board_id},
    )


def get_statuses_for_board(board_id):
    return data_manager.execute_select(
        """
        SELECT DISTINCT statuses.title, statuses.id FROM cards
            JOIN statuses ON statuses.id = cards.status_id
            WHERE board_id = %(id)s
            ORDER BY id;
        """,
        {"id": board_id},
    )


def get_required_statuses(board_id):
    return data_manager.execute_select(
        """
        SELECT statuses.title, statuses.id FROM boardstatuses
            JOIN statuses ON statuses.id = boardstatuses.status_id
            WHERE board_id = %(id)s
            ORDER BY id;
        """,
        {"id": board_id},
    )


def get_status(status_id):
    return data_manager.execute_select(
        "SELECT title, id FROM statuses WHERE id = %(id)s;",
        {"id": status_id},
        False,
    )


def get_card(card_id):
    return data_manager.execute_select(
        "SELECT * FROM cards WHERE id = %(id)s;",
        {"id": card_id},
    )


def delete_board(board_id):
    return data_manager.execute_select(
        """
        DELETE FROM cards WHERE board_id = %(id)s;
        DELETE FROM boards WHERE id = %(id)s RETURNING 200;
        """,
        {"id": board_id},
        False,
    )


def delete_card(card_id):
    return data_manager.execute_select(
        "DELETE FROM cards WHERE id = %(id)s RETURNING 200;",
        {"id": card_id},
        False,
    )


def deleteSectionCards(boardId, status):
    return data_manager.execute_select(
        "DELETE FROM cards WHERE board_id = %(board_id)s AND status_id = %(status_id)s RETURNING 200;",
        {
            "status_id": status,
            "board_id": boardId,
        },
        False,
    )


def rename_board(board_id, new_name):
    return data_manager.execute_select(
        "UPDATE boards SET title = %(new_name)s WHERE id = %(board_id)s RETURNING 200;",
        {
            "board_id": board_id,
            "new_name": new_name,
        },
        False,
    )


def rename_card(card_id, new_name):
    return data_manager.execute_select(
        "UPDATE cards SET title = %(new_name)s WHERE id = %(card_id)s RETURNING 200;",
        {
            "card_id": card_id,
            "new_name": new_name,
        },
        False,
    )


def check_if_status_exists(new_name):
    return data_manager.execute_select(
        "SELECT COUNT(*) FROM statuses WHERE title = %(new_name)s;",
        {"new_name": new_name},
        False,
    )["count"]


def insert_new_status(new_name):
    return data_manager.execute_select(
        "INSERT INTO statuses (title) VALUES (%(new_name)s) RETURNING ID;",
        {"new_name": new_name},
        False,
    )["id"]


def get_board_id(new_name):
    return data_manager.execute_select(
        "SELECT id FROM boards WHERE title = %(new_name)s;",
        {"new_name": new_name},
        False,
    )["id"]


def rename_status(board_id, status_id, new_name):
    # return data_manager.execute_select(
    #     """
    #         UPDATE cards
    #         SET title = %(new_name)s
    #         WHERE id = %(card_id)s
    #         RETURNING 200;
    #     """,
    #     {"card_id": card_id,
    #      "new_name": new_name},
    #     False
    # )
    pass


def check_if_status_changable(board_id, status_id):
    return data_manager.execute_select(
        "SELECT COUNT(*) FROM cards WHERE board_id = %(board_id)s AND status_id = %(status_id)s;",
        {"status_id": status_id, "board_id": board_id},
        False,
    )["count"]


def changeCardTitles(board_id, status_id, new_id):
    return data_manager.execute_select(
        """
        UPDATE cards
        SET
           status_id = %(new_id)s
        WHERE
           board_id = %(board_id)s AND status_id = %(status_id)s
        RETURNING 200
        """,
        {
            "board_id": board_id,
            "status_id": status_id,
            "new_id": new_id,
        },
        False,
    )


def get_status_id(new_name):
    return data_manager.execute_select(
        "SELECT id FROM statuses WHERE title = %(new_name)s;",
        {"new_name": new_name},
        False,
    )["id"]


def add_card(title, board_id, status_id):
    return data_manager.execute_select(
        """
        INSERT INTO cards (title, board_id, status_id, card_order) 
        VALUES (%(title)s, %(board_id)s, %(status_id)s, (SELECT MAX(card_order)+1 FROM cards))
        RETURNING *;
        """,
        {
            "title": title,
            "board_id": board_id,
            "status_id": status_id,
        },
        False,
    )


def add_status(title):
    return data_manager.execute_select(
        "INSERT INTO statuses (title)  VALUES (%(title)s) RETURNING 200;",
        {"title": title},
        False,
    )


def insert_default_statuses(id):
    # print("inserting defauls statuses for id " + id)
    queries = "\n".join(
        [
            f"INSERT INTO boardstatuses VALUES (%(board_id)s, {i}) RETURNING 200;"
            for i in range(5)
        ]
    )
    data_manager.execute_select(queries, {"board_id": id})
    return 200


def unlink_statuses_from_board(id):
    return data_manager.execute_select(
        "DELETE FROM boardstatuses WHERE board_id = %(board_id)s RETURNING 200;",
        {"board_id": id},
        False,
    )


def reorder_card(card_id, status_id):
    return data_manager.execute_select(
        "UPDATE cards SET status_id = %(status_id)s WHERE id = %(card_id)s RETURNING 200;",
        {
            "card_id": card_id,
            "status_id": status_id,
        },
    )


def add_board(title, user_id=None):
    if user_id:
        return data_manager.execute_select(
            "INSERT INTO boards (title, user_id) VALUES (%(title)s, %(user_id)s) RETURNING id;",
            {
             "title": title,
             "user_id": user_id
             },
            False,
        )['id']
    else:
        return data_manager.execute_select(
            "INSERT INTO boards (title) VALUES (%(title)s) RETURNING id;",
            {"title": title},
            False,
        )['id']


def link_status_to_board(board_id, status_id):
    return data_manager.execute_select(
        "INSERT INTO boardstatuses VALUES (%(board)s, %(status)s) RETURNING 200;",
        {
            "board": board_id,
            "status": status_id,
        },
        False,
    )


def get_cards_for_status_on_board(board_id, status_id):
    return data_manager.execute_select(
        "SELECT * FROM cards WHERE board_id = %(board_id)s AND status_id = %(status_id)s;",
        {
            "board_id": board_id,
            "status_id": status_id,
        },
    )


def unlink_status_from_board(boardId, statusId):
    return data_manager.execute_select(
        "DELETE FROM boardstatuses WHERE board_id = %(board_id)s and status_id=%(status_id)s RETURNING 200;",
        {"board_id": boardId,"status_id":statusId},
        False,
    )


def get_user(username):
    return data_manager.execute_select(
        """SELECT * FROM users WHERE name=%(username)s""",
        {"username": username},
        False
    )


def create_new_user(email, password):
    return data_manager.execute_select(
    """INSERT INTO users(name, password)
    VALUES(
        %(user)s,
        %(password)s
        )
    RETURNING
    id;""",
        {"user": email,
         "password": password},
        False
    )['id']