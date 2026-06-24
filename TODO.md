# TODO - ChatGPT-like webpage (Z.AI)

- [ ] Inspect current repo files (chat.html, index.js, style.css, package.json)
- [ ] Convert backend: replace CLI `index.js` with an Express server exposing `POST /api/chat` and serving `chat.html`
- [ ] Add dependency `express` and update `npm start` script
- [ ] Implement system instruction rule (programming-only, one-line response)
- [ ] Standardize auth on `Z_AI_API_KEY` for the Z.AI API
- [ ] Frontend: redesign `chat.html` into a ChatGPT-like UI (message list, input bar, loading indicator)
- [ ] Frontend JS: send messages via `fetch('/chat')` and render assistant replies
- [ ] Add styling in `style.css`
- [ ] Update `package.json` to add `express` and correct start script
- [x] Install dependencies and run server


- [x] Quick manual test: send a programming question and verify response
- [x] Start server (npm start)
- [x] Install dependencies

