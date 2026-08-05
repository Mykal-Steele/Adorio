using 'main.bicep'

param location = 'southeastasia'
param environmentName = 'adorio-prod-env'
param registryName = 'adorioacr'
param containerAppName = 'adorio'
param deployIdentityName = 'adorio-github-deploy-identity'
param githubRepo = 'Mykal-Steele/Adorio'

param clientUrl = 'https://adorio.space'

// Values below are read from the shell environment at deploy time — never committed.
// Source them from backend/.env (or export directly) before running `az deployment group create`.
param cloudinaryName = readEnvironmentVariable('CLOUDINARY_NAME')
param mongoUri = readEnvironmentVariable('MONGO_URI')
param jwtSecret = readEnvironmentVariable('JWT_SECRET')
param refreshTokenSecret = readEnvironmentVariable('REFRESH_TOKEN_SECRET')
param cloudinaryKey = readEnvironmentVariable('CLOUDINARY_KEY')
param cloudinarySecret = readEnvironmentVariable('CLOUDINARY_SECRET')
param cloudinaryUrl = readEnvironmentVariable('CLOUDINARY_URL')
param resendApiKey = readEnvironmentVariable('RESEND_API_KEY')
