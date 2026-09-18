import express from 'express';
import cors from 'cors';
import { seedDatabase } from './seed';
import authRoutes from './routes/auth';
import employeeRoutes from './routes/employees';
import contractRoutes from './routes/contracts';
import attendanceRoutes from './routes/attendance';
import timeoffRoutes from './routes/timeoff';
import salaryRulesRoutes from './routes/salaryRules';
import payrunRoutes from './routes/payruns';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize & Seed Database
seedDatabase();

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/timeoff', timeoffRoutes);
app.use('/api/salary-rules', salaryRulesRoutes);
app.use('/api/payruns', payrunRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`✓ PeoplePay360 backend server running on http://localhost:${PORT}`);
});
