import React, {createRef, useRef, useState} from 'react';
import TaskItem from './TaskItem';
import {Autocomplete} from "@react-google-maps/api";
import Endpointbox from "./Endpointbox";

function TaskList({onTaskChange}) {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState('');
    let newLocation = createRef(); //location of human
    let newDestination = createRef();
    let result = [];
    const updateTask = (name) => {
        const updatedTasks = tasks.filter(task => task[0] !== name);
        setTasks(updatedTasks);
    };


    const addTask = async () => {
        if (newTask.trim() !== '') {
            setTasks([...tasks, [newTask, 'waiting', newDestination.current.value, newLocation.current.value]]);
            await pushNewTask([newTask, 'waiting', newDestination.current.value, newLocation.current.value]);
            onTaskChange(newTask);// Pass the new task to the parent component
        }
    };

    async function pushNewTask(a) {
        console.log('pushing new task');
        const api_body = {
            name: "Bop",
            origin: a[3],
            place: a[2],
            user_request: a[0],
            req_type: 1
        }
        //tasks = await axios.get("http://localhost:8000/api");

        result = await fetch("http://localhost:8000/api", {
            method: "POST",
            body: JSON.stringify(api_body),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then((value) => {
            console.log(value)
        }).catch((error) => {
            console.log(error)
        });
        console.log('pushing successful');
        //const whatwhat = await tasks.json();
        result = await result.json();
        //console.log(response);
        console.log(result);
    }


    const getTaskInfo = () => {
        return tasks;
    };

    const taskListStyle = {
        position: 'absolute',
        top: 0,
        right: 0,
        zIndex: 2,
        padding: '10px',
        border: '1px solid #333', // Darker border color
        background: '#333', // Dark background color
        color: 'white', // White text color
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    };

    const sortedTasks = [...tasks].sort((a, b) => a[1].localeCompare(b[1]));

    return (
        <div style={taskListStyle}>
            <div className="div-block-3">
                <Autocomplete>
                    <input className="input_box" type='text' placeholder={`Where are you?`} ref={newLocation}/>
                </Autocomplete>
            </div>
            <input
                type="text"
                placeholder="Enter a new task"
                onChange={(e) => setNewTask(e.target.value)}
                value={newTask}
                style={{background: 'transparent', color: 'white'}} // Input style
            />
            <div className="div-block-3">
                <Autocomplete>
                    <input className="input_box" type='text' placeholder={`Where is the task?`} ref={newDestination}/>
                </Autocomplete>
            </div>
            <button onClick={addTask} style={{background: 'rgba(0, 0, 0, 0.7)', color: 'white'}}>
                Add Task
            </button>
            {/* Button style */}
            <div className="task-list">
                {sortedTasks.map((task, index) => (
                    <TaskItem
                        key={task[0]}
                        task={task[0]}
                        address={task[2]}
                        removeTask={() => updateTask(task[0])}
                        index={index}
                    ></TaskItem>
                ))}

            </div>
        </div>
    );
}

export default TaskList;