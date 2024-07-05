const tasks = [];
let time = 0;
let timeSpent = 0;
let timer = null;
let timerBreak = null;
let current = null;

const bAdd = document.querySelector('#bAdd');
const itTask = document.querySelector('#itTask');
const form = document.querySelector('#form');
const taskName = document.querySelector('#time #taskName');

const hour = document.querySelector('#hours');
const min = document.querySelector('#minutes');
const sec = document.querySelector('#seconds');

renderTime();
renderTasks();

form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (itTask.value !== '') {
        const selectedHour = parseInt(hour.value, 10) || 0;
        const selectedMin = parseInt(min.value, 10) || 0;
        const selectedSec = parseInt(sec.value, 10) || 0;
        const totalTime = selectedHour * 3600 + selectedMin * 60 + selectedSec;
        createTask(itTask.value, totalTime);
        itTask.value = '';
        hour.value = '0';
        min.value = '0';
        sec.value = '0';
        renderTasks();
        renderTotalTimeWorked();
    }
});

function createTask(value, totalTime) {
    const newTask = {
        id: (Math.random() * 100).toString(36).slice(3), //id dinamico
        title: value,
        timeSpent: 0, // tiempo trabajado para esta tarea
        timeGoal: totalTime,
        completed: false,
        //progression - barra de progreso
    };
    //esto es para añadirlo al array tasks
    tasks.unshift(newTask);
}

function renderTaskButtons(task) {
    let buttonText = '';
    if (task.id === current && timer) buttonText = 'Stop';
    else if (task.id === current && !timer) buttonText = 'No deberia pasar';
    else if (task.id !== current && task.timeSpent > 0) buttonText = 'Continue';
    else buttonText = 'Start';

    if (task.completed) return `<p>Done!</p>`;
    else
        return `
        <button class=" start-button" data-id="${task.id}">${buttonText}</button>
        <button class=" done-button" data-id="${task.id}">Done</button>
        <button class=" delete-button" data-id="${task.id}">Delete</button>
    `;
}

function renderTasks() {
    const html = tasks.map((task) => {
        return `
            <div class="task ${task.completed && 'completed'} ${
            task.id === current && 'task-shadow'
        }">
                <div id="title">${task.title}</div>
                <div id="timeSpent">${formatTime(task.timeSpent)}</div>
                <div id="timeGoal">${formatTime(task.timeGoal)}</div>

                <div class="buttons">${renderTaskButtons(task, timer)}</div>
                <div class="progress">
                    <div class="${
                        task.completed ? 'progress_completed' : 'progress_bar'
                    } " style="width: ${calculateProgress(task.timeSpent, task.timeGoal)}%;"></div>
                </div>
            </div>
        `;
    });

    const tasksContainer = document.querySelector('#tasks');
    tasksContainer.innerHTML = html.join('');

    const startButtons = document.querySelectorAll('.task .start-button');
    startButtons.forEach((button) => {
        button.addEventListener('click', (e) => {
            const id = button.getAttribute('data-id');
            if (button.textContent === 'Start' && !timer) {
                startButtonHandler(id);

                button.textContent = 'Stop';
            } else if (button.textContent === 'Stop') {
                stopButtonHandler(id);
                button.textContent = 'Continue';
            } else if (button.textContent === 'Continue' && !timer) {
                startButtonHandler(id);
                button.textContent = 'Stop';
            }
        });
    });

    const doneButtons = document.querySelectorAll('.task .done-button');
    doneButtons.forEach((button) => {
        button.addEventListener('click', (e) => {
            const id = button.getAttribute('data-id');
            markCompleted(id);

            renderTasks();
            renderTotalTimeWorked();
        });
    });

    const deleteButtons = document.querySelectorAll('.task .delete-button');
    deleteButtons.forEach((button) => {
        button.addEventListener('click', (e) => {
            const id = button.getAttribute('data-id');
            deleteTask(id);
            renderTasks();
            renderTotalTimeWorked();
        });
    });

    renderTotalTimeWorked();
}

//HAY UN POCO DE BUG EN LOS BOTONES
function startButtonHandler(id) {
    const taskIndex = tasks.findIndex((task) => task.id === id);
    time = tasks[taskIndex].time;
    current = id;
    taskName.textContent = tasks[taskIndex].title;
    renderTime(time);
    timer = setInterval(() => {
        timeHandler(id);
    }, 1000);
}

function stopButtonHandler(id) {
    clearInterval(timer);
    timer = null;
    current = null;
    const taskIndex = tasks.findIndex((task) => task.id === id);
    tasks[taskIndex].time = time; // Update the task's remaining time
    taskName.textContent = '';
    renderTasks();
    renderTotalTimeWorked();
}

function timeHandler(id) {
    const taskIndex = tasks.findIndex((task) => task.id === id);
    tasks[taskIndex].timeSpent++;
    renderTime(tasks[taskIndex].timeSpent);
    renderTasks();
    renderTotalTimeWorked();

    if (tasks[taskIndex].timeSpent >= tasks[taskIndex].timeGoal) {
        clearInterval(timer);
        tasks[taskIndex].completed = true;
        timer = null;
        current = null;
        renderTasks();
        renderTotalTimeWorked();
    }

    // if(time === 0){
    //     clearInterval(timer);
    //     markCompleted(id);
    //     timer = null;
    //     renderTasks();

    // }
}

function renderTime(totalSeconds) {
    const timeDiv = document.querySelector('#time #value');
    const hours = parseInt(totalSeconds / 3600);
    const minutes = parseInt((totalSeconds % 3600) / 60);
    const seconds = parseInt(totalSeconds % 60);

    timeDiv.textContent = `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${
        seconds < 10 ? '0' : ''
    }${seconds}`;
}

function formatTime(totalSeconds) {
    const hours = parseInt(totalSeconds / 3600);
    const minutes = parseInt((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function markCompleted(id) {
    const taskIndex = tasks.findIndex((task) => task.id === id);
    tasks[taskIndex].completed = true;
}

// cosas que siguen sin funcionar: el total time Task sigue sin funcionar porque va bajando y debería ser estatico. Y el total time worked sigue sin funcionar porque se queda a 0 todo el rato.
function renderTotalTimeWorked() {
    const totalSecondsWorked = tasks.reduce((acc, task) => acc + task.timeSpent, 0);
    const totalTimeWorked = formatTime(totalSecondsWorked);

    let totalSecondsTasks = 0;

    tasks.forEach((task) => {
        if (typeof task.timeGoal === 'number' && !isNaN(task.timeGoal)) {
            totalSecondsTasks += task.timeGoal;
        }
    });
    // const totalSecondsTasks = tasks.reduce((acc, task) => acc + task.timeGoal, 0);
    const totalTimeTasks = formatTime(totalSecondsTasks);

    const sumTimeDiv = document.querySelector('#sumTime');
    sumTimeDiv.innerHTML = `Total del tiempo trabajado: ${totalTimeWorked} de <span>${totalTimeTasks}</span>`;
}

function calculateProgress(timeSpent, timeGoal) {
    return (timeSpent / timeGoal) * 100;
}

function deleteTask(id) {
    const taskIndex = tasks.findIndex((task) => task.id === id);
    tasks.splice(taskIndex, 1);
}
