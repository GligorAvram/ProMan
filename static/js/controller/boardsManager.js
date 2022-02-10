import { dataHandler } from "../data/dataHandler.js";
import { htmlFactory, htmlTemplates } from "../view/htmlFactory.js";
import { domManager } from "../view/domManager.js";
import { cardsManager } from "./cardsManager.js";
import { statusesManager } from "./statusesManager.js";

const refreshBoardLogic = async function(clickEvent){
     const board = clickEvent.target.closest("section")
     const root = document.getElementById("root");
     let boardId = board.getAttribute("data-board-id");

     let index = Array.from(root.children).indexOf(board);

     console.log(board.previousElementSibling)

     let prevBoardId;
      try {
         prevBoardId = board.previousElementSibling.getAttribute("data-board-id");
      }
      catch(error) {}
     dataHandler.getBoard(boardId)
     .then(data => {
         const newBoard = makeNewBoard(data[0]);
         root.removeChild(board);

         domManager.addChild(`#accordion${prevBoardId}`, newBoard, "after");
         addBoardEventListeners(data[0].id)

     })
}


export let boardsManager = {
  loadBoards: async function () {
    const addButtonBuilder = htmlFactory(htmlTemplates.addButton);
    const addButton = addButtonBuilder();
    domManager.addChild("#root", addButton, "beforebegin");

    domManager.addEventListener(
        `#board-add-button`,
        "click",
    addNewBoard
  );

    domManager.addEventListener(
        `#toggle-archive-button`,
        "click",
        toggleArchive
  );

for (let board of await dataHandler.getBoards()) {
        const newBoard = makeNewBoard(board);
        domManager.addChild("#root", newBoard, "last");
        addBoardEventListeners(board.id);
        }
    
    const addModalBuiler=htmlFactory(htmlTemplates.addModal);
    const addModalDialog=addModalBuiler();
    domManager.addChild("#root",addModalDialog,"first");
    domManager.addEventListener(
        '#submitName',
        "click",
        getNewBoardName);
    domManager.addEventListener(
        '#cancelDialog',
        "click",
        abortCreateBoard);
},
  refreshBoard: refreshBoardLogic

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
        dataHandler.getStatuses(board.id)
        .then(statuses => {
            statusesManager.loadStatuses(statuses, board.id);

            dataHandler.getCardsByBoardId(board.id)
            .then(cards => cardsManager.loadCards(cards, board.id));
        })
        return content;
}


function renameBoard(clickEvent){
    clickEvent.preventDefault();
    let newName = clickEvent.target.previousElementSibling.value;
    let boardId = clickEvent.target.getAttribute("data-board-id");
    document.getElementById(`board${boardId}-title`).innerText = newName;
    dataHandler.renameBoard(boardId, newName);
    cancelRenameBoard(clickEvent);
}

function deleteBoard(clickEvent) {
    const board = clickEvent.target.closest("section");
    let boardId = clickEvent.target.getAttribute("data-board-id");
    dataHandler.deleteBoard(boardId);
    document.getElementById("root").removeChild(board);
}

async function addNewBoard(clickEvent) {
    document.getElementById("accordion0").classList.toggle("hide");
}


function addCard(clickEvent) {
    let boardId = clickEvent.target.getAttribute("data-board-id");
    dataHandler.createNewCard("edit me",boardId,1);
    refreshBoardLogic(clickEvent)
}

function toggleRenameBoard(dblclick) {
     let boardId = dblclick.target.parentElement.getAttribute("data-board-id");
     document.getElementById(`rename-board${boardId}-normal`).style.display = "none";
     document.getElementById(`rename-board${boardId}-hidden`).style.display = "inline-block";
}

function cancelRenameBoard(clickEvent) {
     clickEvent.preventDefault();
     let boardId = clickEvent.target.getAttribute("data-board-id");
     document.getElementById(`rename-board${boardId}-normal`).style.display = "inline-block";
     document.getElementById(`rename-board${boardId}-hidden`).style.display = "none";
}

function addStatus(clickEvent) {
    let boardId = clickEvent.target.getAttribute("data-board-id");
    dataHandler.createNewStatus("edit me",boardId,1);
    refreshBoardLogic(clickEvent);
}

function commitNewStatus(clickEvent) {
    clickEvent.preventDefault();
    dataHandler.addNewStatus();
}

function cancelNewStatus(clickEvent) {
    clickEvent.preventDefault();
    const draftColumn = document.querySelector(`.board-column[data-status-id="0"]`);
    draftColumn.parentNode.removeChild(draftColumn);
}

function saveCard(clickEvent) {
    console.log("saving a card")
    refreshBoardLogic(clickEvent)
}

function cancelCard(clickEvent) {
    clickEvent.preventDefault();
    const draftCard = document.getElementById("card0-normal");
    draftCard.parentNode.remove(draftCard);
}




async function getNewBoardName(){
    document.getElementById("accordion0").style.visibility = "hidden";
    let itemName=document.getElementById("boardName").value;
    dataHandler.createNewBoard(itemName).then(board => {
        const newBoard = makeNewBoard(board);
        domManager.addChild("#root", newBoard, "first");
        addBoardEventListeners(board.id);
    });
}

function abortCreateBoard(){
    document.getElementById("accordion0").classList.toggle("hide");
}

function toggleArchive(){
    let archives=document.querySelectorAll(".archive");
    let taBtn=document.querySelector("#toggle-archive-button")
    taBtn.innerHTML=(taBtn.innerHTML=="Show archived cards")?"Hide archived cards":"Show archived cards"
    for(let archive of archives) {
        archive.classList.toggle("show");
        archive.classList.toggle("hide");
    }
}