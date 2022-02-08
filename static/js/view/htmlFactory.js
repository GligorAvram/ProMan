export const htmlTemplates = {
    board: 1,
    status: 2,
    card: 3,
    addButton: 4,
    addModal: 5,
}

export function htmlFactory(template) {
    switch (template) {
        case htmlTemplates.board:
            return boardBuilder
        case htmlTemplates.status:
            return statusColumnBuilder
        case htmlTemplates.card:
            return cardBuilder
        case htmlTemplates.addButton:
            return addButtonBuilder
        case htmlTemplates.addModal:
            return addModalBuilder
        default:
            console.error("Undefined template: " + template)
            return () => { return "" }
    }
}

function boardBuilder(board) {
    return `<section class="board accordion" id="accordion${board.id}" data-board-id="${board.id}">
                <div class="accordion-item">
                    <div class="board-header accordion-header" id="heading${board.id}">
                        <span class="clickable-board-title rename-normal" data-board-id="${board.id}" id="rename-board${board.id}-normal">
                            <span class="board-title" id="board${board.id}-title">${board.title}</span>
                            <button class="board-add-card" data-board-id="${board.id}">Add Card</button>
                        </span>

                        <span class="rename-hidden" id="rename-board${board.id}-hidden">
                                <input type="text" value="${board.title}">
                                <button class="rename-board-title" data-board-id="${board.id}">Save</button>
                                <button class="cancel-rename-board" data-board-id="${board.id}">Cancel</button>
                        </span>

                        <span>
                            <button class="board-toggle" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${board.id}" aria-expanded="true" aria-controls="collapse${board.id}" data-board-id="${board.id}"><i class="fas fa-chevron-down"></i></button>
                            <button class="delete-board" data-board-id="${board.id}">Delete board</button>
                        </span>
                    </div>
                </div>
                <div class="board accordion-collapse collapse show" id="collapse${board.id}" aria-labelledby="heading${board.id}" data-bs-parent="#accordion${board.id}" data-board-id="${board.id}">
                    <div class="board-columns accordion-body" id="board-columns-table${board.id}">
                    </div>
                </div>
                <div><button id="board${board.id}-add-status" data-board-id="${board.id}">add status</button></div>
            </section>`;
}

function cardBuilder(card) {
    return `<div class="card d-flex flex-row justify-content-around">
                <span class="clickable-card-title rename-normal" data-card-id="${card.id}" id="card${card.id}-normal">
                    <span id="card${card.id}-title" data-card-id="${card.id}">${card.title}</span>
                    <button class="card-delete" data-card-id="${card.id}"><i class="fas fa-chevron-down"></i></button>
                </span>

                <span class="rename-hidden" data-card-id="${card.id}" id="card${card.id}-hidden">
                        <input type="text" value="${card.title}">
                        <button class="rename-card-title" data-card-id="${card.id}">Save</button>
                        <button class="cancel-rename-card" data-card-id="${card.id}">Cancel</button>
                </span>
            </div>`;
}

function statusColumnBuilder(status, boardId){
    return `<div class="board-column" data-status-id="${status.id}">
                <div class="board-column-title" data-status-id="${status.id}">
                    <span class="rename-normal" data-status-id="${status.id}" id="rename-status${status.id}-normal-board${boardId}" data-board-id="${boardId}">
                        <span>${status.title}</span>
                        <button class="column-delete" data-status-id="${status.id}"><i class="fas fa-chevron-down"></i></button>
                    </span>
                </div>

                <div class="form-status-column">
                    <span class="rename-hidden" data-status-id="${status.id}" id="rename-status${status.id}-hidden-board${boardId}" data-board-id="${boardId}">
                        <input type="text" value="${status.title}">
                        <button class="column-rename" data-status-id="${status.id}" data-board-id="${boardId}">Save</button>
                        <button class="column-rename-cancel" data-status-id="${status.id}" data-board-id="${boardId}">Cancel</button>
                    </span>
                </div>

                <div class="board-column-content" id="board${boardId}-column${status.id}"></div>
            </div>`
}

function addButtonBuilder() {
    return `<div>
                <button id="board-add-button">Create new board</button>
            </div>`
}

function addModalBuilder(){
    return `<div class="overlay" id="overlay" style="visibility:hidden">
    <div class="dialog" id="NewBoard" style="visibility:hidden">
        <form>
            <label> Name me!
                <input type="text" id="boardName" value="new board">
            </label>
            <button type="submit" id="submitName">Insert</button>
            <button type="cancel" id="cancelDialog">Cancel</button>
        </form>
    </div>
</div>`

}




