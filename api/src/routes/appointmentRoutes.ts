import { Router } from 'express';
import {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointmentStatus,
  deleteAppointment
} from '../controllers/appointmentController';

const router = Router();

// GET /api/appointments - Get all appointments
router.get('/', getAllAppointments);

// GET /api/appointments/:id - Get single appointment
router.get('/:id', getAppointmentById);

// POST /api/appointments - Create new appointment
router.post('/', createAppointment);

// PATCH /api/appointments/:id/status - Update appointment status
router.patch('/:id/status', updateAppointmentStatus);

// DELETE /api/appointments/:id - Delete appointment
router.delete('/:id', deleteAppointment);

export default router;






