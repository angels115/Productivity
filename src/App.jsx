import React, { useState, useEffect, useReducer, useContext, createContext } from 'react';

// --- Mock Icons (Using simple text/SVG placeholders as Tailwind is removed) ---
// You might want to install an icon library like 'react-icons' for better icons
const TargetIcon = () => <span>🎯</span>;
const CheckCircleIcon = () => <span>✅</span>;
const ListIcon = () => <span>📋</span>;
const ClockIcon = () => <span>⏰</span>;
const ZapIcon = () => <span>⚡</span>;
const EditIcon = () => <span>✏️</span>;
const TrashIcon = () => <span>🗑️</span>;
const StarIcon = () => <span>⭐</span>;
const StarOffIcon = () => <span>☆</span>;
const PlusCircleIcon = () => <span>⊕</span>;
const RefreshCwIcon = () => <span>🔄</span>;
const BookOpenIcon = () => <span>📖</span>;

// --- Basic Styling Objects (Inline Styles) ---
// Reverted to the version without maxWidth and centering on gridContainer
// Also removed height: 100% and flexGrow: 1 from card/cardContent
const styles = {
    // Layout
    appContainer: { backgroundColor: '#f9fafb', minHeight: '100vh', padding: '2rem', fontFamily: 'sans-serif' },
    header: { marginBottom: '2rem', textAlign: 'center' },
    gridContainer: { display: 'grid', gridTemplateColumns: 'repeat(1, minmax(0, 1fr))', gap: '1.5rem' }, // Reverted gridContainer
    // Card Styles
    card: { backgroundColor: 'white', borderRadius: '0.5rem', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', padding: '1.5rem' }, // Reverted card style
    cardHeader: { marginBottom: '1rem' },
    cardTitle: { fontSize: '1.125rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' },
    cardDescription: { fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' },
    cardContent: {}, // Reverted cardContent style
    cardFooter: { marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' },
    // Form Elements
    input: { display: 'block', width: 'calc(100% - 1.5rem)', /* Adjust for padding */ padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.875rem', marginBottom: '0.5rem' },
    textarea: { display: 'block', width: 'calc(100% - 1.5rem)', minHeight: '80px', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.875rem', marginBottom: '0.5rem' },
    select: { display: 'block', width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.875rem', marginBottom: '0.5rem', height: '2.5rem' }, // Added height
    button: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '0.375rem', fontSize: '0.875rem', fontWeight: '500', padding: '0.5rem 1rem', cursor: 'pointer', border: '1px solid transparent', transition: 'colors 0.2s' },
    buttonDefault: { backgroundColor: '#1f2937', color: 'white', border: '1px solid #1f2937' },
    buttonGhost: { backgroundColor: 'transparent', color: '#374151' },
    buttonIcon: { padding: '0.25rem', height: 'auto', width: 'auto', border: 'none' }, // Simplified icon button
    label: { fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem', display: 'block' },
    checkbox: { width: '1rem', height: '1rem', marginRight: '0.5rem', cursor: 'pointer' },
    // List Items
    listItem: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #d1d5db', marginBottom: '0.75rem' },
    listItemCompleted: { opacity: 0.7, backgroundColor: '#f9fafb' },
    // Progress Bar
    progressContainer: { position: 'relative', height: '0.5rem', width: '100%', overflow: 'hidden', borderRadius: '9999px', backgroundColor: '#e5e7eb' },
    progressBar: { height: '100%', width: '100%', backgroundColor: '#1f2937', transition: 'transform 0.3s' },
    // Utility
    flex: { display: 'flex' },
    gap2: { gap: '0.5rem' },
    itemsCenter: { alignItems: 'center' },
    justifyBetween: { justifyContent: 'spaceBetween' },
    flexGrow: { flexGrow: 1 },
    textSm: { fontSize: '0.875rem' },
    textXs: { fontSize: '0.75rem' },
    textGray500: { color: '#6b7280' },
    fontSemibold: { fontWeight: '600' },
    mt1: { marginTop: '0.25rem' },
    mt2: { marginTop: '0.5rem' },
    mb2: { marginBottom: '0.5rem' },
    mb4: { marginBottom: '1rem' },
    spaceY2: { '> * + *': { marginTop: '0.5rem' } }, // Basic spacing between children
    spaceY3: { '> * + *': { marginTop: '0.75rem' } },
    spaceY4: { '> * + *': { marginTop: '1rem' } },
    mlAuto: { marginLeft: 'auto' },
    italic: { fontStyle: 'italic' },
    lineThrough: { textDecoration: 'line-through' },
};

// --- Utility Functions ---
const generateId = () => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// --- State Management (Context + Reducer - unchanged) ---
const initialState = {
    goals: [],
    tasks: [],
    focusLogs: [],
    reflection: { energy: 3, wins: '', challenges: '', learnings: '' },
};

// --- Reducer (Unchanged) ---
function appReducer(state, action) {
    switch (action.type) {
        case 'LOAD_STATE':
            return action.payload || initialState;
        case 'ADD_GOAL':
            return { ...state, goals: [...state.goals, { id: generateId(), text: action.payload }] };
        case 'DELETE_GOAL':
            return { ...state, goals: state.goals.filter(g => g.id !== action.payload), tasks: state.tasks.map(t => t.linkedGoalId === action.payload ? { ...t, linkedGoalId: null } : t) };
        case 'ADD_TASK':
            return { ...state, tasks: [...state.tasks, { id: generateId(), text: action.payload.text, isPriority: false, isComplete: false, linkedGoalId: null, type: 'planned' }] };
         case 'EDIT_TASK':
            return { ...state, tasks: state.tasks.map(t => t.id === action.payload.id ? { ...t, ...action.payload.updates } : t) };
        case 'DELETE_TASK':
            return { ...state, tasks: state.tasks.filter(t => t.id !== action.payload) };
        case 'TOGGLE_TASK_COMPLETE':
            return { ...state, tasks: state.tasks.map(t => t.id === action.payload ? { ...t, isComplete: !t.isComplete } : t) };
        case 'TOGGLE_TASK_PRIORITY':
            return { ...state, tasks: state.tasks.map(t => t.id === action.payload ? { ...t, isPriority: !t.isPriority } : t) };
        case 'SET_TASK_TYPE':
             return { ...state, tasks: state.tasks.map(t => t.id === action.payload.id ? { ...t, type: action.payload.type } : t) };
        case 'LINK_TASK_GOAL':
             return { ...state, tasks: state.tasks.map(t => t.id === action.payload.id ? { ...t, linkedGoalId: action.payload.goalId } : t) };
        case 'ADD_FOCUS_LOG':
            return { ...state, focusLogs: [...state.focusLogs, { id: generateId(), ...action.payload }] };
        case 'DELETE_FOCUS_LOG':
            return { ...state, focusLogs: state.focusLogs.filter(f => f.id !== action.payload) };
        case 'UPDATE_REFLECTION':
            return { ...state, reflection: { ...state.reflection, ...action.payload } };
        default:
            return state;
    }
}

const AppContext = createContext();

const AppProvider = ({ children }) => {
    const [state, dispatch] = useReducer(appReducer, initialState);

    // Load state from localStorage on initial render
    useEffect(() => {
        const savedState = localStorage.getItem('productivityAppState');
        if (savedState) {
            try {
                dispatch({ type: 'LOAD_STATE', payload: JSON.parse(savedState) });
            } catch (error) {
                console.error("Failed to parse saved state:", error);
                localStorage.removeItem('productivityAppState'); // Clear corrupted state
            }
        }
    }, []);

    // Save state to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('productivityAppState', JSON.stringify(state));
    }, [state]);

    return (
        <AppContext.Provider value={{ state, dispatch }}>
            {children}
        </AppContext.Provider>
    );
};

// --- Components (Unchanged from the non-Tailwind version) ---

// Section: Weekly Goals
function WeeklyGoals() {
    const { state, dispatch } = useContext(AppContext);
    const [newGoal, setNewGoal] = useState('');

    const handleAddGoal = (e) => {
        e.preventDefault();
        if (newGoal.trim()) {
            dispatch({ type: 'ADD_GOAL', payload: newGoal.trim() });
            setNewGoal('');
        }
    };

    return (
        <div style={styles.card}>
            <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}><TargetIcon /> <span>Weekly Goals</span></h3>
                <p style={styles.cardDescription}>Define your key objectives for the week.</p>
            </div>
            <div style={styles.cardContent}>
                <form onSubmit={handleAddGoal} style={{...styles.flex, ...styles.gap2, ...styles.mb4}}>
                    <input
                        type="text"
                        placeholder="Enter a new goal..."
                        value={newGoal}
                        onChange={(e) => setNewGoal(e.target.value)}
                        style={{...styles.input, ...styles.flexGrow}}
                    />
                    <button type="submit" style={{...styles.button, ...styles.buttonDefault}}>Add Goal</button>
                </form>
                <ul style={styles.spaceY2}>
                    {state.goals.length === 0 && <li style={{...styles.textSm, ...styles.textGray500}}>No goals defined yet.</li>}
                    {state.goals.map(goal => (
                        <li key={goal.id} style={{...styles.flex, ...styles.justifyBetween, ...styles.itemsCenter, ...styles.textSm, padding: '0.5rem', backgroundColor: '#f9fafb', borderRadius: '0.25rem'}}>
                            <span>{goal.text}</span>
                            <button style={{...styles.button, ...styles.buttonGhost, ...styles.buttonIcon, color: '#6b7280'}} onClick={() => dispatch({ type: 'DELETE_GOAL', payload: goal.id })}>
                                <TrashIcon />
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

// Section: Tasks & Priorities
function TaskList() {
    const { state, dispatch } = useContext(AppContext);
    const [newTask, setNewTask] = useState('');
    const [editingTask, setEditingTask] = useState(null); // { id, text }
    const [editedText, setEditedText] = useState('');

    const handleAddTask = (e) => {
        e.preventDefault();
        if (newTask.trim()) {
            dispatch({ type: 'ADD_TASK', payload: { text: newTask.trim() } });
            setNewTask('');
        }
    };

    const handleStartEdit = (task) => {
        setEditingTask(task);
        setEditedText(task.text);
    };

    const handleSaveEdit = (id) => {
        if (editedText.trim()) {
             dispatch({ type: 'EDIT_TASK', payload: { id: id, updates: { text: editedText.trim() } } });
        }
        setEditingTask(null);
        setEditedText('');
    };

    const handleCancelEdit = () => {
        setEditingTask(null);
        setEditedText('');
    };

    const priorityTasks = state.tasks.filter(t => t.isPriority);
    const completedPriorityTasks = priorityTasks.filter(t => t.isComplete);
    const priorityCompletionRate = priorityTasks.length > 0
        ? Math.round((completedPriorityTasks.length / priorityTasks.length) * 100)
        : 0;

    return (
        <div style={styles.card}>
            <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}><ListIcon /> <span>Weekly Tasks</span></h3>
                <p style={styles.cardDescription}>Track your to-dos. Mark priorities and link them to goals.</p>
            </div>
            <div style={styles.cardContent}>
                <form onSubmit={handleAddTask} style={{...styles.flex, ...styles.gap2, ...styles.mb4}}>
                    <input
                        type="text"
                        placeholder="Enter a new task..."
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        style={{...styles.input, ...styles.flexGrow}}
                    />
                    <button type="submit" style={{...styles.button, ...styles.buttonDefault}}>Add Task</button>
                </form>
                {/* Removed max-height and scroll from here */}
                <ul style={styles.spaceY3}>
                   {state.tasks.length === 0 && <li style={{...styles.textSm, ...styles.textGray500}}>No tasks added yet.</li>}
                    {state.tasks.map(task => (
                        <li key={task.id} style={{...styles.listItem, ...(task.isComplete ? styles.listItemCompleted : {})}}>
                            <input
                                type="checkbox"
                                checked={task.isComplete}
                                onChange={() => dispatch({ type: 'TOGGLE_TASK_COMPLETE', payload: task.id })}
                                id={`task-${task.id}`}
                                style={styles.checkbox}
                            />
                            <div style={styles.flexGrow}>
                                {editingTask?.id === task.id ? (
                                    <input
                                        type="text"
                                        value={editedText}
                                        onChange={(e) => setEditedText(e.target.value)}
                                        onBlur={() => handleSaveEdit(task.id)} // Save on blur
                                        onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(task.id)}
                                        autoFocus
                                        style={{...styles.input, height: '1.5rem', fontSize: '0.875rem', marginBottom: 0}} // Smaller input for editing
                                    />
                                ) : (
                                    <label htmlFor={`task-${task.id}`} style={{...styles.textSm, ...(task.isComplete ? styles.lineThrough : {}), cursor: 'pointer'}}>
                                        {task.text}
                                    </label>
                                )}
                                 {/* Goal Linking & Type Setting */}
                                 <div style={{...styles.flex, ...styles.itemsCenter, ...styles.gap2, ...styles.mt1}}>
                                     <select
                                        value={task.linkedGoalId || ""}
                                        onChange={(e) => dispatch({ type: 'LINK_TASK_GOAL', payload: { id: task.id, goalId: e.target.value || null } })}
                                        style={{...styles.select, height: '1.75rem', fontSize: '0.75rem', padding: '0.25rem 0.5rem', width: 'auto', minWidth: '100px'}}
                                     >
                                         <option value="" style={styles.textGray500}>Link Goal...</option>
                                         {state.goals.map(goal => (
                                             <option key={goal.id} value={goal.id}>{goal.text.substring(0, 20)}{goal.text.length > 20 ? '...' : ''}</option>
                                         ))}
                                     </select>
                                     <select
                                        value={task.type}
                                        onChange={(e) => dispatch({ type: 'SET_TASK_TYPE', payload: { id: task.id, type: e.target.value } })}
                                        style={{...styles.select, height: '1.75rem', fontSize: '0.75rem', padding: '0.25rem 0.5rem', width: 'auto', minWidth: '90px'}}
                                     >
                                         <option value="planned">Planned</option>
                                         <option value="reactive">Reactive</option>
                                     </select>
                                 </div>
                            </div>

                            {/* Action Buttons */}
                            <div style={{...styles.flex, ...styles.itemsCenter, gap: '0.25rem', ...styles.mlAuto}}>
                                {!editingTask || editingTask.id !== task.id ? (
                                    <button style={{...styles.button, ...styles.buttonGhost, ...styles.buttonIcon}} onClick={() => handleStartEdit(task)}>
                                        <EditIcon />
                                    </button>
                                ) : (
                                     <button style={{...styles.button, ...styles.buttonGhost, ...styles.buttonIcon}} onClick={handleCancelEdit}>
                                        <span style={styles.textXs}>X</span> {/* Simple cancel */}
                                    </button>
                                )}
                                <button style={{...styles.button, ...styles.buttonGhost, ...styles.buttonIcon, color: task.isPriority ? '#f59e0b' : '#9ca3af'}} onClick={() => dispatch({ type: 'TOGGLE_TASK_PRIORITY', payload: task.id })}>
                                    {task.isPriority ? <StarIcon /> : <StarOffIcon />}
                                </button>
                                <button style={{...styles.button, ...styles.buttonGhost, ...styles.buttonIcon, color: '#9ca3af'}} onClick={() => dispatch({ type: 'DELETE_TASK', payload: task.id })}>
                                    <TrashIcon />
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            <div style={styles.cardFooter}>
                <div style={styles.textSm}>
                    <p style={styles.fontSemibold}>Priority Task Completion:</p>
                    <div style={{...styles.flex, ...styles.itemsCenter, ...styles.gap2, ...styles.mt1}}>
                        <div style={styles.progressContainer}>
                           <div style={{...styles.progressBar, transform: `translateX(-${100 - (priorityCompletionRate || 0)}%)` }} />
                        </div>
                        <span>{priorityCompletionRate}%</span>
                    </div>
                    <p style={{...styles.textXs, ...styles.textGray500, ...styles.mt1}}>{completedPriorityTasks.length} of {priorityTasks.length} priority tasks completed.</p>
                </div>
            </div>
        </div>
    );
}

// Section: Focus Logger
function FocusLogger() {
    const { state, dispatch } = useContext(AppContext);
    const [duration, setDuration] = useState(60); // Default to 60 minutes
    const [quality, setQuality] = useState(4); // Default quality
    const [notes, setNotes] = useState('');

    const handleAddLog = (e) => {
        e.preventDefault();
        if (duration > 0) {
            dispatch({ type: 'ADD_FOCUS_LOG', payload: { duration: Number(duration), quality: Number(quality), notes: notes.trim() } });
            // Reset form partially
            setNotes('');
        }
    };

    const totalFocusMinutes = state.focusLogs.reduce((sum, log) => sum + log.duration, 0);
    const totalFocusHours = (totalFocusMinutes / 60).toFixed(1);

    return (
        <div style={styles.card}>
            <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}><ClockIcon /> <span>Focus / Deep Work Log</span></h3>
                <p style={styles.cardDescription}>Log blocks of focused work time.</p>
            </div>
            <div style={styles.cardContent}>
                <form onSubmit={handleAddLog} style={{...styles.spaceY3, ...styles.mb4}}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem' }}>
                        <div>
                            <label htmlFor="duration" style={styles.label}>Duration (minutes)</label>
                            <input
                                id="duration"
                                type="number"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                min="1"
                                required
                                style={styles.input}
                            />
                        </div>
                        <div>
                            <label htmlFor="quality" style={styles.label}>Quality (1-5)</label>
                             <select
                                id="quality"
                                value={quality}
                                onChange={(e) => setQuality(e.target.value)}
                                required
                                style={styles.select}
                            >
                                <option value="5">5 (Excellent Focus)</option>
                                <option value="4">4 (Good Focus)</option>
                                <option value="3">3 (Moderate Focus)</option>
                                <option value="2">2 (Some Distractions)</option>
                                <option value="1">1 (Very Distracted)</option>
                            </select>
                        </div>
                    </div>
                     <div>
                        <label htmlFor="notes" style={styles.label}>Notes (Optional)</label>
                        <input
                            id="notes"
                            type="text"
                            placeholder="What did you work on?"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            style={styles.input}
                        />
                    </div>
                    <button type="submit" style={{...styles.button, ...styles.buttonDefault}}>Log Focus Session</button>
                </form>
                 <h4 style={{...styles.textSm, ...styles.fontSemibold, ...styles.mb2}}>Logged Sessions:</h4>
                 {/* Removed max-height and scroll from here */}
                 <ul style={styles.spaceY2}>
                     {state.focusLogs.length === 0 && <li style={{...styles.textSm, ...styles.textGray500}}>No focus sessions logged yet.</li>}
                     {state.focusLogs.map(log => (
                         <li key={log.id} style={{...styles.flex, ...styles.justifyBetween, alignItems: 'flex-start', ...styles.textXs, padding: '0.5rem', backgroundColor: '#f9fafb', borderRadius: '0.25rem'}}>
                             <div>
                                 <p><strong>{log.duration} min</strong> (Quality: {log.quality}/5)</p>
                                 {log.notes && <p style={{...styles.textGray500, ...styles.mt1, ...styles.italic}}> - {log.notes}</p>}
                             </div>
                             <button style={{...styles.button, ...styles.buttonGhost, ...styles.buttonIcon, color: '#9ca3af', flexShrink: 0}} onClick={() => dispatch({ type: 'DELETE_FOCUS_LOG', payload: log.id })}>
                                 <TrashIcon />
                             </button>
                         </li>
                     ))}
                 </ul>
            </div>
             <div style={styles.cardFooter}>
                <p style={{...styles.textSm, ...styles.fontSemibold}}>Total Focused Time: {totalFocusHours} hours ({totalFocusMinutes} minutes)</p>
            </div>
        </div>
    );
}

// Section: Work Balance
function WorkBalance() {
    const { state } = useContext(AppContext);
    const totalTasks = state.tasks.length;
    const plannedTasks = state.tasks.filter(t => t.type === 'planned').length;
    const reactiveTasks = state.tasks.filter(t => t.type === 'reactive').length;

    const plannedPercentage = totalTasks > 0 ? Math.round((plannedTasks / totalTasks) * 100) : 0;
    const reactivePercentage = totalTasks > 0 ? Math.round((reactiveTasks / totalTasks) * 100) : 0;

    // Custom progress bar colors
    const plannedProgressStyle = { ...styles.progressBar, backgroundColor: '#3b82f6', transform: `translateX(-${100 - (plannedPercentage || 0)}%)` };
    const reactiveProgressStyle = { ...styles.progressBar, backgroundColor: '#f97316', transform: `translateX(-${100 - (reactivePercentage || 0)}%)` };


    return (
        <div style={styles.card}>
            <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}><RefreshCwIcon /> <span>Work Balance</span></h3>
                <p style={styles.cardDescription}>Ratio of planned vs. reactive tasks completed.</p>
            </div>
            <div style={styles.cardContent}>
                {totalTasks === 0 ? (
                     <p style={{...styles.textSm, ...styles.textGray500}}>Categorize tasks as 'Planned' or 'Reactive' to see the balance.</p>
                ) : (
                    <div style={styles.spaceY2}>
                        <div style={{...styles.flex, ...styles.justifyBetween, ...styles.itemsCenter, ...styles.textSm}}>
                            <span>Planned Work</span>
                            <span style={styles.fontSemibold}>{plannedPercentage}%</span>
                        </div>
                         <div style={styles.progressContainer}>
                           <div style={plannedProgressStyle} />
                        </div>
                        <div style={{...styles.flex, ...styles.justifyBetween, ...styles.itemsCenter, ...styles.textSm, marginTop: '0.75rem'}}>
                            <span>Reactive Work</span>
                            <span style={styles.fontSemibold}>{reactivePercentage}%</span>
                        </div>
                         <div style={styles.progressContainer}>
                           <div style={reactiveProgressStyle} />
                        </div>
                         <p style={{...styles.textXs, ...styles.textGray500, ...styles.mt2}}>{plannedTasks} planned vs. {reactiveTasks} reactive tasks logged.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// Section: Weekly Reflection
function WeeklyReflection() {
    const { state, dispatch } = useContext(AppContext);
    const { energy, wins, challenges, learnings } = state.reflection;

    const handleInputChange = (field, value) => {
        dispatch({ type: 'UPDATE_REFLECTION', payload: { [field]: value } });
    };

    return (
        <div style={styles.card}>
            <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}><BookOpenIcon /> <span>End-of-Week Reflection</span></h3>
                <p style={styles.cardDescription}>Reflect on your energy, wins, and challenges.</p>
            </div>
            <div style={{...styles.cardContent, ...styles.spaceY4}}>
                <div>
                    <label htmlFor="energy" style={styles.label}>Energy Level (1-5)</label>
                     <select
                        id="energy"
                        value={energy}
                        onChange={(e) => handleInputChange('energy', Number(e.target.value))}
                        style={{...styles.select, ...styles.mt1}}
                    >
                        <option value="5">5 (Very High)</option>
                        <option value="4">4 (High)</option>
                        <option value="3">3 (Moderate)</option>
                        <option value="2">2 (Low)</option>
                        <option value="1">1 (Very Low)</option>
                    </select>
                </div>
                 <div>
                    <label htmlFor="wins" style={styles.label}>What went well this week? (Wins)</label>
                    <textarea
                        id="wins"
                        placeholder="List your accomplishments..."
                        value={wins}
                        onChange={(e) => handleInputChange('wins', e.target.value)}
                        style={{...styles.textarea, ...styles.mt1}}
                        rows={3}
                    />
                </div>
                 <div>
                    <label htmlFor="challenges" style={styles.label}>What were the main challenges?</label>
                    <textarea
                        id="challenges"
                        placeholder="Describe obstacles or difficulties..."
                        value={challenges}
                        onChange={(e) => handleInputChange('challenges', e.target.value)}
                         style={{...styles.textarea, ...styles.mt1}}
                         rows={3}
                    />
                </div>
                 <div>
                    <label htmlFor="learnings" style={styles.label}>What did you learn or could improve?</label>
                    <textarea
                        id="learnings"
                        placeholder="Identify key takeaways or areas for growth..."
                        value={learnings}
                        onChange={(e) => handleInputChange('learnings', e.target.value)}
                         style={{...styles.textarea, ...styles.mt1}}
                         rows={3}
                    />
                </div>
            </div>
        </div>
    );
}

// --- Main App Component ---
function App() {
    const today = new Date();
    // Adjust logic slightly to ensure Monday is day 1 for calculation
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const diff = today.getDate() - currentDay + (currentDay === 0 ? -6 : 1); // Adjust Sunday to previous week
    const weekStart = new Date(today.setDate(diff));
    const weekEnd = new Date(new Date(weekStart).setDate(weekStart.getDate() + 6));


    const formatDate = (date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    // Define media query for grid layout adjustment
    // Reverted breakpoint back to 1024px ('lg')
    const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);

    useEffect(() => {
        const handleResize = () => {
            setIsLargeScreen(window.innerWidth >= 1024); // Check for large screen size
        };
        window.addEventListener('resize', handleResize);
        // Cleanup listener on component unmount
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Dynamic grid style based on screen size
    // Reverted gridStyle to remove maxWidth and margin: auto
    const gridStyle = {
        ...styles.gridContainer,
        // Use 2 columns on large screens and up, 1 column below that
        gridTemplateColumns: isLargeScreen ? 'repeat(2, minmax(0, 1fr))' : 'repeat(1, minmax(0, 1fr))',
    };


    return (
        <AppProvider>
            <div style={styles.appContainer}>
                <header style={styles.header}>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#1f2937' }}>Weekly Productivity Coach</h1>
                    <p style={{ color: '#4b5563', marginTop: '0.25rem' }}>Week of: {formatDate(weekStart)} - {formatDate(weekEnd)}</p>
                     <p style={{...styles.textSm, ...styles.textGray500, ...styles.mt2, ...styles.italic}}>
                         Use the "Link Goal" option in tasks to track **Goal Alignment**. Review completed tasks linked to goals.
                     </p>
                </header>

                {/* Apply the reverted gridStyle here */}
                <div style={gridStyle}>
                    {/* Column 1 */}
                    <div style={styles.spaceY4}> {/* Use spaceY4 for consistent gap */}
                        <WeeklyGoals />
                        <TaskList />
                    </div>

                    {/* Column 2 */}
                    <div style={styles.spaceY4}> {/* Use spaceY4 for consistent gap */}
                        <FocusLogger />
                        <WorkBalance />
                        <WeeklyReflection />
                    </div>
                </div>

                 <footer style={{ textAlign: 'center', marginTop: '3rem', fontSize: '0.75rem', color: '#9ca3af' }}>
                    Productivity Coach App Concept (No Tailwind)
                 </footer>
            </div>
        </AppProvider>
    );
}

export default App;
