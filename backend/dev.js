import app from './src/app.js';

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`[Express API] Server is running at http://localhost:${PORT}`);
  console.log(`[Express API] Health check available at http://localhost:${PORT}/api/v1/health`);
});
