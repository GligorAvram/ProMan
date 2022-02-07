import { dataHandler } from "../data/dataHandler.js";
import { htmlFactory, htmlTemplates } from "../view/htmlFactory.js";
import { domManager } from "../view/domManager.js";
import { cardsManager } from "./cardsManager.js";
import { statusesManager } from "./statusesManager.js";


export let boardsManager = {
  loadBoards: async function () {
    const addButtonBuilder = htmlFactory(htmlTemplates.addButton);
    const addButton = addButtonBuilder()
    domManager.addChild("#root", addButton, "beforebegin");

    domManager.addEventListener(
            `#board-add-button`,
            "click",
        addNewBoard
      );

    for (let board of await dataHandler.getBoards()) {
        const newBoard = makeNewBoard(board);

        domManager.addChild("#root", newBoard, "last");

        addBoardEventListeners(board.id)
        }
    }
};

function addBoardEventListeners(boardId) {
    domManager.addEventListener(
        `.board-add-card[data-board-id="${boardId}"]`,
        "click",
        addCard
    );

    domManager.addEventListener(
        `.delete-board[data-board-id="${boardId}"]`,
        "click",
    deleteBoard
    );

    domManager.addEventListener(
        `.clickable-board-title[data-board-id="${boardId}"]`,
        "dblclick",
    toggleRenameBoard
    );

    domManager.addEventListener(
        `.rename-board-title[data-board-id="${boardId}"]`,
        "click",
    renameBoard
    );

    domManager.addEventListener(
        `.cancel-rename-board[data-board-id="${boardId}"]`,
        "click",
    cancelRenameBoard
    );

    domManager.addEventListener(
        `#board${boardId}-add-status`,
        "click",
    addStatus
    );
}

function makeNewBoard(board) {
        const boardBuilder = htmlFactory(htmlTemplates.board);
        const content = boardBuilder(board);

        dataHandler.getStatuses(board['id'])
        .then(statuses => {
            statusesManager.loadStatuses(statuses, board['id']);

            dataHandler.getCardsByBoardId(board['id'])
            .then(cards => cardsManager.loadCards(cards, board['id']));
        })
        return content;
}


function renameBoard(clickEvent){
    clickEvent.preventDefault()
    let newName = clickEvent.originalTarget.previousElementSibling.value;
    let boardId = clickEvent.originalTarget.getAttribute("data-board-id");
    document.getElementById(`board${boardId}-title`).innerText = newName;
    dataHandler.renameBoard(boardId, newName);
    cancelRenameBoard(clickEvent);
}

function deleteBoard(clickEvent) {
    if(clickEvent.originalTarget.getAttribute("data-board-id") != 0){
        dataHandler.deleteBoard(clickEvent.originalTarget.getAttribute("data-board-id"))
    }

    let toDelete = clickEvent.originalTarget.closest("section");
    toDelete.parentNode.removeChild(toDelete);
}

function addNewBoard(clickEvent) {
    if (document.querySelector(`.save-board[data-board-id="0"]`) ===  null){
        let newBoard = {
            id: 0,
            title: "New board"
        }
        const boardBuilder = htmlFactory(htmlTemplates.freshBoard);
        const content = boardBuilder(newBoard);

        domManager.addChild("#root", content, "first");

        domManager.addEventListener(
            `.board-add-card[data-board-id="0"]`,
            "click",
        addCard
        );

        domManager.addEventListener(
            `.delete-board[data-board-id="0"]`,
            "click",
        deleteBoard
        );

        domManager.addEventListener(
        `.save-board[data-board-id="0"]`,
        "click",
        commitNewBoard
        );
    }
    else{
        alert("Please finish submitting your existing board draft");
    }
}

function commitNewBoard(clickEvent) {
     console.log("save board " + clickEvent.originalTarget.getAttribute("data-board-id"))
}

function addCard(clickEvent) {
    if(document.querySelector("#card0-title") === null) {
        let boardId = clickEvent.originalTarget.getAttribute("data-board-id");
        let statusId = document.getElementById(`board-columns-table${boardId}`).firstElementChild.getAttribute("data-status-id");
        let order = document.getElementById(`board${boardId}-column${statusId}`).children.length + 1;
        let card = {
            id: 0,
            title: "new card",
            board_id: boardId,
            status_id: statusId,
            card_order: order
        }
        const cardBuilder = htmlFactory(htmlTemplates.freshCard);
        const content = cardBuilder(card);
        domManager.addChild(`#board${boardId}-column${statusId}`, content, "last");

        domManager.addEventListener(
            `.board-save-card[data-card-id="0"]`,
            "click",
        saveCard
        );

        domManager.addEventListener(
            `.board-cancel-card[data-card-id="0"]`,
            "click",
        cancelCard
        );
    }
    else {
        alert("please finish submitting your drafted card")
    }
}


function toggleRenameBoard(dblclick) {
     let boardId = dblclick.originalTarget.parentElement.getAttribute("data-board-id");
     document.getElementById(`rename-board${boardId}-normal`).style.display = "none";
     document.getElementById(`rename-board${boardId}-hidden`).style.display = "inline-block";
}

function cancelRenameBoard(clickEvent) {
     clickEvent.preventDefault();
     let boardId = clickEvent.originalTarget.getAttribute("data-board-id");
     document.getElementById(`rename-board${boardId}-normal`).style.display = "inline-block";
     document.getElementById(`rename-board${boardId}-hidden`).style.display = "none";
}

function addStatus(clickEvent) {
    let boardId = clickEvent.originalTarget.getAttribute("data-board-id");
    const container = document.getElementById(`board-columns-table${boardId}`);

    if (document.querySelector(`.board-column[data-status-id="0"]`) ===  null){
        let newColumn = {
            id: 0,
            title: "New status",
        }
        const columnBuilder = htmlFactory(htmlTemplates.freshColumn);
        const content = columnBuilder(newColumn, boardId);

        domManager.addChild(`#board-columns-table${boardId}`, content, "last");

        domManager.addEventListener(
        `.column-rename[data-status-id="0"]`,
        "click",
        commitNewStatus
        );

        domManager.addEventListener(
        `.column-rename-cancel[data-status-id="0"]`,
        "click",
        cancelNewStatus
        );

    }
    else{
        alert("Please finish submitting your existing column draft");
    }
}

function commitNewStatus(clickEvent) {
    clickEvent.preventDefault();
    dataHandler.addNewStatus()
}

function cancelNewStatus(clickEvent) {
    clickEvent.preventDefault();
    const draftColumn = document.querySelector(`.board-column[data-status-id="0"]`);
    draftColumn.parentNode.removeChild(draftColumn);
}

function saveCard(clickEvent) {
    clickEvent.preventDefault();
    let title = document.getElementById("new-card-input").value;
    let boardId = document.getElementById("temp-card").parentElement.parentElement.parentElement.parentElement.getAttribute("data-board-id");
    let statusId = document.getElementById("temp-card").parentElement.parentElement.getAttribute("data-status-id");
    let cardData = dataHandler.createNewCard(title, boardId, statusId)
    refreshBoard(clickEvent);
}

function cancelCard(clickEvent) {
    clickEvent.preventDefault();
    const draftCard = document.getElementById("card0-normal");
    draftCard.parentNode.remove(draftCard);
}


function refreshBoard(clickEvent){
    const board = clickEvent.originalTarget.closest("section")
    const root = document.getElementById("root");
    let index = Array.from(root.children).indexOf(board);
    let prevBoardId;
     try {
        prevBoardId = board.previousElementSibling.getAttribute("data-board-id");
     }
     catch(error) {}
    dataHandler.getBoard(board.getAttribute("data-board-id"))
    .then(data => {
        const newBoard = makeNewBoard(data[0]);
        root.removeChild(board);
        if(index  === 0){
            domManager.addChild("#root", newBoard, "first");
            addBoardEventListeners(data[0].id)
        }
        else{
            domManager.addChild(`#accordion${prevBoardId}`, newBoard, "after");
            addBoardEventListeners(data[0].id)
        }
    })
}