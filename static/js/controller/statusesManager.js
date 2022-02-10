import { dataHandler } from "../data/dataHandler.js";
import { htmlFactory, htmlTemplates } from "../view/htmlFactory.js";
import { domManager } from "../view/domManager.js";
import { cardsManager } from "./cardsManager.js";
import { boardsManager } from "./boardsManager.js";

export let statusesManager = {
  loadStatuses: function (statuses, boardId) {
    let archive=null;
    for (let status of statuses) {
      if (status['title']!='archive') loadStatus(status,boardId);
      else {
        archive=status;
        loadStatus(archive,boardId,true);
      }
    }
  },
};


function deleteButtonHandler(clickEvent) {
    let statusId = clickEvent.target.getAttribute("data-status-id");
    let boardId = clickEvent.target.getAttribute("data-board-id");
    dataHandler.deleteStatusCards(boardId,statusId);
    boardsManager.refreshBoard(clickEvent);
}

function toggleRenameStatus(dblclick) {
    let statusId = dblclick.target.parentElement.getAttribute("data-status-id");
    let boardId = dblclick.target.parentElement.getAttribute("data-board-id");
    document.getElementById(`rename-status${statusId}-normal-board${boardId}`).style.display = "none";
    document.getElementById(`rename-status${statusId}-hidden-board${boardId}`).style.display = "inline-block";
}

function renameCancel(clickEvent){
    clickEvent.preventDefault();
    let statusId = clickEvent.target.getAttribute("data-status-id");
    let boardId = clickEvent.target.getAttribute("data-board-id");
    document.getElementById(`rename-status${statusId}-normal-board${boardId}`).style.display = "inline-block";
    document.getElementById(`rename-status${statusId}-hidden-board${boardId}`).style.display = "none";
}

function renameCommit(clickEvent){
    clickEvent.preventDefault();

    let statusId = clickEvent.target.getAttribute("data-status-id");
    let boardId = clickEvent.target.getAttribute("data-board-id");
    let newName = clickEvent.target.previousElementSibling.value;

    document.getElementById(`rename-status${statusId}-normal-board${boardId}`).firstElementChild.innerText = newName;

    dataHandler.renameColumn(boardId, statusId, newName);
    deleteButtonHandler(clickEvent);
    renameCancel(clickEvent);
}

function dropHandler(drop) {
    let cardId = drop.dataTransfer.getData("cardId");
    let originalStatus = drop.dataTransfer.getData("statusId");
    let originalBoard = drop.dataTransfer.getData("boardId");

    let boardId = drop.target.closest("fieldset").getAttribute("data-board-id");
    let statusId = drop.target.closest("fieldset").getAttribute("data-status-id");

    if (originalBoard === boardId) {
        dataHandler.reorderCard(cardId, statusId);
    }

    refreshStatus(originalBoard, originalStatus);
    refreshStatus(boardId, statusId);
}

function dragOverHandler(event) {
    event.preventDefault();
}

function refreshStatus(boardId, statusId) {
    const elementToRefresh = document.getElementById(`column${statusId}-board${boardId}`);
    let index = Array.from(elementToRefresh.parentElement.children).indexOf(elementToRefresh);

    dataHandler.getStatus(statusId)
    .then(data => {
        const statusBuilder = htmlFactory(htmlTemplates.status);
        const content = statusBuilder(data, boardId);

        if(index === 0){
        elementToRefresh.parentElement.removeChild(elementToRefresh);
            domManager.addChild(`#board-columns-table${boardId}`, content, "first");
        }
        else{
            const previousSibling = elementToRefresh.previousElementSibling.id;
            elementToRefresh.parentElement.removeChild(elementToRefresh);
            domManager.addChild(`#${previousSibling}`, content, "after");
        }


        dataHandler.getCardsForColumnOnBoard(boardId, statusId)
        .then(cards => {
            cardsManager.loadCards(cards, boardId);

            addEventListeners(boardId, statusId);
        })
    });
}

function loadStatus(status,boardId, isArchive=false){
  const statusBuilder = htmlFactory(htmlTemplates.status);
  const content = statusBuilder(status, boardId, isArchive);
  domManager.addChild(`.board[data-board-id="${boardId}"] .board-columns`, content, "last");

  addEventListeners(boardId, status.id);
}

function addEventListeners(boardId, statusId) {
 domManager.addEventListener(
    `#rename-status${statusId}-hidden-board${boardId} .column-rename`,
    "click",
    renameCommit
  );


  domManager.addEventListener(
  `#board${boardId}-column${statusId}`,
  "drop",
  dropHandler
  )

  domManager.addEventListener(
  `#board${boardId}-column${statusId}`,
  "dragover",
  dragOverHandler
  )

  domManager.addEventListener(
    `#rename-status${statusId}-hidden-board${boardId} .column-rename-cancel`,
    "click",
    renameCancel
  );

  domManager.addEventListener(
    `#delete-board-${boardId}-column${statusId}`,
    "click",
    deleteButtonHandler
  );

  domManager.addEventListener(
    `#rename-status${statusId}-normal-board${boardId}`,
    "dblclick",
    toggleRenameStatus
  );
}