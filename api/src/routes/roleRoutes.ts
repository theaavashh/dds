import express from 'express';
import {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  roleValidation
} from '../controllers/roleController';

const router = express.Router();

// Get all roles
router.get('/', getAllRoles);

// Get role by ID
router.get('/:id', getRoleById);

// Create role
router.post('/', roleValidation, createRole);

// Update role
router.put('/:id', roleValidation, updateRole);

// Delete role
router.delete('/:id', deleteRole);

export default router;






