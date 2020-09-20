const users = [] // this should be changed to database later on

const usersJoin = (id, name, room) => {
  const user = { id, name, room }
  users.push(user)
  return user
}

const usersFind = (id) => {
  users.find(user => user.id === id)
}

module.exports = { usersJoin, usersFind }
