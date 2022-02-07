import { dataHandler } from "../data/dataHandler.js";
import { htmlFactory, htmlTemplates } from "../view/htmlFactory.js";
import { domManager } from "../view/domManager.js";
import { boardsManager } from "./boardsManager.js"

export let cardsManager = {
  loadCards: async function (cards) {
    for (let card of cards) {

      const cardBuilder = htmlFactory(htmlTemplates.card);
      const content = cardBuilder(card);
      domManager.addChild(`.board[data-board-id="${card['board_id']}"] .board-columns
            .board-column[data-status-id="${card['status_id']}"] .board-column-content`, content, "last");

      domManager.addEventListener(
      `.clickable-card-title[data-card-id="${card.id}"]`,
        "dblclick",
        toggleRenameCard
      );

      domManager.addEventListener(
      `.rename-card-title[data-card-id="${card.id}"]`,
        "click",
        commitCardRename
      );

      domManager.addEventListener(
      `.cancel-rename-card[data-card-id="${card.id}"]`,
        "click",
        cancelCardRename
      );

      domManager.addEventListener(
      `.card-delete[data-card-id="${card.id}"]`,
        "click",
        deleteButtonHandler
      );
    }
  },
};

function deleteButtonHandler(clickEvent) {
    console.log("delete button handled")}


function toggleRenameCard(dblclick) {
    let cardId = dblclick.originalTarget.parentElement.getAttribute("data-card-id");

    document.getElementById(`card${cardId}-normal`).style.display = "none";
    document.getElementById(`card${cardId}-hidden`).style.display = "inline-block";
}

function cancelCardRename(clickEvent) {
    clickEvent.preventDefault();
    let cardId = clickEvent.originalTarget.parentElement.getAttribute("data-card-id");

    document.getElementById(`card${cardId}-normal`).style.display = "inline-block";
    document.getElementById(`card${cardId}-hidden`).style.display = "none";
}

function commitCardRename(clickEvent) {
    clickEvent.preventDefault();
    let cardId = clickEvent.originalTarget.getAttribute("data-card-id");
    let newName = clickEvent.originalTarget.previousElementSibling.value;
    dataHandler.renameCard(cardId, newName);
    document.getElementById(`card${cardId}-title`).innerText = newName;
    cancelCardRename(clickEvent);
}