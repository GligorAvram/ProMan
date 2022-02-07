import { dataHandler } from "../data/dataHandler.js";
import { htmlFactory, htmlTemplates } from "../view/htmlFactory.js";
import { domManager } from "../view/domManager.js";

export let statusesManager = {
  loadStatuses: function (statuses, boardId) {
    for (let status of statuses) {
      const statusBuilder = htmlFactory(htmlTemplates.status);
      const content = statusBuilder(status, boardId);
      domManager.addChild(`.board[data-board-id="${boardId}"] .board-columns`, content, "last");

      domManager.addEventListener(
        `#rename-status${status.id}-hidden-board${boardId} .column-rename`,
        "click",
        renameCommit
      );

      domManager.addEventListener(
        `#rename-status${status.id}-hidden-board${boardId} .column-rename-cancel`,
        "click",
        renameCancel
      );

      domManager.addEventListener(
        `.column-delete[data-status-id="${status.id}"]`,
        "click",
        deleteButtonHandler
      );

      domManager.addEventListener(
        `#rename-status${status.id}-normal-board${boardId}`,
        "dblclick",
        toggleRenameStatus
      );
    }
  },
};


function deleteButtonHandler(clickEvent) {
    console.log("delete button handled");
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
    renameCancel(clickEvent)
}