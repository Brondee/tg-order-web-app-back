const whiteList = [
  'http://localhost:3000',
  'https://6457db2d15dd340008762b73--superlative-dango-7e09cd.netlify.app',
];
const corsOptions = {
  origin: (origin, callback) => {
    if (whiteList.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('not allowed by cors'));
    }
  },
  optionsSuccessStatus: 200,
};

export default corsOptions;
