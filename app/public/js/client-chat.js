const socket = io();
const getEleById = (id) => {
    return document.getElementById(id);
}

const sendMessagesToServer = () => {
    getEleById("form-messages").addEventListener('submit', (e) => {
        // Ngăn không cho trình duyệt tự động refresh (BeforeUnload)
        e.preventDefault();
        const messageText = getEleById("input-messages").value;
        const acknowledgements = (error) => {
            if (error) {
                return alert(`Message illegal`);
            }
            console.log(`Đã gửi!`);
        }
        socket.emit(`send message to server`, messageText, acknowledgements);
    })
}

const receiveMessageFrServer = () => {
    socket.on(`send message to all client`, (messages) => {
        console.log(messages);
        const { messagesText, createAt, username, userId } = messages;
        let htmlContent = getEleById("app__messages").innerHTML;
        let messagesContent;
        if (userId == socket.id) {
            messagesContent = `
                <div class="message-item" style="direction: rtl">
                    <div class="message__row1">
                        <p class="message__date">${createAt}</p>
                        <p class="message__name">${username}</p>
                    </div>
                    <div class="message__row2">
                        <p class="message__content">
                            ${messagesText}
                        </p>
                    </div>
                </div>
            `;
        } else {
            messagesContent = `
                <div class="message-item">
                    <div class="message__row1">
                        <p class="message__name">${username}</p>
                        <p class="message__date">${createAt}</p>
                    </div>
                    <div class="message__row2">
                        <p class="message__content">
                            ${messagesText}
                        </p>
                    </div>
                </div>
            `;
        }
        let contentRender = htmlContent + messagesContent;
        getEleById("app__messages").innerHTML = contentRender;
        getEleById("input-messages").value = "";
    })
}

const sendLocationToServer = () => {
    getEleById("btn-share-location").addEventListener('click', () => {
        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            socket.emit('share location from client to server', { latitude, longitude });
            console.log(latitude, longitude);
        })
    })
}

const receiveLocationFrServer = () => {
    socket.on(`send location from server to client`, (data) => {
        const { messagesText, createAt, username, userId } = data;
        let htmlContent = getEleById("app__messages").innerHTML;
        let messagesContent;
        if (userId == socket.id) {
            messagesContent = `
                <div class="message-item" style="direction: rtl">
                    <div class="message__row1">
                        <p class="message__date">${createAt}</p>
                        <p class="message__name">${username}</p>
                    </div>
                    <div class="message__row2">
                        <p class="message__content">
                            <a href="${messagesText}" target="_blank">
                                Vị trí của tôi
                            </a>
                        </p>
                    </div>
                </div>
            `;
        } else {
            messagesContent = `
                <div class="message-item">
                    <div class="message__row1">
                        <p class="message__name">${username}</p>
                        <p class="message__date">${createAt}</p>
                    </div>
                    <div class="message__row2">
                        <p class="message__content">
                            <a href="${messagesText}" target="_blank">
                                Vị trí của tôi
                            </a>
                        </p>
                    </div>
                </div>
            `;
        }
        let contentRender = htmlContent + messagesContent;
        getEleById("app__messages").innerHTML = contentRender;
    })
}

// xử lý queryString
const queryString = location.search;
const params = Qs.parse(queryString, {
    ignoreQueryPrefix: true,
});
const { room, username } = params;

const joinRoomFormClientToServer = () => {
    socket.emit('join room form client to server', { room, username });
    // Hiển thị tên phòng lên màn hình
    getEleById("tenPhong").innerHTML = room;
}

const nhanDanhSachUserTuServer = () => {
    socket.on('send user list to client', (userList) => {
        let contentHtml = ``;
        userList.map((user) => {
            contentHtml += `
                <li class="app__item-user">${user.username}</li>
            `;
        })
        getEleById("app__list-user--content").innerHTML = contentHtml;
    })
}

export {
    sendMessagesToServer,
    receiveMessageFrServer,
    sendLocationToServer,
    receiveLocationFrServer,
    joinRoomFormClientToServer,
    nhanDanhSachUserTuServer,
}