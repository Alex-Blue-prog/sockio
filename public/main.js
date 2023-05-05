const socket = io();
let username = "";
let userList = [];

let loginPage = document.querySelector("#loginPage");
let chatPage = document.querySelector("#chatPage");

let loginInput = document.querySelector("#loginNameInput");
let textInput = document.querySelector("#chatTextInput");

loginPage.style.display = "flex";
chatPage.style.display = "none";

loginInput.addEventListener("keyup", (e) => {
    if(e.keyCode === 13) {
        let name = loginInput.value.trim();
        if(name !== "" ) {
            username = name;
            document.title = `Chat (${username})`;

            socket.emit("join-request", username);
        }
    }
});

function renderUserList() {
    let ul = chatPage.querySelector(".chatArea .userList");
    ul.innerHTML = "";

    userList.forEach((value) => {
        const li  = document.createElement("li");
        li.innerHTML = value;
        ul.append(li);
    });
}

function addMessage(type, user, msg) {
    let ul = chatPage.querySelector(".chatArea .chatList");

    if(type === "status") {
        ul.innerHTML += `<li class="m-status">${msg}</li>`;

    } else {
        ul.innerHTML += `<li class="m-txt"><span class="${user === "Eu" ? "me" : ""}">${user}:</span> ${msg}</li>`;
    }

    ul.scrollTop = ul.scrollHeight;
}

socket.on("user-ok", (list) => {
    loginPage.style.display = "none";
    chatPage.style.display = "flex";
    textInput.focus();

    addMessage("status", null, "Conectado!");

    userList = list;
    renderUserList();
});

socket.on("list-update", ({joined, left, list}) => {

    userList = list;
    renderUserList();

    joined && addMessage("status", null, `Entrou - ${joined}`);
    left && addMessage("status", null, `Saiu - ${left}`);

});

textInput.addEventListener("keyup", (e) => {
    if(e.keyCode === 13) {
        let msg = e.currentTarget.value.trim();
        textInput.value = "";

        if(msg !== "" ) {
            // addMessage(null, "Eu", msg);
            socket.emit("send-msg", msg);
        }
    }
});

socket.on("show-msg", (obj) => {
    obj.username = obj.username === username ? "Eu" : obj.username;
    addMessage(null, obj.username, obj.message);
});

// -- //
socket.on("disconnect", () => {
    addMessage("status", null, "Voce foi desconectado!");

    userList = [];
    renderUserList();
});

socket.on("reconnect_error", () => {
    addMessage("status", null, "Tentando reconectar...");
});

socket.on("reconnect", () => {
    addMessage("status", null, "Reconectado!");
    username && socket.emit("join-request", username);
});


socket.emit("disconnect");
// socket.disconnect();