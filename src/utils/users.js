users = [];

const addUser = ({ id, name, room }) => {

    //validation
    if (!name || !room) {
        return {
            error: "Username and Room are both required fields"
        }
    }
    //trim both user and room
    const username = name.trim().toLowerCase();
    const roomname = room.trim().toLowerCase();

    const existingUser = users.find((user) => user.name === username && user.room === roomname);
    if (existingUser) {
        return {
            error: "Username is already taken"
        }
    }

    users.push({ id, name: username, room: roomname });
    return { user: { id, name: username, room: roomname } };
};

const removeUsers = (id) => {
    const index = users.findIndex((user) => {
        //console.log(user)
        return user.id === id;
    });
    //console.log(index);
    if (index !== -1) {
        return users.splice(index, 1)[0]
    }

    return {
        error: "User not found!!!"
    }
}

const getUser = (id) => {
    const user = users.find((user) => user.id === id);
    if (!user) {
        return {
            error: "User not Found"
        }
    }
    return {
        user: {
            ...user
        }
    };
}

const getAllUsersRoom = (room) => {
    if (!room) {
        return users;
    }
    room = room.trim().toLowerCase();
    return users.filter((user) => user.room === room);
}

module.exports = {
    addUser,
    removeUsers,
    getUser,
    getAllUsersRoom
}