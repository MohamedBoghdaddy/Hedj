import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
    fname: {
        type: String,
        required: true
    },
    lname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true  // Ensure uniqueness
    },
    department: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["readonly", "admin"],
        default: "readonly",
        required: true
    }
});

export default mongoose.model('Employee', employeeSchema);
