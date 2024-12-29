import express, { type Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRouter from './src/routes/users';
import workspaceRouter from './src/routes/workspaces';
import testRouter from './src/routes/tests';

dotenv.config();

const app: Application = express();
const port: string | undefined = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({
  origin: ["http://localhost:5173"],
  methods: ['get', 'post', 'put', 'delete'],
  credentials: true
}));
app.options('*', cors());

app.use('/user', userRouter);
app.use('/workspace', workspaceRouter);
app.use('/test', testRouter);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

export default app;
