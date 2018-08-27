import React from 'react';
import { updateTask, deleteTask } from '../firebase'

export default class Task extends React.Component {

    constructor(props) {
        super(props);

    }

    render() {

        const { task, taskId, listId } = this.props;
        if (task.checked && task.done === false) {
            setTimeout(() => updateTask(listId, taskId, { done: true }), 1000);
        }

        return (
            <div className="task">
                <span className="task-text" onClick={() => updateTask(listId, taskId, { checked: !task.checked })}>
                    {task.checked ?
                        <i className="fa fa-check-circle hover-scale" /> :
                        <i className="fa fa-circle-o hover-scale" />}
                    <span style={{ paddingLeft: '1rem', textDecoration: task.checked ? 'line-through' : 'none' }}>
                        {task.task}
                    </span>
                </span>
            </div>
        )
    }
}