(function(){
  "use strict";

  // ----- STATE -----
  let tasks = [];
  let editingTaskId = null; // track which task is being edited

  // Default sample tasks
  const defaultTasks = [
    {
      id: '1',
      title: 'Design system audit',
      description: 'Review color contrast and component spacing for accessibility.',
      priority: 'high',
      status: 'pending',
      dueDate: '2026-04-18',
      completed: false
    },
    {
      id: '2',
      title: 'API integration tests',
      description: 'Write integration tests for user endpoints and error handling.',
      priority: 'medium',
      status: 'pending',
      dueDate: '2026-04-22',
      completed: false
    },
    {
      id: '3',
      title: 'Responsive polish',
      description: 'Fix mobile overflow and improve touch targets.',
      priority: 'low',
      status: 'pending',
      dueDate: '2026-04-15',
      completed: false
    }
  ];

  // DOM elements
  const gridEl = document.getElementById('taskGridContainer');
  const emptyMsg = document.getElementById('emptyPlaceholder');
  const feedbackEl = document.getElementById('liveFeedback');
  const titleInput = document.getElementById('taskTitleInput');
  const descInput = document.getElementById('taskDescInput');
  const duePicker = document.getElementById('dueDatePicker');
  const prioritySelect = document.getElementById('prioritySelect');
  const addBtn = document.getElementById('addTaskBtn');
  const cancelBtn = document.getElementById('cancelEditBtn');

  // Set default due date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  duePicker.value = tomorrow.toISOString().split('T')[0];

  // ----- Helper: format date as "15 Apr 2026" -----
  function formatDueDate(dateStr) {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  }

  // ----- Helper: calculate relative time -----
  function getRelativeTime(dueDateStr, isCompleted) {
    if (isCompleted) return '✓ Completed';
    const due = new Date(dueDateStr);
    const now = new Date();
    const diff = due - now;
    if (diff < 0) return '⚠️ Overdue';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    if (days > 0) return `${days}d left`;
    if (hours > 0) return `${hours}h left`;
    return 'Due soon';
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ----- UI: Update form button state based on editing mode -----
  function updateFormUI() {
    if (editingTaskId) {
      addBtn.innerHTML = `<span>✏️</span> Update Task`;
      cancelBtn.style.display = 'inline-flex';
    } else {
      addBtn.innerHTML = `<span>+</span> Create Task`;
      cancelBtn.style.display = 'none';
    }
  }

  // ----- Clear form and exit edit mode -----
  function resetForm() {
    titleInput.value = '';
    descInput.value = '';
    const nextDay = new Date();
    nextDay.setDate(nextDay.getDate() + 1);
    duePicker.value = nextDay.toISOString().split('T')[0];
    prioritySelect.value = 'medium';
    editingTaskId = null;
    updateFormUI();
  }

  // ----- Populate form with task data for editing -----
  function populateFormForEdit(task) {
    titleInput.value = task.title;
    descInput.value = task.description;
    duePicker.value = task.dueDate;
    prioritySelect.value = task.priority;
    editingTaskId = task.id;
    updateFormUI();
    titleInput.focus();
  }

  // ----- Render all cards -----
  function renderTasks() {
    if (tasks.length === 0) {
      gridEl.innerHTML = '';
      emptyMsg.style.display = 'block';
      return;
    }
    emptyMsg.style.display = 'none';

    let html = '';
    tasks.forEach(task => {
      const completedClass = task.completed ? 'completed' : '';
      const statusText = task.completed ? 'Done' : 'Pending';
      const statusClass = task.completed ? 'status-done' : '';
      const timeText = getRelativeTime(task.dueDate, task.completed);
      
      let priorityClass = 'priority-med';
      if (task.priority === 'high') priorityClass = 'priority-high';
      if (task.priority === 'low') priorityClass = 'priority-low';
      
      const dueDisplay = formatDueDate(task.dueDate);

      html += `
        <article class="task-card ${completedClass}" data-task-id="${task.id}">
          <div class="card-header-row">
            <input type="checkbox" class="task-check" ${task.completed ? 'checked' : ''} data-action="toggle" data-id="${task.id}" aria-label="Mark as complete">
            <h3 class="card-title">${escapeHtml(task.title)}</h3>
            <div class="card-actions">
              <button class="icon-btn" data-action="edit" data-id="${task.id}" aria-label="Edit task">✏️</button>
              <button class="icon-btn" data-action="delete" data-id="${task.id}" aria-label="Delete task">🗑️</button>
            </div>
          </div>
          <p class="task-description">${escapeHtml(task.description)}</p>
          <div class="badge-group">
            <span class="priority-badge ${priorityClass}">${task.priority.toUpperCase()}</span>
            <span class="status-tag ${statusClass}">${statusText}</span>
          </div>
          <footer class="card-footer">
            <span class="due-badge">📅 ${dueDisplay}</span>
            <span class="time-indicator">${timeText}</span>
          </footer>
        </article>
      `;
    });
    gridEl.innerHTML = html;
  }

  // ----- Save task (add or update) -----
  function saveTask() {
    const title = titleInput.value.trim();
    const desc = descInput.value.trim();
    const due = duePicker.value;
    const priority = prioritySelect.value;

    if (!title) {
      feedbackEl.textContent = 'Please provide a task title.';
      return;
    }
    if (!due) {
      feedbackEl.textContent = 'Please select a due date.';
      return;
    }

    if (editingTaskId) {
      // Update existing task
      const taskIndex = tasks.findIndex(t => t.id === editingTaskId);
      if (taskIndex !== -1) {
        tasks[taskIndex] = {
          ...tasks[taskIndex],
          title,
          description: desc || 'No description provided.',
          priority,
          dueDate: due
        };
        feedbackEl.textContent = `✅ Task updated.`;
      }
    } else {
      // Add new task
      const newTask = {
        id: Date.now() + '' + Math.floor(Math.random() * 1000),
        title,
        description: desc || 'No description provided.',
        priority,
        status: 'pending',
        dueDate: due,
        completed: false
      };
      tasks.unshift(newTask);
      feedbackEl.textContent = `✅ Task added.`;
    }

    renderTasks();
    resetForm();
    setTimeout(() => { feedbackEl.textContent = ''; }, 2000);
  }

  // ----- Cancel edit -----
  function cancelEdit() {
    resetForm();
    feedbackEl.textContent = 'Edit cancelled.';
    setTimeout(() => { feedbackEl.textContent = ''; }, 1500);
  }

  // ----- Toggle complete -----
  function toggleTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      renderTasks();
    }
  }

  // ----- Delete task -----
  function deleteTask(taskId) {
    tasks = tasks.filter(t => t.id !== taskId);
    if (editingTaskId === taskId) {
      resetForm(); // exit edit mode if the task being edited is deleted
    }
    renderTasks();
    feedbackEl.textContent = 'Task removed.';
    setTimeout(() => { feedbackEl.textContent = ''; }, 1200);
  }

  // ----- Event delegation for grid actions -----
  gridEl.addEventListener('click', (e) => {
    const target = e.target.closest('[data-action]');
    if (!target) return;
    const action = target.getAttribute('data-action');
    const taskId = target.getAttribute('data-id');
    
    if (action === 'toggle') {
      toggleTask(taskId);
    } else if (action === 'delete') {
      deleteTask(taskId);
    } else if (action === 'edit') {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        populateFormForEdit(task);
      }
    }
  });

  gridEl.addEventListener('change', (e) => {
    if (e.target.classList.contains('task-check')) {
      const taskId = e.target.getAttribute('data-id');
      toggleTask(taskId);
    }
  });

  // ----- Button listeners -----
  addBtn.addEventListener('click', saveTask);
  cancelBtn.addEventListener('click', cancelEdit);

  titleInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveTask();
    }
  });

  // Initialize
  tasks = defaultTasks.map(t => ({ ...t, id: t.id + '-' + Date.now() + Math.random() }));
  renderTasks();
  updateFormUI();

  // Periodic time update
  setInterval(() => {
    renderTasks();
  }, 45000);
})();