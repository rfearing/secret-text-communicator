# Secret Text Communicator (beta)
This app is built for sharing passwords or secret text with whoever in a more secure way than email without adding complex extra steps or account creations.

The link you share can only be viewed once. All passwords live encrypted in memory.

All passwords expire in 7 days regardless of where they are hosted.

You can see a live example <a href="https://enigmatic-meadow-28475.herokuapp.com/" target="_blank">here</a>

###Simple Heroku Deployment
If on the Heroku free tier, your server will automatically shut off after 30 minutes of inactivity, in effect, stopping the node process and clearing all saved passwords. This is either desirable or undesirable depending on your use-case.

1. Deploy to heroku and create a `NODE_ENV` environment variable set to `production`
1. Visit your app at the Heroku URL.

###Standard Deployment
1. Use Google. lol.

### Development
- Run `npm install`
- Run `npm start`

### Dependencies
- NodeJS 4.3.1

### Disclaimers
- The live example is just for demonstration purposes. I recommend installing on your own server.