import { app } from './app';
import { ENV } from './config/env';

const server = app.listen(ENV.PORT, () => {
  console.log(`🎯 QuestBoard Server running on http://localhost:${ENV.PORT}`);
  console.log(`🎓 Allowed email domain: ${ENV.ALLOWED_EMAIL_DOMAINS.join(', ')}`);
});

export default server;
