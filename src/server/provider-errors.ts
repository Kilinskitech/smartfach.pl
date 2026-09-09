// Only a definitive upstream rejection is safe to release automatically.
export class ProviderRejectedError extends Error {}

// A response arrived but cannot be shown. The operator absorbs provider cost;
// release the user's reservation without retrying another paid generation.
export class ProviderOutputError extends Error {}
