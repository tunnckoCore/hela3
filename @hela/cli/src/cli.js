import main from '.';

main()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('Failed command:', err.commandName);

    if (err.commandArgv && err.commandArgv['show-stack']) {
      console.error('Error stack:', err.stack);
    } else {
      console.error(`${err.name}:`, err.message);
    }

    process.exit(1);
  });
