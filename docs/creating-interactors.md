---
title: Creating Interactors
---

To create a custom interactor, the static [`extend`](/api/extend) method can be given a list of
properties to add to a new extended interactor. Let's use the popular [TodoMVC](https://todomvc.com)
app as an example. Since interactors are not dependent on the framework used to create the app, the
following interactors will work with all of the TodoMVC examples.

We can start creating a custom interactor by describing how a user would interact with a
component. In the TodoMVC app, there is an input where we can create a new todo item by typing in
some text and pressing enter. After pressing enter, the input is cleared and a new todo item is
added to the list. We can facilitate creating a new todo using both the [`type`](/actions/type) and
[`press`](/actions/press) actions in a single method. We can also add a getter so we can later
assert that the input is cleared after adding a todo.

``` javascript
// extend(properties)
const NewTodoInput = Interactor.extend({
  add(text) {
    return this.type(text).press('Enter');
  },

  get empty() {
    return !this.value;
  }
});
```

Next, we can create an interactor for a todo item. A todo item has a label, a toggle, and a delete
button. When you double click on an item to edit, an input is displayed and takes focus. Blurring
the input or pressing enter updates the todo item's label.

Interactor provides a helper to select elements by text, which will be helpful for selecting our
todo items. We can also provide interactor options to the extend function, including a selector
option that will be used when querying for the interactor element (see [`extend`](/api/extend) docs
for API details). Various properties can also be defined using [property](/properties) and
[action](/actions) creators.

``` javascript
import Interactor, { by, click, matches, text, type } from 'interactor.js';

// extend(options, properties)
const TodoItem = Interactor.extend({
  selector: text => by.text(text, '.list-item li')
}, {
  label: text('label'),
  toggle: () => click('.toggle'),
  completed: matches('.completed'),
  delete: () => click('.destroy'),
  edit: () => click().click(),
  update: val => type('.edit', val, { replace: true })
});
```

We can now use either of these interactors in our tests to interact with and make assertions against
those components. For making assertions, you can use getter properties with any assertion library,
or you can utilize interactor's built in assertions. Interactor assertions can be chained with
actions and run asynchronously, passing when the assertions do not fail within a timeout.

``` javascript
await NewTodoInput('.new-todo')
  .type('Item A')
  .assert.not.empty()
  .press('Enter')
  .assert.empty()
  .add('Item B')

await TodoItem('Item A')
  .assert.exists()
  .assert.not.completed()
  .toggle()
  .assert.completed()
  .delete()
  .assert.not.exists()

await TodoItem('Item B')
  .assert.label('Item B')
  .edit().update('Todo Item')
  .assert.label('Todo Item')
  .delete()
```

We can also use these custom interactors to create a new interactor that can interact with the
entire todo list. In addition to those components, the todo list has a toggle all button, a count of
remaining (incomplete) todo items, a set of filters, and a clear completed button.

``` javascript
const TodoList = Interactor.exted({
  // interactors can be nested within each other
  newTodo: NewTodoInput('.new-todo'),

  // interactor creator methods will return nested instances
  todoItem: TodoItem,

  toggleAll: () => click('.toggle-all'),
  incomplete: text('.todo-count'),
  filter: name => click(by.text(name, '.filters a')),
  clearCompleted: () => click('.clear-completed')
});
```

Now we can use the todo list interactor in our tests to interact with and make assertions about the
entire TodoMVC application.

``` javascript
// create a few todo items
await TodoList()
  .newTodo.add('Item A')
  .assert.incomplete('1 item left')
  .newTodo.add('Item B')
  .newTodo.add('Item C')
  .assert.incomplete('3 items left');

// complete a todo item
await TodoList()
  .todoItem('Item A').toggle()
  .assert.incomplete('2 items left');

// filtering todo items
await TodoList()
  .filter('Active')
  .assert.todoItem().count(2)
  .assert.todoItem('Item A').not.exists()
  .filter('Completed')
  .assert.todoItem().count(1)
  .assert.todoItem('Item A').exists()
  .filter('All')
  .assert.todoItem().count(3);

// clearing completed todo items
await TodoList()
  .clearCompleted()
  .assert.todoItem('Item A').not.exists()
  .assert.todoItem('Item B').exists()
  .assert.todoItem('Item C').exists()
  .toggleAll()
  .clearCompleted()
  .assert.todoItem().count(0)
```

All property getters defined in `extend` will get auto generated assertions. You can customize or
add additional assertions via an `assert` property descriptor. See [Making
Assertions](/making-assertions) for more details on interactor assertions.
