using 'main.bicep'

param location = 'southeastasia'
param environmentName = 'adorio-prod-env'
param registryName = 'adorioacr'
param containerAppName = 'adorio'
param deployIdentityName = 'adorio-github-deploy-identity'
param githubRepo = 'Mykal-Steele/Adorio'

param clientUrl = 'https://adorio.space'

// Values below are read from the environment at deploy time and never committed.
// Apply with `node infra/deploy.mjs`, which loads them from .env.production and sets
// CONTAINER_IMAGE to the image running now. No default on purpose, see main.bicep.
param containerImage = readEnvironmentVariable('CONTAINER_IMAGE')
param cloudinaryName = readEnvironmentVariable('CLOUDINARY_NAME')
param mongoUri = readEnvironmentVariable('MONGO_URI')
param jwtSecret = readEnvironmentVariable('JWT_SECRET')
param refreshTokenSecret = readEnvironmentVariable('REFRESH_TOKEN_SECRET')
param cloudinaryKey = readEnvironmentVariable('CLOUDINARY_KEY')
param cloudinarySecret = readEnvironmentVariable('CLOUDINARY_SECRET')
param cloudinaryUrl = readEnvironmentVariable('CLOUDINARY_URL')
param resendApiKey = readEnvironmentVariable('RESEND_API_KEY')
param pistonUrl = readEnvironmentVariable('PISTON_URL')
param pistonToken = readEnvironmentVariable('PISTON_TOKEN')
param pistonCaCert = readEnvironmentVariable('PISTON_CA_CERT')

// On-demand control of the Piston VM. Both resources are created by
// piston.bicep. Remove these two lines to deploy without it.
param pistonVmName = 'adorio-piston-vm'
param runnerControlIdentityName = 'adorio-piston-control-identity'

// Cloudflare R2 file hosting. Defaults to '' so a deploy with these unset
// simply leaves the feature off. Export the three vars before deploying to
// turn it on.
param r2AccountId = readEnvironmentVariable('R2_ACCOUNT_ID', '')
param r2AccessKeyId = readEnvironmentVariable('R2_ACCESS_KEY_ID', '')
param r2SecretAccessKey = readEnvironmentVariable('R2_SECRET_ACCESS_KEY', '')
param r2Bucket = readEnvironmentVariable('R2_BUCKET', 'adorio-hosted')
param r2PublicUrl = readEnvironmentVariable('R2_PUBLIC_URL', 'https://files.adorio.space')

// Cloudflare Turnstile bot check on uploads. Defaults to '' so a deploy with
// these unset leaves the check off.
param turnstileSiteKey = readEnvironmentVariable('TURNSTILE_SITE_KEY', '')
param turnstileSecretKey = readEnvironmentVariable('TURNSTILE_SECRET_KEY', '')
param hostedStorageLimitBytes = readEnvironmentVariable('HOSTED_STORAGE_LIMIT_BYTES', '9663676416')
