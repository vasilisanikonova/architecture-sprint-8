import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import reportsRouter from '../routes/reports'

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

app.use('/reports', reportsRouter);

app.get('/', (req, res) => {
    res.send('BionicPRO Reports API is running');
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});