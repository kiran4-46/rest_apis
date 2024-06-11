const express = require('express')
const app = express()
app.use(express.json())
const path = require('path')
const dbpath = path.join(__dirname, 'todoApplication.db')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
let database = null

const initializationDbAndServer = async () => {
  try {
    database = await open({filename: dbpath, driver: sqlite3.Database})
    console.log(
      app.listen(3000, () => {
        console.log('ther server is running at http://localhost:3000')
      }),
    )
  } catch (error) {
    console.log(`the server is not running properly ${error.message}`)
  }
}

initializationDbAndServer()

// API1
const statusAndPriorityDefined = requestQuery => {
  return (
    requestQuery.status !== undefined && requestQuery.priority !== undefined
  )
}
const statusDefined = requestQuery => {
  return requestQuery.status !== undefined
}
const priorityDefined = requestQuery => {
  return requestQuery.priority !== undefined
}

//Scenario 1 to get list of todos whose have status like TO DO
// Scenario 2 to get list of todos whose have priority like HIGH
//scenatio 3 to get whose priority is High and status in INProgress
//scenario 4 to return a "play" text containerd object
app.get('/todos/', async (request, response) => {
  const {search_q = '', priority, status} = request.query
  let getTodoQuery = ''
  switch (true) {
    case statusDefined(request.query):
      getTodoQuery = `SELECT * FROM todo  WHERE status = "${status}";`
      break
    case priorityDefined(request.query):
      getTodoQuery = `SELECT * FROM todo WHERE priority = "${priority}";`
      break
    case statusAndPriorityDefined(request.query):
      getTodoQuery = `SELECT * FROM todo WHERE priority = "${priority}" AND 
      status = "${status}";`
      break
    default:
      getTodoQuery = `SELECT * FROM todo WHERE todo LIKE "%${search_q}%";`
      break
  }
  const data = await database.all(getTodoQuery)
  response.send(data)
})
//API 2 returns a list of todos based on todo id
app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const getTodoQuery = `SELECT * FROM todo WHERE id = ${todoId};`
  const dbResponse = await database.get(getTodoQuery)
  response.send(dbResponse)
})
//API 3 post a new todo
app.post('/todos/', async (request, response) => {
  const {todoId, todoActivity, todoPriority, todoStatus} = request.body
  const postTodoQuery = `
  INSERT INTO
   todo (id, todo, priority, status)
  VALUES (${todoId}, '${todoActivity}', '${todoPriority}', '${todoStatus}');`
  await database.run(postTodoQuery)
  response.send('Todo Successfully Added')
})
// API 4 update a todo table key values
const statusNotDone = requestquery => {
  return requestquery.status !== 'DONE'
}
const prioritySpecification = requestquery => {
  return requestquery.priority !== 'HIGH'
}
app.put('/todos/:todoId/', async (request, response) => {
  let updateTodoQuery = ''
  const {todo, priority, status} = request.query
  const {todoId} = request.params
  let answer = ''
  switch (true) {
    case statusNotDone(request.query):
      updateTodoQuery = `UPDATE todo SET status = "${status}" 
    WHERE id = ${todoId};`
      answer = 'Status Updated'
      break
    case prioritySpecification(request.query):
      updateTodoQuery = `UPDATE todo SET priority = "${priority}" 
    WHERE id = ${todoId};`
      answer = 'Priority Updated'
      break
    default:
      updateTodoQuery = `UPDATE todo SET todo = "${todo}"
    WHERE id = ${todoId};`
      answer = 'Todo Updated'
      break
  }
  await database.run(updateTodoQuery)
  response.send(answer)
})
// API 5 todo deleted
app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const deleteTodoQuery = `DELETE FROM todo WHERE id = ${todoId};`
  await database.run(deleteTodoQuery)
  response.send('Todo Deleted')
})
module.exports = app
