import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    image: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    mobile: {
        type: String,
        required: true,
        trim: true,
        match: [/^\d{10}$/, 'Please enter a valid 10-digit mobile number']
    },
    designation: {
        type: String,
        required: true,
        enum: ['HR', 'Manager', 'Sales']
    },
    gender: {
        type: String,
        required: true,
        enum: ['M', 'F']
    },
    course: [{
        type: String,
        enum: ['MCA', 'BCA', 'BSC']
    }],
    createDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Create index for search functionality
employeeSchema.index({ name: 'text', email: 'text', designation: 'text' });

// Virtual for employee's URL
employeeSchema.virtual('url').get(function() {
    return `/employees/${this._id}`;
});

// Pre-save middleware to ensure at least one course is selected
employeeSchema.pre('save', function(next) {
    if (this.course && this.course.length > 0) {
        next();
    } else {
        next(new Error('At least one course must be selected'));
    }
});

export const Employee = mongoose.model('Employee', employeeSchema);
