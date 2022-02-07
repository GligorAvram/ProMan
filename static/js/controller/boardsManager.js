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
    console.log("deleting a board")
}

function addNewBoard(clickEvent) {
    console.log("adding a new board")
}


function addCard(clickEvent) {
    console.log("adding a new card")
}

function commitNewBoard(clickEvent) {
     console.log("save board " + clickEvent.originalTarget.getAttribute("data-board-id"))
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
    console.log("adding a status")

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
    console.log("saving a card")
}

function cancelCard(clickEvent) {
    clickEvent.preventDefault();
    const draftCard = document.getElementById("card0-normal");
    draftCard.parentNode.remove(draftCard);
}


function refreshBoard(clickEvent){
    // const board = clickEvent.originalTarget.closest("section")
    // const root = document.getElementById("root");
    // let index = Array.from(root.children).indexOf(board);
    // let prevBoardId;
    //  try {
    //     prevBoardId = board.previousElementSibling.getAttribute("data-board-id");
    //  }
    //  catch(error) {}
    // dataHandler.getBoard(board.getAttribute("data-board-id"))
    // .then(data => {
    //     const newBoard = makeNewBoard(data[0]);
    //     root.removeChild(board);
    //     if(index  === 0){
    //         domManager.addChild("#root", newBoard, "first");
    //         addBoardEventListeners(data[0].id)
    //     }
    //     else{
    //         domManager.addChild(`#accordion${prevBoardId}`, newBoard, "after");
    //         addBoardEventListeners(data[0].id)
    //     }
    // })
}