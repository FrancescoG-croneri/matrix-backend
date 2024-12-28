import createError from 'http-errors';
import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
import userRouter from './routes/users.js';
import workspaceRouter from './routes/workspaces.js';
import testRouter from './routes/tests.js';

const app = express();

dotenv.config();
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors({
  origin: ["http://localhost:5173"],
  methods: ['get', 'post', 'put', 'delete'],
  credentials: true
}));
app.options('*', cors());

app.use('/user', userRouter);
app.use('/workspace', workspaceRouter);
app.use('/test', testRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({ message: 'Error in the backend' });
});

export default app;
