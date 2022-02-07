export const htmlTemplates = {
    board: 1,
    card: 2
}

export const builderFunctions = {
    [htmlTemplates.board]: boardBuilder,
    [htmlTemplates.card]: cardBuilder
};

export function htmlFactory(template) {
    if (htmlTemplates.hasOwnProperty(template)) {
        return builderFunctions[template];
    }

    console.error("Undefined template: " + template);

    return () => {
        return "";
    };
}

function boardBuilder(board) {
    // return `<div class="board-container">
    //             <div class="board" data-board-id=${board.id}>${board.title}</div>
    //             <button class="toggle-board-button" data-board-id="${board.id}">Show Cards</button>
    //         </div>`;

    return `
    <section class="accordion" id="section-${board.id}" data-board-id="${board.id}">
    <div class="accordion-item">
    <h2 class="accordion-header" id="board-heading-${board.id}">
      <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#board-collapse-${board.id}" aria-expanded="true" aria-controls="board-collapse-${board.id}">
      </button>
    </h2>
    <div id="board-collapse-${board.id}" class="accordion-collapse collapse show" aria-labelledby="board-heading-${board.id}" data-bs-parent="#section-${board.id}">
      <div id="board-body-${board.id}" class="accordion-body">
      </div>
    </div>
    </div>
  </section>
`
}

function cardBuilder(card) {
    return `<div class="card" data-card-id="${card.id}">${card.title}</div>`;
}

