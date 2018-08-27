import React, { PureComponent } from 'react';
import { init as firebaseInit, addTask, watchTasks } from './firebase'
import './css/tasklist.css';
import './css/font-awesome-4.7.0/css/font-awesome.min.css';
import { Button } from 'react-bootstrap';
import _ from 'lodash';
import { VelocityTransitionGroup } from 'velocity-react';

import Modal from './components/Modal';
import Task from './components/Task';


/**
 * Main application component. Holds most of the application state. Responsible for communicating with the API.
 */
export default class TaskLister extends PureComponent {

    // Set the default starting state and bind this to all functions so this is defined.
    constructor(props) {
        super(props);
        firebaseInit();

        this.state = {
            lists: [],
            taskComponents: { tasks: [], done: [] },
            currentList: 'task-list',
            showNewModal: false,
            newTask: ''
        };
        this.watchListener = undefined;
    }
    componentDidMount() {

        const { currentList } = this.state;

        this.watchListener = watchTasks(this.state.currentList);
        this.watchListener
            .on('value', (snapshot) => {
                const tasks = snapshot.val();

                const taskComponents = tasks ?
                    Object.keys(tasks).reduce((result, task) => {
                        if (tasks[task].done === false)
                            result.tasks.push(<Task key={task} taskId={task} task={tasks[task]} listId={currentList} />)
                        else
                            result.done.push(<Task key={task} taskId={task} task={tasks[task]} listId={currentList} />)
                        return result
                    }, { tasks: [], done: [] })
                    : { tasks: [], done: [] };
                this.setState({ taskComponents: { tasks: taskComponents.tasks.reverse(), done: taskComponents.done } });

            });

    }

    toggleModal = toggle => {
        this.setState({ [toggle]: !this.state[toggle] })
    }

    handleChange = (target, value) => {
        this.setState({ [target]: value });
    }

    // Render method of the main app component
    render() {
        // State variable re-declaration for easier access
        const {
            lists,
            taskComponents,
            currentList,
            showNewModal,
            newTask
        } = this.state;

        // The modal dialog to show when a new stock is to be added
        const newModal = <Modal
            buttonOKText="Add"
            buttonCancelText="Cancel"
            id="newTask"
            title="Create task"
            closeButtonClick={() => { this.handleChange('newTask', ''); this.toggleModal('showNewModal') }}
            actionButtonClick={() => {
                this.handleChange('newTask', '');
                this.toggleModal('showNewModal');
                addTask(currentList, { task: newTask, checked: false, done: false, createDate: new Date().getTime() })
            }
            }
            disableSave={false} // Both inputs need to be set and api call not ongoing
        >
            What do you need to be done? <br /> <br />
            <input value={newTask} onChange={(e) => this.handleChange('newTask', e.target.value)} style={{ width: '100%' }} autoFocus />
        </Modal>;

        // The render method will return this rendered
        return (
            <div id="container" >
                <div id="header">
                    <div style={{display:'flex'}} ><h1>C to do:</h1><h5 style={{alignSelf: 'flex-end'}} >Global todos</h5></div>
                    <h1><i className="fa fa-bars hover-scale" /></h1>
                </div>
                <div id="content">
                    <VelocityTransitionGroup enter={{ animation: "slideDown" }} leave={{ animation: "slideUp" }} style={{ width: '100%' }}>
                        {taskComponents && taskComponents.tasks}
                    </VelocityTransitionGroup>
                </div>
                <div id="footer">
                    <Button bsStyle="primary" onClick={() => this.toggleModal('showNewModal')}>Add to-do</Button>
                </div>
                <VelocityTransitionGroup enter={{ animation: "slideDown" }} leave={{ animation: "slideUp" }}>
                    {showNewModal && newModal}
                </VelocityTransitionGroup>
                completed: {taskComponents && taskComponents.done.length}
            </div >
        );
    }

}
