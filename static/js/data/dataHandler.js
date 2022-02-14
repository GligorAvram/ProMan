export let dataHandler = {
  getBoards: async function () {
    const response = await apiGet("/api/boards");
    return response;
  },
  getBoard: function (boardId) {
    return fetch(`/api/boards/${boardId}`)
        .then(response => response.json());
  },
  getStatuses: async function (boardId) {
    return fetch(`/api/${boardId}/statuses`)
        .then(response => response.json());
  },
  getSpecialStatuses: async function() {
    return fetch(`/api/status/special`)
        .then(response => response.json());
  },
  getStatus: async function (statusId) {
    return fetch(`/api/status/${statusId}`)
    .then(response => response.json());
  },
  getCardsByBoardId: async function (boardId) {
    return fetch(`/api/boards/${boardId}/cards/`)
    .then(response => response.json());
  },
  getCard: async function (cardId) {
    return fetch(`/api/card/${cardId}`)
    .then(response => response.json());
  },
  createNewBoard: async function (boardTitle) {
    let payload = {
      title: boardTitle,
      }
    let response = await apiPost(`/api/boards/add`, payload);
    return response;
},
createNewCard: async function (cardTitle, boardId, statusId) {
  let payload = {
                 title: cardTitle,
                 board_id: boardId,
                 status_id: statusId
                 }
  let response = await apiPost(`api/card/add`, payload);
  return response;
},
  createNewStatus: async function (cardTitle, boardId) {
        let payload = {
                       title: cardTitle,
                       board_id: boardId
                       }
        let response = await apiPost(`api/status/add`, payload);
        return response;
  },
deleteBoard: async function (boardId) {
       apiDelete(`/api/boards/delete/${boardId}`);
  },
  deleteCard: async function (cardId) {
       apiDelete(`/api/cards/delete/${cardId}`);
  },
  deleteStatusCards: async function (boardId, statusId) {
        apiDelete(`/api/section/delete?boardId=${boardId}&statusId=${statusId}`)
  },
  renameBoard: async function (boardId, newName) {
        let payload = {
                       id: boardId,
                       name: newName
                       }
        apiPost(`api/board/rename`, payload);
  },
  renameCard: async function (cardId, newName) {
        let payload = {
                       id: cardId,
                       name: newName
                       }
        apiPost(`api/card/rename`, payload);
  },
  renameColumn: async function (boardId, statusId, newName) {
        let payload = {
                       board_id: boardId,
                       status_id: statusId,
                       name: newName
                       }
        let response = apiPost(`api/status/rename`, payload);
        return response;
  },
  addStatus: async function (title) {
    let payload = {
                   title: title
                   }
        apiPost(`api/status/add`, payload);
  },
  reorderCard: async function (cardId, statusId) {
    let payload = {
                   cardId: cardId,
                   statusId, statusId
                   }
        apiPost(`api/card/reorder`, payload);
  },
  getCardsForColumnOnBoard: async function(boardId, statusId){
            return fetch(`/api/board/${boardId}/${statusId}`)
    .then(response => response.json());
  }
};

async function apiGet(url) {
  let response = await fetch(url, {
    method: "GET",
  });
  if (response.status === 200) {
    let data = response.json();
    return data;
  }
}

  
  async function apiPost(url, payload) {
      let response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })
      .then(res => res.json())
      return response
  }
  
  async function apiDelete(url) {
      let del = fetch(url, {
          method: "DELETE"
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }
  
  async function apiPut(url) {}
  