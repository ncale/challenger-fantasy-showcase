import { addDefaultGames } from "../packages/adapters/src/add-default-games";

await addDefaultGames({}).then((result) => {
  console.log({ result }, "add-default-games.done");
});

console.log("complete");
