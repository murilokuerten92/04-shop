declare namespace NodeJS {
    interface ProcessEnv {
        // Add your environment variables here
        STRIPE_PUBLIC_KEY: string;
        STRIPE_SECRET_KEY: string;
        // ...
    }
}