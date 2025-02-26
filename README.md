## Edit the character files

Open `src/character.ts` to modify the default character. Uncomment and edit.

### Custom characters

To load custom characters instead:

- Use `pnpm start --characters="path/to/your/character.json"`
- Multiple character files can be loaded simultaneously

### Add clients

```
clients: [Clients.TWITTER, Clients.DISCORD],
```

## Duplicate the .env.example template

```bash
cp .env.example .env
```

\* Fill out the .env file with your own values.

## Install dependencies

```bash
pnpm i
```

After this you may see a notification that several packages with build scripts were found, and build scripts were not run. 
If you see this then run the following commands:
`pnpm approve-builds`

It will give you a menu of all the packages to approve. You can just type `a` and it will select all.  Then type `Y` as per the prompt.

Note: this requires node to be at least version 22 when you install packages and run the agent.
