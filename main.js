'use strict'

class Task{
    taskText;
    taskID;
    isFinished;

    constructor(text, id){
        this.taskText = text;
        this.taskID = id;
        this.isFinished = false;
    }

    // getTaskHTML(){
    //     return `<div class="task" data-id="${this.taskID}" >
    //     <input type="checkbox" class="checkbox-round">
    //     <p class="task-text">${this.taskText}</p>
    //     <button class="delete-task"></button>
    //     </div>`;    
    // }

}

let lastId = 1
let taskList = [];

const pFooterElement = document.querySelector(".text-items-left");
const taskGroupFooterElement = document.querySelector(".task-group-footer")
const filterHTMLElement = document.createElement("div");
initiateState()

const themeIconImg = document.querySelector(".icon-theme")
const newTaskInputText = document.querySelector("#new-task-text")
const checkTaskInputCheckbox = document.querySelector(".checkbox-round")
const taskGroupElement = document.querySelector(".task-group")
const itemsLeftElement = document.querySelector(".no-of-items-left")
const clearCompletedButton = document.querySelector(".button-clear-completed")
const filterButtons = document.querySelectorAll(".button-filter")
const filtersContainerElement = document.querySelector(".filters")
const mediaQuery = window.matchMedia('(min-width: 780px)');


const defaultToDoText = "Create a new todo..."


function populateDummyTasks(){
    const sampleTask1 = new Task("this is a a sample task", 1);
    const sampleTask2 = new Task("another task", 2);
    const sampleTask3 = new Task("yet another task", 3);
    lastId = 4;
    
    taskList.push(sampleTask1)
    taskList.push(sampleTask2)
    taskList.push(sampleTask3)
    

    taskList.forEach(task => {
        addTask(task.taskText,task.taskID)
    })
}

populateDummyTasks()


function initiateState(){
    filterHTMLElement.classList.add("filters");
    filterHTMLElement.innerHTML = `<button class="clear-button-styling button-filter button-filter-selected">All</button>
    <button class="clear-button-styling button-filter">Active</button>
    <button class="clear-button-styling button-filter">Completed</button>`;

    if(window.screen.width >= 780)
    {
        pFooterElement.after(filterHTMLElement) 
    }
    else{
        taskGroupFooterElement.after(filterHTMLElement) 
    }
}

filtersContainerElement.addEventListener("click", (event) =>{
    if(event.target.classList.contains("button-filter-selected"))
        return;

    deactivateActiveFilter();
    event.target.classList.add("button-filter-selected")
    
        taskGroupElement.querySelectorAll(".task").forEach(node => {
            const tmpTask = taskList.find(task => {
                return task.taskID === Number(node.dataset.id)
            })
            if(tmpTask.isFinished === true && event.target.textContent === "Active")
                node.classList.add("task-hide");
            else if (tmpTask.isFinished === false && event.target.textContent === "Active") 
                node.classList.remove("task-hide");
            else if(tmpTask.isFinished === true && event.target.textContent === "Completed")
                node.classList.remove("task-hide");
            else if(tmpTask.isFinished === false && event.target.textContent === "Completed")
                node.classList.add("task-hide");
            else
                node.classList.remove("task-hide");
        })
})


function deactivateActiveFilter(){
    filterButtons.forEach(button => {
        button.classList.remove("button-filter-selected")
    })
}

themeIconImg.addEventListener("click", (event)=>{
    document.documentElement.classList.toggle("light-theme")
    document.documentElement.classList.toggle("dark-theme")
})

mediaQuery.addEventListener("change", event => {
    console.log("HIT!")
    if(window.innerWidth >= 780)
    {
        filterHTMLElement.remove();
        pFooterElement.after(filterHTMLElement) 
    }
    else{
        filterHTMLElement.remove();
        taskGroupFooterElement.after(filterHTMLElement) 
    }
}) 

clearCompletedButton.addEventListener("click",(event)=>{
    removeTasksFromDOM("COMPLETED");
    removeCompletedTaskFromTaskList(event.target.parentElement.dataset.id);
    updateItemsLeft();
})

newTaskInputText.addEventListener("blur", (event)=>{
    if(newTaskInputText.value === "")
        newTaskInputText.value = defaultToDoText;
})


newTaskInputText.addEventListener("click", (event)=>{
    if(newTaskInputText.value === defaultToDoText)
       newTaskInputText.value = "";
})

newTaskInputText.addEventListener("keyup", (event)=>{ 
    if (event.keyCode !== 13 || newTaskInputText.value === "" ||  newTaskInputText.value === defaultToDoText) {
        return;
    }
    
    const ttask = new Task(newTaskInputText.value,lastId++);
    taskList.push(ttask)
    addTask(ttask.taskText, ttask.taskID)
    newTaskInputText.value = "";
    updateItemsLeft();
})

function addTask(taskText, id){
    const tempTask = document.createElement("div")
    tempTask.dataset.id = id;
    tempTask.classList.add("task")
    tempTask.setAttribute("draggable", "true")
    tempTask.innerHTML = `<input type="checkbox" class="checkbox-round">
    <p class="task-text">${taskText}</p>
    <button class="delete-task"></button>`
    
    taskGroupElement.appendChild(tempTask)
    appendDragDrop(tempTask)
}

taskGroupElement.addEventListener("click", (event)=>{
    //handle crossing out of a task once checkbox is clicked
    if(event.target.classList.contains("checkbox-round"))
    {
        event.target.parentElement.querySelector(".task-text").classList.toggle("cross-out");
        const curTask = taskList.find(task => {
            return task.taskID === Number(event.target.parentElement.dataset.id)
        });
        curTask.isFinished = !curTask.isFinished;
        updateItemsLeft();
    }   

    //handle removing a task once remove button is clicked
    if(event.target.classList.contains("delete-task")){
        removeCompletedTaskFromTaskList(event.target.parentElement.dataset.id)
        event.target.parentElement.remove();  
        updateItemsLeft();
    }
        
})

function updateItemsLeft(){
    itemsLeftElement.textContent = taskList.reduce((acc, cur) => {
        if(!cur.isFinished) 
            return acc+1; 
        else 
            return acc;
        }, 0)
}

function removeTasksFromDOM(type){
    if(type==="COMPLETED"){
    taskList.forEach(task => {
        if(task.isFinished){
            document.querySelector(`[data-id="${task.taskID}"]`).remove();
            removeCompletedTaskFromTaskList(task.taskID);
        }
    })}
}

function removeCompletedTaskFromTaskList(id){
    taskList = taskList.filter(task => {return task.taskID !== Number(id)})
}



//DEBUG THIS!!!
let dragged = null;
taskGroupElement.childNodes.forEach((node) => {
    appendDragDrop(node)
})




function appendDragDrop(node){
    node.addEventListener("dragstart", event =>{
        event.target.style.opacity="0.5";
        // event.dataTransfer.setData("text/html", node.dataset.id)
        dragged = node
    })

    node.addEventListener("dragover", event => {
        event.preventDefault();
    })

    node.addEventListener("dragend", event =>{
        event.target.style.opacity="1";
    })

    node.addEventListener("drop", event => {
        // event.preventDefault();
        let droppingOnElement;
        if(event.target.parentElement.classList.contains("task-group"))
            droppingOnElement = event.target
        else droppingOnElement = event.target.parentElement
        
        
        console.log("dragged: ", dragged)
        console.log("drop on: ", droppingOnElement)
        taskGroupElement.insertBefore(dragged, droppingOnElement) 
        // dragged = null
    })
}