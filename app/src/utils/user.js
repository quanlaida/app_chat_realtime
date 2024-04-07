let userList = [
    {
        id: "1",
        username: "user1",
        room: "room1",
    },
    {
        id: "2",
        username: "user2",
        room: "room2",
    },
];

const getUserList = (room) => userList.filter((user) => user.room === room);
const addUser = (user) => userList = [...userList, user];
const removeUser = (id) => userList = userList.filter((user) => user.id !== id);
const findUser = (id) => userList.find((user) => user.id == id);

module.exports = {
    getUserList,
    addUser,
    removeUser,
    findUser,
}