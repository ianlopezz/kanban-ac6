let state = [
  { id: '101', title: 'Dissenyar base de dades', description: 'Crear esquema ERD', status: 'todo' },
  { id: '102', title: 'Configurar servidor Node', description: 'Express i CORS', status: 'in-progress' }
];

const board = document.getElementById('board');
const form = document.getElementById('new-task-form');
const template = document.getElementById('task-card-template');

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  renderAllTasks();
  setupEventListeners();
  updateTaskCount();
}

// MÒDUL 1 & 2
function createTaskCard(task) {
  const clone = template.content.cloneNode(true);
  const card = clone.querySelector('.task-card');

  card.dataset.taskId = task.id;
  card.querySelector('.task-title').textContent = task.title;
  card.querySelector('.task-desc').textContent = task.description;

  const statusSelect = card.querySelector('.task-status-select');
  statusSelect.value = task.status;
  card.classList.toggle('completed', task.status === 'done');

  return clone;
}

function renderAllTasks() {
  const lists = {
    todo: document.getElementById('todo-list'),
    'in-progress': document.getElementById('in-progress-list'),
    done: document.getElementById('done-list')
  };

  Object.values(lists).forEach((list) => {
    list.replaceChildren();
  });

  state.forEach((task) => {
    const list = lists[task.status];
    if (list) {
      list.appendChild(createTaskCard(task));
    }
  });
}

function setupEventListeners() {
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const titleInput = document.getElementById('task-title-input');
    const descriptionInput = document.getElementById('task-desc-input');
    const statusInput = document.getElementById('task-status-select');

    state.push({
      id: String(Date.now()),
      title: titleInput.value.trim(),
      description: descriptionInput.value.trim(),
      status: statusInput.value
    });

    renderAllTasks();
    updateTaskCount();
    form.reset();
  });

  board.addEventListener('change', (e) => {
    if (!e.target.matches('.task-status-select')) return;

    const card = e.target.closest('.task-card');
    const task = state.find((item) => item.id === card.dataset.taskId);
    const list = document.getElementById(`${e.target.value}-list`);

    if (!task || !list) return;

    task.status = e.target.value;
    card.classList.toggle('completed', task.status === 'done');
    list.appendChild(card);
  });

  board.addEventListener('click', (e) => {
    const target = e.target;

    const header = target.closest('.column-header');
    if (header) {
      header.nextElementSibling.classList.toggle('collapsed');
      return;
    }

    const card = target.closest('.task-card');
    if (!card) return;

    const taskIndex = state.findIndex((task) => task.id === card.dataset.taskId);
    if (taskIndex === -1) return;

    if (target.closest('.btn-delete')) {
      state.splice(taskIndex, 1);
      card.remove();
      updateTaskCount();
      return;
    }

    const direction = target.closest('.btn-up') ? 'up'
      : target.closest('.btn-down') ? 'down'
      : null;
    if (!direction) return;

    const sibling = direction === 'up'
      ? card.previousElementSibling
      : card.nextElementSibling;
    if (!sibling || !sibling.classList.contains('task-card')) return;

    const siblingIndex = state.findIndex((task) => task.id === sibling.dataset.taskId);
    if (siblingIndex === -1) return;

    if (direction === 'up') {
      card.parentElement.insertBefore(card, sibling);
    } else {
      card.parentElement.insertBefore(sibling, card);
    }

    [state[taskIndex], state[siblingIndex]] = [state[siblingIndex], state[taskIndex]];
  });
}

// MÒDUL 5: WEB COMPONENT
class TaskBadge extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() { this.render(); }
  static get observedAttributes() { return ['count']; }
  attributeChangedCallback(name, oldValue, newValue) { if (oldValue !== newValue) this.render(); }

  render() {
    const value = this.getAttribute('count') || '0';
    this.shadowRoot.innerHTML = `
      <style>
        .badge {
          background: purple;
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
        }
      </style>
      <span class="badge">Items: ${value}</span>
    `;
  }
}
customElements.define('task-badge', TaskBadge);

function updateTaskCount() {
  document.getElementById('global-badge').setAttribute('count', state.length);
}