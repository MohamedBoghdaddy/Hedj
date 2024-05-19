import React, { useState, useEffect } from "react";
import "../../Styles/lists.css"
const AppointmentList = () => {
    const [appointments, setAppointments] = useState(() => {
        const savedAppointments = localStorage.getItem('appointments');
        return savedAppointments ? JSON.parse(savedAppointments) : [];
    });

    useEffect(() => {
        localStorage.setItem('appointments', JSON.stringify(appointments));
    }, [appointments]);

    const [showAddForm, setShowAddForm] = useState(false);
    const [showUpdateForm, setShowUpdateForm] = useState({ index: null, show: false });

    const handleUpdate = (index) => {
        setShowUpdateForm({ index, show: true });
    };

    const handleDelete = (index) => {
        const updatedAppointments = [...appointments];
        updatedAppointments.splice(index, 1);
        setAppointments(updatedAppointments);
    };

    const handleAdd = () => {
        setShowAddForm(true);
    };

    const handleAddSubmit = (newAppointment) => {
        setAppointments([...appointments, newAppointment]);
        setShowAddForm(false);
    };

    const handleUpdateSubmit = (index, updatedAppointment) => {
        const updatedAppointments = [...appointments];
        updatedAppointments[index] = updatedAppointment;
        setAppointments(updatedAppointments);
        setShowUpdateForm({ index: null, show: false });
    };

    return (
        <div className="appointmentsList">
            <div className="listheader">
                <h3>Appointments</h3>
                <button className="add" onClick={() => handleAdd()}>+ Add</button>
            </div>
            {showAddForm && (
                <AppointmentForm onSubmit={handleAddSubmit} onCancel={() => setShowAddForm(false)} />
            )}
            {showUpdateForm.show && (
                <AppointmentForm
                    appointment={appointments[showUpdateForm.index]}
                    onSubmit={(updatedAppointment) => handleUpdateSubmit(showUpdateForm.index, updatedAppointment)}
                    onCancel={() => setShowUpdateForm({ index: null, show: false })}
                />
            )}
            <table className="listcontainer">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {appointments.map((appointment, index) => (
                        <tr key={index}>
                            <td>{appointment.title}</td>
                            <td>{appointment.date}</td>
                            <td>{appointment.time}</td>
                            <td>
                                <button className="button update" onClick={() => handleUpdate(index)}>Update</button>
                                <button className="button delete" onClick={() => handleDelete(index)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const AppointmentForm = ({ appointment = { title: "", date: "", time: "" }, onSubmit, onCancel }) => {
    const [title, setTitle] = useState(appointment.title);
    const [date, setDate] = useState(appointment.date);
    const [time, setTime] = useState(appointment.time);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ title, date, time });
    };

    return (
        <form onSubmit={handleSubmit} className="formapp">
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} placeholder="Date" />
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} placeholder="Time" />
            <button type="submit">Submit</button>
            <button type="button" onClick={onCancel}>Cancel</button>
        </form>
    );
};

export default AppointmentList;
