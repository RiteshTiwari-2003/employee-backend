import express from 'express';
import multer from 'multer';
import {
    createEmployee,
    getEmployees,
    getEmployee,
    updateEmployee,
    deleteEmployee
} from '../controllers/employeeController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error('Only .jpg and .png format allowed!'));
        }
    }
});

// Protected routes
router.use(verifyToken);

router.post('/', upload.single('image'), createEmployee);
router.get('/', getEmployees);
router.get('/:id', getEmployee);
router.put('/:id', upload.single('image'), updateEmployee);
router.delete('/:id', deleteEmployee);

export default router;
