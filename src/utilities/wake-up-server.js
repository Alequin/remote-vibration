import fetch from "node-fetch";

export const wakeUpServer = async () => {
  const response = await fetch(
    "https://remote-vibration-server.herokuapp.com/health"
  );

  if (response.status >= 400) {
    console.error(
      `There was an issue waking up the server: ${await response.text()}`
    );
  } else {
    console.log("The server is available");
  }
};
