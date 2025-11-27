# 🚀 KIMU Transport & Multiservices - Vercel Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI**: Install globally with `npm install -g vercel`
3. **Database**: Turso (libSQL) database (already configured)
4. **Environment Variables**: Set up in Vercel dashboard

## Environment Variables Setup

In your Vercel dashboard, add these environment variables:

```bash
# Database
TURSO_DATABASE_URL=libsql://your-db-name.turso.io
TURSO_AUTH_TOKEN=your-turso-auth-token

# JWT Secret (generate a strong secret)
JWT_SECRET=your-super-secure-jwt-secret-here

# Node Environment
NODE_ENV=production

# Optional: Email service (if using Resend)
RESEND_API_KEY=your-resend-api-key

# Optional: Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your-analytics-id
```

## Deployment Steps

### Method 1: Using Vercel CLI (Recommended)

1. **Login to Vercel**:
   ```bash
   vercel login
   ```

2. **Deploy**:
   ```bash
   vercel --prod
   ```

3. **Follow the prompts**:
   - Link to existing project or create new
   - Confirm build settings
   - Set environment variables

### Method 2: Using Git Integration

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Deploy to Vercel"
   git push origin main
   ```

2. **Connect in Vercel Dashboard**:
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import from GitHub
   - Select your repository
   - Configure build settings

### Method 3: Using Deployment Scripts

**Windows**:
```bash
scripts\deploy-vercel.bat
```

**Linux/Mac**:
```bash
chmod +x scripts/deploy-vercel.sh
./scripts/deploy-vercel.sh
```

## Build Configuration

The project is configured with:

- **Framework**: Next.js 15
- **Build Command**: `npm run vercel-build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

## Database Migration

After deployment, run database migrations:

```bash
vercel env pull .env.local
npx prisma db push
npx prisma generate
```

## Post-Deployment Checklist

- [ ] Environment variables set correctly
- [ ] Database connection working
- [ ] Authentication working
- [ ] All API endpoints responding
- [ ] Static assets loading
- [ ] SSL certificate active
- [ ] Custom domain configured (if needed)

## Troubleshooting

### Database Connection Issues

If you see Turso/libSQL connection errors:

1. **Check Credentials**: Ensure `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` are correct
2. **Check Database Status**: Verify your database is active in the Turso dashboard
3. **Check Region**: Ensure your Turso database region is close to your Vercel deployment region

### Build Failures

1. **Check Node Version**: Ensure Node.js 18+ is used
2. **Clear Cache**: Try `vercel --force` to rebuild
3. **Check Dependencies**: Ensure all packages are compatible

### Performance Issues

1. **Enable Edge Functions**: For better performance
2. **Optimize Images**: Use Next.js Image component
3. **Enable Caching**: Configure appropriate cache headers

## Monitoring

- **Vercel Analytics**: Built-in performance monitoring
- **Function Logs**: Check serverless function logs
- **Database Monitoring**: Monitor Turso database usage

## Security

- **Environment Variables**: Never commit secrets to Git
- **HTTPS**: Automatically enabled on Vercel
- **Security Headers**: Configured in `vercel.json`
- **CSP**: Content Security Policy enabled

## Support

For deployment issues:
1. Check Vercel documentation
2. Review function logs in Vercel dashboard
3. Test locally with `vercel dev`
4. Contact Vercel support if needed

---

