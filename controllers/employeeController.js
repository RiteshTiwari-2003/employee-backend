import { Employee } from '../models/Employee.js';

// Create new employee
export const createEmployee = async (req, res) => {
    try {
        const { name, email, mobile, designation, gender, course } = req.body;
        const image = req.file;

        // Server-side validation
        if (!name || !email || !mobile || !designation || !gender || !course || !image) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        // Mobile validation
        const mobileRegex = /^\d{10}$/;
        if (!mobileRegex.test(mobile)) {
            return res.status(400).json({ message: 'Invalid mobile number' });
        }

        // Check duplicate email
        const existingEmployee = await Employee.findOne({ email });
        if (existingEmployee) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // Validate image type
        if (!image.mimetype || !['image/jpeg', 'image/png'].includes(image.mimetype)) {
            return res.status(400).json({ message: 'Only JPG/PNG files are allowed' });
        }

        // Create employee
        const employee = new Employee({
            id: Date.now().toString(), // Add auto-generated ID
            name,
            email,
            mobile,
            designation,
            gender,
            course: Array.isArray(course) ? course : [course],
            image: `/uploads/${image.filename}`,
            createDate: new Date()
        });

        await employee.save();
        res.status(201).json(employee);
    } catch (error) {
        console.error('Error creating employee:', error);
        res.status(500).json({ message: 'Error creating employee' });
    }
};

// Get all employees with pagination and search
export const getEmployees = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';

        const query = search
            ? {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { designation: { $regex: search, $options: 'i' } }
                ]
            }
            : {};

        const total = await Employee.countDocuments(query);
        const employees = await Employee.find(query)
            .sort({ createDate: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        res.json({
            employees,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        console.error('Error getting employees:', error);
        res.status(500).json({ message: 'Error getting employees' });
    }
};

// Get single employee
export const getEmployee = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.json(employee);
    } catch (error) {
        console.error('Error getting employee:', error);
        res.status(500).json({ message: 'Error getting employee' });
    }
};

// Update employee
export const updateEmployee = async (req, res) => {
    try {
        const { name, email, mobile, designation, gender, course } = req.body;
        const image = req.file;

        // Find employee
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email && !emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        // Mobile validation
        const mobileRegex = /^\d{10}$/;
        if (mobile && !mobileRegex.test(mobile)) {
            return res.status(400).json({ message: 'Invalid mobile number' });
        }

        // Check duplicate email
        if (email && email !== employee.email) {
            const existingEmployee = await Employee.findOne({ email });
            if (existingEmployee) {
                return res.status(400).json({ message: 'Email already exists' });
            }
        }

        // Validate image if provided
        if (image) {
            if (!image.mimetype || !['image/jpeg', 'image/png'].includes(image.mimetype)) {
                return res.status(400).json({ message: 'Only JPG/PNG files are allowed' });
            }
        }

        // Update employee
        employee.name = name || employee.name;
        employee.email = email || employee.email;
        employee.mobile = mobile || employee.mobile;
        employee.designation = designation || employee.designation;
        employee.gender = gender || employee.gender;
        employee.course = Array.isArray(course) ? course : [course];
        if (image) {
            employee.image = `/uploads/${image.filename}`;
        }

        await employee.save();
        res.json(employee);
    } catch (error) {
        console.error('Error updating employee:', error);
        res.status(500).json({ message: 'Error updating employee' });
    }
};

// Delete employee
export const deleteEmployee = async (req, res) => {
    try {
        const employee = await Employee.findByIdAndDelete(req.params.id);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.json({ message: 'Employee deleted successfully' });
    } catch (error) {
        console.error('Error deleting employee:', error);
        res.status(500).json({ message: 'Error deleting employee' });
    }
};
