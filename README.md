# Secret Text Communicator (beta)
This app is built for sharing passwords or secret text with whoever in a more secure way than email without adding any extra steps for clients.

The link you share can only be lived once. All passwords live encrypted in memory.

All passwords expire in 7 days regardless of where they are hosted.

###Simple Heroku Deployment
If on the Heroku free tier, your server will automatically shut off after 30 minutes of inactivity, in effect, stopping the node process and clearing all saved passwords. This is either desirable or undesirable depending on your use-case.

1. Deploy to heroku and create a `NODE_ENV` environment variable set to `production`
1. Visit your app at the Heroku URL.

### Development
- Self explanitory

### Dependencies
- NodeJS 4.3.1
