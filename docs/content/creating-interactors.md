---
title: Creating Interactors
---

Interactors were built to be extensible and composable. The core interactor API methods and built-in
actions and properties can be combined to create powerful, fast, automations.

To create custom interactors, the static [`extend`](/api/extend) method can be used to extend any
interactor. Let's start with the popular [TodoMVC](https://todomvc.com) example. Since interactors
are not dependent on the framework used to create the app, the following interactors will work with
all of the TodoMVC examples.

In the TodoMVC app, there is an input where we can create a new todo item by typing in some text and
pressing enter. After pressing enter, the input is cleared and a new todo item is added to the
list. Beginning with the new todo input, interactors have both a [`type`](/actions/type) and
[`press`](/actions/press) action to facilitate creating a new todo, but we can combine them into a
single method for ease of use. We can also add a getter so we can later assert that the input is
cleared after adding a todo.

``` javascript
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
todo items. We can also provide an interactor selector option that will be used when querying for
the interactor element (see [`extend`](/api/extend) docs for API details).

``` javascript
import Interactor, { by } from 'interactor.js';

const TodoItem = Interactor.extend({
  interactor: {
    selector: label => $el => {
      let $list = $el.querySelector('.todo-list');
      return by.text(label, 'li')($list);
    }
  },

  get label() {
    return this.find('label').text;
  },

  toggle() {
    return this.find('.toggle').click();
  },

  get completed() {
    return this.matches('.completed');
  },

  delete() {
    return this.find('.destroy').click();
  },

  edit() {
    return this.click().click();
  },

  update(text) {
    return Interactor('.edit')
      // replace the previous value
      .type(text, { range: [0, -1] })
      .blur();
  }
});
```

We can now use either of these interactors in our tests to interact with and make assertions against
those elements. For making assertions, you can use the getter properties with any assertion library,
or you can utilize interactor's built in assertions. Interactor assertions can be chained with
actions and run asynchronously, passing when the assertion doesn't fail within a timeout.

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
  newTodo: NewTodoInput('.new-todo'),

  todoItem: TodoItem,

  toggleAll() {
    this.find('.toggle-all').click();
  },

  get incomplete() {
    return this.find('.todo-count').text;
  },

  filter(name) {
    return this.find('.filters').find(by.text(name)).click();
  },

  clearCompleted() {
    return this.find('.clear-completed').click();
  }
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
  .assert.todoItem('Item A').not.exists()
  .assert.todoItem('Item B').exists()
  .filter('Completed')
  .assert.todoItem('Item A').exists()
  .assert.todoItem('Item B').not.exists()
  .filter('All')
  .assert.todoItem('Item A').exists()
  .assert.todoItem('Item B').exists();

// clearing completed todo items
await TodoList()
  .clearCompleted()
  .assert.todoItem('Item A').not.exists()
  .assert.todoItem('Item B').exists()
  .assert.todoItem('Item C').exists();
  .toggleAll()
  .clearCompleted()
  .assert.todoItem('Item B').not.exists()
  .assert.todoItem('Item C').not.exists()
```

All getters defined in `extend` will get an auto generated assertion as well. You can customize
or add additional assertions using the `assert` option. See [Making Assertions](/making-assertions)
for more details on interactor assertions.
