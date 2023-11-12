import React, {useState} from 'react';

function TaskItem({task, index, address, removeTask}) {

    const taskItemStyle = {
        color: 'white',
        background: 'rgba(0, 0, 0, 0.3)',
        padding: '5px',
        margin: '10px 0',
        borderRadius: '4px',
    };

    const acceptButtonStyle = {
        background: 'Red',
        color: 'white',
        border: 'none',
        padding: '5px 10px',
        marginLeft: '10px',
        cursor: 'pointer',
    };
    const pendingButtonStyle = {
        background: 'yellow',
        color: 'black',
        border: 'none',
        padding: '5px 10px',
        marginLeft: '10px',
        cursor: 'pointer',
    };

    const [status, setStatus] = useState('waiting'); // Initialize with 'pending'
    const click = () => {
        if (status === 'waiting') {
            setStatus('pending');
        } else {
            removeTask();
        }
    };


    return (
        <div className="task-item" key={index} style={taskItemStyle}>
            <div>
                <strong>Task: </strong>
                {task}
            </div>
            <div>
                <strong>Address: </strong> {address}
            </div>
            <div>
                {status === 'waiting' && (
                    <button onClick={click} style={acceptButtonStyle}>
                        Accept Task!
                    </button>
                )}
                {status === 'pending' && (
                    <button onClick={click} style={pendingButtonStyle}>
                        Pending...
                    </button>
                )}
                {status === 'done' && (
                    <button onClick={click} style={pendingButtonStyle}>
                        Done!
                    </button>
                )}
            </div>
        </div>

    );
}

export default TaskItem;
