import server from "./app";

const port = process.env.PORT || 3000;

// eslint-disable-next-line no-console
server.listen(port, () => console.info(`Server running on port ${port}`));
